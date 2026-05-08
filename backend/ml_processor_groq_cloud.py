"""
ML Video Processor - Full Cloud Mode (Groq Whisper API + Groq LLM)
No local dependencies needed - everything runs via Groq API
"""

import sys
import json
import os
import re
import subprocess
import requests
from pathlib import Path

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

def extract_audio(video_path, audio_path):
    """Extract audio from video using ffmpeg"""
    try:
        print(f"🎵 Extracting audio from video...")
        subprocess.run([
            'ffmpeg', '-i', video_path,
            '-vn', '-acodec', 'pcm_s16le',
            '-ar', '16000', '-ac', '1',
            audio_path, '-y'
        ], check=True, capture_output=True)
        print(f"✅ Audio extracted: {audio_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg error: {e.stderr.decode()}")
        return False

def transcribe_with_groq(audio_path):
    """Transcribe audio using Groq's Whisper API"""
    try:
        print("🎤 Transcribing with Groq Whisper API...")
        
        with open(audio_path, 'rb') as audio_file:
            files = {
                'file': (Path(audio_path).name, audio_file, 'audio/wav'),
            }
            data = {
                'model': 'whisper-large-v3',
                'response_format': 'verbose_json',
                'timestamp_granularities': ['segment']
            }
            headers = {
                'Authorization': f'Bearer {GROQ_API_KEY}'
            }
            
            response = requests.post(
                GROQ_WHISPER_URL,
                files=files,
                data=data,
                headers=headers,
                timeout=300
            )
            
            if response.status_code != 200:
                print(f"❌ Groq Whisper API error: {response.text}")
                return None
            
            result = response.json()
            print(f"✅ Transcription complete: {len(result.get('segments', []))} segments")
            return result
            
    except Exception as e:
        print(f"❌ Transcription error: {str(e)}")
        return None

def generate_mcqs_with_groq(transcript_text):
    """Generate MCQs using Groq LLM"""
    try:
        print("🤖 Generating MCQs with Groq LLM...")
        
        prompt = f"""You are an expert educator. Based on the following video transcript, generate 5-7 multiple-choice questions (MCQs) that test understanding of key concepts.

For each MCQ, provide:
1. A concept title (2-4 words describing the topic)
2. A clear question
3. Four options (A, B, C, D)
4. The correct answer (A, B, C, or D)

Format your response as a JSON array like this:
[
  {{
    "concept": "Concept Title",
    "question": "Question text?",
    "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
    "answer": "A"
  }}
]

Transcript:
{transcript_text}

Generate MCQs:"""

        headers = {
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'llama-3.3-70b-versatile',
            'messages': [
                {'role': 'system', 'content': 'You are an expert educator who creates high-quality multiple-choice questions.'},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.7,
            'max_tokens': 2000
        }
        
        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"❌ Groq LLM API error: {response.text}")
            return []
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', content, re.DOTALL)
        if json_match:
            mcqs = json.loads(json_match.group())
            print(f"✅ Generated {len(mcqs)} MCQs")
            return mcqs
        else:
            print("❌ Could not parse MCQs from response")
            return []
            
    except Exception as e:
        print(f"❌ MCQ generation error: {str(e)}")
        return []

def map_mcqs_to_timestamps(mcqs, segments):
    """Map MCQs to relevant timestamps in the video"""
    mcq_timestamps = []
    
    for mcq in mcqs:
        concept_keywords = mcq['concept'].lower().split()
        best_match_time = 0
        best_match_score = 0
        
        for segment in segments:
            text = segment['text'].lower()
            score = sum(1 for keyword in concept_keywords if keyword in text)
            
            if score > best_match_score:
                best_match_score = score
                best_match_time = segment['start']
        
        mcq_timestamps.append({
            'concept': {
                'title': mcq['concept'],
                'question': mcq['question'],
                'options': mcq['options'],
                'answer': mcq['answer']
            },
            'start': best_match_time,
            'end': best_match_time + 30
        })
    
    return mcq_timestamps

def main():
    if len(sys.argv) != 3:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python ml_processor_groq_cloud.py <video_path> <audio_path>'
        }))
        sys.exit(1)
    
    video_path = sys.argv[1]
    audio_path = sys.argv[2]
    
    try:
        # Step 1: Extract audio
        if not extract_audio(video_path, audio_path):
            raise Exception("Audio extraction failed")
        
        # Step 2: Transcribe with Groq Whisper API
        transcription = transcribe_with_groq(audio_path)
        if not transcription:
            raise Exception("Transcription failed")
        
        segments = transcription.get('segments', [])
        full_text = transcription.get('text', '')
        
        # Convert segments to expected format
        formatted_segments = [
            {
                'start': seg['start'],
                'end': seg['end'],
                'text': seg['text']
            }
            for seg in segments
        ]
        
        # Step 3: Generate MCQs with Groq LLM
        mcqs = generate_mcqs_with_groq(full_text)
        if not mcqs:
            raise Exception("MCQ generation failed")
        
        # Step 4: Map MCQs to timestamps
        mcq_timestamps = map_mcqs_to_timestamps(mcqs, formatted_segments)
        
        # Return result
        result = {
            'success': True,
            'segments': formatted_segments,
            'transcript': full_text,
            'mcqs': mcq_timestamps
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
