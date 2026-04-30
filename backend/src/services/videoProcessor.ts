import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import Video from '../models/Video';
import Transcript, { TranscriptSegment } from '../models/Transcript';
import MCQ from '../models/MCQ';

// TypeScript interfaces
export interface Concept {
  title: string;
  question: string;
  options: string[];
  answer: 'A' | 'B' | 'C' | 'D';
}

export interface ProcessingResult {
  success: boolean;
  videoId: string;
  transcriptId?: string;
  mcqCount?: number;
  error?: string;
}

interface PythonMLResult {
  success: boolean;
  segments?: TranscriptSegment[];
  transcript?: string;
  mcqs?: Array<{
    concept: Concept;
    start: number;
    end: number;
  }>;
  error?: string;
}

/**
 * Call Python ML processor
 * @param videoPath Path to video file
 * @param audioPath Path where audio will be saved
 * @returns ML processing result
 */
const callPythonMLProcessor = async (
  videoPath: string,
  audioPath: string
): Promise<PythonMLResult> => {
  return new Promise((resolve, reject) => {
    // Choose processor based on mode
    const useGroqAPI = process.env.USE_GROQ_API === 'true';
    const useFastMode = process.env.USE_FAST_MODE === 'true';
    
    let pythonScript: string;
    let modeLabel: string;
    
    if (useGroqAPI) {
      pythonScript = path.join(__dirname, '../../ml_processor_groq.py');
      modeLabel = '🌐 Using GROQ API mode (Whisper + Groq Llama 3.3 70B)';
    } else if (useFastMode) {
      pythonScript = path.join(__dirname, '../../ml_processor_fast.py');
      modeLabel = '⚡ Using FAST mode (Whisper tiny + Flan-T5)';
    } else {
      pythonScript = path.join(__dirname, '../../ml_processor.py');
      modeLabel = '🐢 Using FULL mode (Whisper base + Mistral-7B)';
    }
    
    console.log(modeLabel);
    
    console.log('🐍 Calling Python ML processor...');
    console.log('Video path:', videoPath);
    console.log('Audio path:', audioPath);
    
    // Spawn Python process
    const python = spawn('python', [pythonScript, videoPath, audioPath]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
      // Log Python progress messages
      console.log('Python:', data.toString().trim());
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process failed with code:', code);
        console.error('stderr:', stderr);
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', stdout);
        reject(new Error(`Failed to parse Python output: ${error}`));
      }
    });
    
    python.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
};

/**
 * Main video processing function using Python ML models
 * @param videoId Video ID to process
 * @returns Processing result
 */
export const processVideo = async (videoId: string): Promise<ProcessingResult> => {
  try {
    console.log(`🎬 Starting video processing for video ID: ${videoId}`);

    // Get video from database
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    // Update status to processing
    video.processingStatus = 'processing';
    await video.save();

    // Prepare audio path
    const audioDir = 'uploads/audio';
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    const audioPath = path.join(audioDir, `${path.parse(video.filepath).name}.wav`);

    // Call Python ML processor
    console.log('🔄 Processing with Whisper + Mistral-7B...');
    const mlResult = await callPythonMLProcessor(video.filepath, audioPath);

    if (!mlResult.success || !mlResult.segments || !mlResult.mcqs) {
      throw new Error(mlResult.error || 'ML processing failed');
    }

    console.log(`✅ ML processing complete: ${mlResult.segments.length} segments, ${mlResult.mcqs.length} MCQs`);

    // Save transcript to database
    const transcript = await Transcript.create({
      videoId: video._id,
      segments: mlResult.segments,
      fullText: mlResult.transcript || '',
    });

    console.log('💾 Transcript saved:', transcript._id);

    // Save MCQs to database
    const mcqs = await Promise.all(
      mlResult.mcqs.map((item) =>
        MCQ.create({
          videoId: video._id,
          conceptTitle: item.concept.title,
          question: item.concept.question,
          options: item.concept.options,
          correctAnswer: item.concept.answer,
          timestamp: item.start,
        })
      )
    );

    console.log(`💾 ${mcqs.length} MCQs saved`);

    // Update video status to completed
    video.processingStatus = 'completed';
    video.processedAt = new Date();
    await video.save();

    console.log('✅ Video processing completed successfully');

    return {
      success: true,
      videoId: video._id.toString(),
      transcriptId: transcript._id.toString(),
      mcqCount: mcqs.length,
    };
  } catch (error: any) {
    console.error('❌ Video processing error:', error);

    // Update video status to failed
    try {
      const video = await Video.findById(videoId);
      if (video) {
        video.processingStatus = 'failed';
        video.processingError = error.message;
        await video.save();
      }
    } catch (updateError) {
      console.error('Failed to update video status:', updateError);
    }

    return {
      success: false,
      videoId,
      error: error.message,
    };
  }
};
