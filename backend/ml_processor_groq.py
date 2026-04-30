"""
ML Video Processor - Whisper + Groq API
Fast cloud-based MCQ generation using Groq
"""

import sys
import json
import os
import re
import whisper
import subprocess
import requests

# Configuration
WHISPER_MODEL = "base"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Global variables
whisper_model = None


def load_whisper():
    """Load Whisper model"""
    global whisper_model
    
    if whisper_model is None:
        print("🔄 Loading Whisper model...", file=sys.stderr)
        whisper_model = whisper.load_model(WHISPER_MODEL)
        print("✅ Whisper model loaded", file=sys.stderr)


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
        load_whisper()
    
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


def call_groq_api(prompt, max_retries=2):
    """Call Groq API for MCQ generation"""
    if not GROQ_API_KEY:
        print("❌ GROQ_API_KEY not set", file=sys.stderr)
        return ""
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }
    
    payload = {
        "messages": [
            {
                "role": "system",
                "content": "You are an AI tutor that generates educational multiple choice questions. Always respond with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "model": "llama-3.3-70b-versatile",
        "temperature": 0.4,
        "max_tokens": 2000
    }
    
    for attempt in range(max_retries):
        try:
            print(f"🌐 Calling Groq API (attempt {attempt + 1})...", file=sys.stderr)
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                print("✅ Groq API response received", file=sys.stderr)
                return content
            else:
                print(f"⚠️ Groq API error: {response.status_code} - {response.text}", file=sys.stderr)
        
        except Exception as e:
            print(f"⚠️ Groq API error (attempt {attempt+1}): {e}", file=sys.stderr)
    
    return ""


def extract_concepts_and_mcqs(transcript):
    """Generate MCQs from transcript using Groq API"""
    truncated = transcript[:3000]
    
    prompt = f"""From the transcript below, generate 3 to 5 educational multiple choice questions.

For EACH question, provide:
- title: A short concept name
- question: The question text
- options: Exactly 4 options as an array of strings in format ["A. text", "B. text", "C. text", "D. text"]
- answer: The correct answer letter (A, B, C, or D)

Return ONLY a valid JSON array with no additional text:

[
  {{
    "title": "Concept Name",
    "question": "What is...?",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "answer": "A"
  }}
]

Transcript:
{truncated}"""
    
    print("🧠 Generating MCQs with Groq...", file=sys.stderr)
    response = call_groq_api(prompt)
    
    if not response:
        print("⚠️ Using fallback MCQ generation", file=sys.stderr)
        return generate_fallback_mcqs(transcript)
    
    try:
        # Extract JSON from response
        match = re.search(r'\[.*\]', response, re.DOTALL)
        
        if match:
            data = json.loads(match.group())
            
            # Validate structure
            validated = []
            for item in data:
                if all(k in item for k in ["title", "question", "options", "answer"]):
                    if len(item["options"]) == 4 and item["answer"] in ["A", "B", "C", "D"]:
                        validated.append(item)
            
            if validated:
                print(f"✅ Generated {len(validated)} MCQs", file=sys.stderr)
                return validated
    
    except json.JSONDecodeError as e:
        print(f"⚠️ JSON parse error: {e}", file=sys.stderr)
        print(f"Response was: {response[:200]}", file=sys.stderr)
    
    print("⚠️ Using fallback MCQ generation", file=sys.stderr)
    return generate_fallback_mcqs(transcript)


def generate_fallback_mcqs(transcript):
    """Generate simple MCQs when API fails"""
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
            "error": "Usage: python ml_processor_groq.py <video_path> <audio_path>"
        }))
        sys.exit(1)
    
    video_path = sys.argv[1]
    audio_path = sys.argv[2]
    
    result = process_video(video_path, audio_path)
    print(json.dumps(result))
