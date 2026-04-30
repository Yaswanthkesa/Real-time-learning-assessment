"""
ML Video Processor - Whisper + Mistral-7B Integration
Based on the MachineLearning notebook implementation
"""

import sys
import json
import os
import re
import torch
import whisper
import subprocess
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# Configuration
WHISPER_MODEL = "base"
LLM_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

# Global variables for loaded models
whisper_model = None
llm_pipeline = None
tokenizer = None


def load_models():
    """Load Whisper and LLM models (called once)"""
    global whisper_model, llm_pipeline, tokenizer
    
    if whisper_model is None:
        print("🔄 Loading Whisper model...", file=sys.stderr)
        whisper_model = whisper.load_model(WHISPER_MODEL)
        print("✅ Whisper model loaded", file=sys.stderr)
    
    if llm_pipeline is None:
        print("🔄 Loading LLM...", file=sys.stderr)
        tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL)
        llm_pipeline = pipeline(
            "text-generation",
            model=LLM_MODEL,
            torch_dtype=torch.float16,
            device_map="auto",
            tokenizer=tokenizer
        )
        print("✅ LLM loaded", file=sys.stderr)


def extract_audio(video_path, audio_path):
    """Extract audio from video using FFmpeg"""
    command = [
        "ffmpeg",
        "-i", video_path,
        "-ar", "16000",
        "-ac", "1",
        "-y",
        audio_path
    ]
    
    subprocess.run(command, check=True, capture_output=True)
    return audio_path


def transcribe_audio(audio_path):
    """Transcribe audio using Whisper"""
    global whisper_model
    
    if whisper_model is None:
        load_models()
    
    print("🎤 Transcribing audio...", file=sys.stderr)
    result = whisper_model.transcribe(audio_path)
    
    segments = []
    for seg in result["segments"]:
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip()
        })
    
    print(f"✅ Transcription complete: {len(segments)} segments", file=sys.stderr)
    return segments


def get_full_transcript(segments):
    """Combine all segments into full transcript"""
    return " ".join([seg["text"] for seg in segments])


def call_llm(prompt, max_retries=2):
    """Call LLM with retry logic"""
    global llm_pipeline
    
    if llm_pipeline is None:
        load_models()
    
    for attempt in range(max_retries):
        try:
            output = llm_pipeline(
                prompt,
                max_new_tokens=1024,
                do_sample=True,
                temperature=0.4,
                return_full_text=False
            )
            
            return output[0]["generated_text"]
        
        except Exception as e:
            print(f"⚠️ LLM error (attempt {attempt+1}): {e}", file=sys.stderr)
    
    return ""


def extract_concepts_and_mcqs(transcript):
    """Generate MCQs from transcript using LLM"""
    truncated = transcript[:3000]
    
    prompt = f"""
<s>[INST]

You are an AI tutor.

From the transcript below:

1. Identify 3 to 5 key learning concepts
2. For EACH concept, write ONE multiple choice question
3. Each MCQ must have exactly 4 options

IMPORTANT:
Return ONLY valid JSON array

Example:

[
  {{
    "title": "Concept Name",
    "question": "What is...?",
    "options": [
      "A. option1",
      "B. option2",
      "C. option3",
      "D. option4"
    ],
    "answer": "A"
  }}
]

Transcript:
{truncated}

[/INST]
"""
    
    print("🧠 Generating MCQs with LLM...", file=sys.stderr)
    response = call_llm(prompt)
    
    try:
        # Extract JSON from response
        match = re.search(r'\[.*\]', response, re.DOTALL)
        
        if match:
            data = json.loads(match.group())
            
            # Validate structure
            validated = []
            for item in data:
                if all(k in item for k in ["title", "question", "options", "answer"]):
                    if len(item["options"]) == 4:
                        validated.append(item)
            
            print(f"✅ Generated {len(validated)} MCQs", file=sys.stderr)
            return validated
    
    except json.JSONDecodeError as e:
        print(f"⚠️ JSON parse error: {e}", file=sys.stderr)
    
    return []


def map_to_timestamps(concepts, segments, total_duration=None):
    """Map concepts to video timestamps using keyword matching"""
    if total_duration is None:
        total_duration = segments[-1]["end"] if segments else 60
    
    mapped = []
    n = len(concepts)
    
    for i, concept in enumerate(concepts):
        # Extract keywords from concept title
        title_words = set(concept["title"].lower().split())
        
        best_seg = None
        
        # Find matching segment
        for seg in segments:
            seg_words = set(seg["text"].lower().split())
            
            # Check for keyword overlap (words > 3 characters)
            overlap = [w for w in title_words if len(w) > 3 and w in seg_words]
            
            if overlap:
                best_seg = seg
                break
        
        if best_seg:
            mapped.append({
                "concept": concept,
                "start": best_seg["start"],
                "end": best_seg["end"]
            })
        else:
            # Fallback: even distribution
            mapped.append({
                "concept": concept,
                "start": (i / n) * total_duration,
                "end": ((i + 1) / n) * total_duration
            })
    
    # Sort by timestamp
    mapped.sort(key=lambda x: x["start"])
    
    print(f"✅ Mapped {len(mapped)} concepts to timestamps", file=sys.stderr)
    return mapped


def process_video(video_path, audio_path):
    """
    Main processing function
    Returns: JSON with segments, transcript, and mapped MCQs
    """
    try:
        # Step 1: Extract audio
        print("🔄 Extracting audio...", file=sys.stderr)
        extract_audio(video_path, audio_path)
        
        # Step 2: Transcribe
        segments = transcribe_audio(audio_path)
        
        # Step 3: Get full transcript
        transcript = get_full_transcript(segments)
        
        # Step 4: Generate MCQs
        concepts = extract_concepts_and_mcqs(transcript)
        
        if not concepts:
            return {
                "success": False,
                "error": "Failed to generate MCQs"
            }
        
        # Step 5: Map to timestamps
        total_duration = segments[-1]["end"] if segments else 60
        mapped = map_to_timestamps(concepts, segments, total_duration)
        
        # Clean up audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)
        
        return {
            "success": True,
            "segments": segments,
            "transcript": transcript,
            "mcqs": mapped
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python ml_processor.py <video_path> <audio_path>"
        }))
        sys.exit(1)
    
    video_path = sys.argv[1]
    audio_path = sys.argv[2]
    
    result = process_video(video_path, audio_path)
    print(json.dumps(result))
