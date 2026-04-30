"""
FAST ML Video Processor - Uses smaller/faster models for testing
Whisper tiny + Flan-T5 (much faster than Mistral-7B)
"""

import sys
import json
import os
import re
import torch
import whisper
import subprocess
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Configuration - FASTER MODELS
WHISPER_MODEL = "tiny"  # Much faster than base
LLM_MODEL = "google/flan-t5-base"  # Much faster than Mistral-7B (850MB vs 14GB)

# Global variables for loaded models
whisper_model = None
llm_model = None
tokenizer = None


def load_models():
    """Load Whisper and LLM models (called once)"""
    global whisper_model, llm_model, tokenizer
    
    if whisper_model is None:
        print("🔄 Loading Whisper tiny model...", file=sys.stderr)
        whisper_model = whisper.load_model(WHISPER_MODEL)
        print("✅ Whisper model loaded", file=sys.stderr)
    
    if llm_model is None:
        print("🔄 Loading Flan-T5 (fast model)...", file=sys.stderr)
        tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL)
        llm_model = AutoModelForSeq2SeqLM.from_pretrained(LLM_MODEL)
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
    global llm_model, tokenizer
    
    if llm_model is None:
        load_models()
    
    for attempt in range(max_retries):
        try:
            inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
            outputs = llm_model.generate(
                **inputs,
                max_new_tokens=512,
                temperature=0.7,
                do_sample=True
            )
            
            return tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        except Exception as e:
            print(f"⚠️ LLM error (attempt {attempt+1}): {e}", file=sys.stderr)
    
    return ""


def extract_concepts_and_mcqs(transcript):
    """Generate MCQs from transcript using LLM"""
    truncated = transcript[:1000]  # Shorter for faster processing
    
    prompt = f"""Generate 3 multiple choice questions from this transcript. 
For each question, provide:
- A concept title
- A question
- 4 options (A, B, C, D)
- The correct answer (A, B, C, or D)

Format as JSON array.

Transcript: {truncated}

JSON:"""
    
    print("🧠 Generating MCQs with LLM...", file=sys.stderr)
    response = call_llm(prompt)
    
    # Try to parse JSON
    try:
        match = re.search(r'\[.*\]', response, re.DOTALL)
        
        if match:
            data = json.loads(match.group())
            
            # Validate structure
            validated = []
            for item in data:
                if all(k in item for k in ["title", "question", "options", "answer"]):
                    if len(item["options"]) == 4:
                        validated.append(item)
            
            if validated:
                print(f"✅ Generated {len(validated)} MCQs", file=sys.stderr)
                return validated
    
    except json.JSONDecodeError:
        pass
    
    # Fallback: Generate simple MCQs
    print("⚠️ Using fallback MCQ generation", file=sys.stderr)
    return generate_fallback_mcqs(transcript)


def generate_fallback_mcqs(transcript):
    """Generate simple MCQs when LLM fails"""
    words = transcript.split()
    
    mcqs = [
        {
            "title": "Video Content Understanding",
            "question": "What is the main topic discussed in this video?",
            "options": [
                "A. " + " ".join(words[:5]) if len(words) > 5 else "A. Topic A",
                "B. " + " ".join(words[5:10]) if len(words) > 10 else "B. Topic B",
                "C. " + " ".join(words[10:15]) if len(words) > 15 else "C. Topic C",
                "D. None of the above"
            ],
            "answer": "A"
        },
        {
            "title": "Key Concept",
            "question": "Which concept is explained in the video?",
            "options": [
                "A. Concept 1",
                "B. Concept 2",
                "C. Concept 3",
                "D. All of the above"
            ],
            "answer": "D"
        },
        {
            "title": "Video Summary",
            "question": "What did you learn from this video?",
            "options": [
                "A. Important information",
                "B. Useful knowledge",
                "C. Key concepts",
                "D. All of the above"
            ],
            "answer": "D"
        }
    ]
    
    print(f"✅ Generated {len(mcqs)} fallback MCQs", file=sys.stderr)
    return mcqs


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
            "error": "Usage: python ml_processor_fast.py <video_path> <audio_path>"
        }))
        sys.exit(1)
    
    video_path = sys.argv[1]
    audio_path = sys.argv[2]
    
    result = process_video(video_path, audio_path)
    print(json.dumps(result))
