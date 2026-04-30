# ML Setup Guide - Whisper + Mistral-7B Integration

This guide explains how to set up the local ML models (Whisper and Mistral-7B) for video processing.

## Overview

The platform now uses:
- **Whisper (base model)** - For audio transcription
- **Mistral-7B-Instruct-v0.2** - For MCQ generation
- **Python integration** - Node.js calls Python script for ML processing

## Prerequisites

1. **Python 3.8+** installed
2. **pip** (Python package manager)
3. **FFmpeg** installed (for audio extraction)
4. **GPU recommended** (but CPU works, just slower)

## Installation Steps

### Step 1: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `torch` - PyTorch for ML models
- `openai-whisper` - Whisper transcription model
- `transformers` - HuggingFace transformers for Mistral-7B
- `accelerate` - For faster model loading
- `sentencepiece` - Tokenizer for Mistral
- `protobuf` - Required dependency

### Step 2: Verify Python Installation

Test if Python can be called from Node.js:

```bash
python --version
```

Should show Python 3.8 or higher.

### Step 3: Test ML Processor

Test the Python script directly:

```bash
python ml_processor.py <path-to-video.mp4> <path-to-audio.wav>
```

Example:
```bash
python ml_processor.py ../uploads/videos/test.mp4 ../uploads/audio/test.wav
```

### Step 4: Start Backend Server

```bash
npm run dev
```

The server will now use the Python ML processor for video processing.

## How It Works

1. **Video Upload**: Teacher uploads video via frontend
2. **Trigger Processing**: Teacher clicks "Process Video" button
3. **Node.js → Python**: Node.js spawns Python process with video path
4. **Python ML Processing**:
   - Extracts audio using FFmpeg
   - Transcribes with Whisper (base model)
   - Generates MCQs with Mistral-7B
   - Maps timestamps using keyword matching
5. **Python → Node.js**: Returns JSON with segments and MCQs
6. **Save to Database**: Node.js saves transcript and MCQs to MongoDB

## Model Details

### Whisper Base Model
- **Size**: ~140MB
- **Speed**: ~1x realtime on CPU, faster on GPU
- **Accuracy**: Good for English, decent for other languages
- **First run**: Downloads model automatically (~140MB)

### Mistral-7B-Instruct-v0.2
- **Size**: ~14GB
- **Speed**: Slow on CPU, fast on GPU
- **Quality**: High-quality MCQ generation
- **First run**: Downloads model automatically (~14GB)
- **Memory**: Requires ~16GB RAM (CPU) or ~8GB VRAM (GPU)

## Performance Expectations

### CPU Processing (No GPU)
- **10-minute video**: ~15-20 minutes processing time
- **Whisper**: ~10 minutes
- **Mistral-7B**: ~5-10 minutes

### GPU Processing (NVIDIA GPU with CUDA)
- **10-minute video**: ~3-5 minutes processing time
- **Whisper**: ~2 minutes
- **Mistral-7B**: ~1-3 minutes

## Troubleshooting

### Issue: "python: command not found"

**Solution**: Install Python 3.8+ or use `python3` instead:

Edit `backend/src/services/videoProcessor.ts`:
```typescript
const python = spawn('python3', [pythonScript, videoPath, audioPath]);
```

### Issue: "No module named 'torch'"

**Solution**: Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Issue: "CUDA out of memory"

**Solution**: The model is trying to use GPU but doesn't have enough VRAM. Force CPU mode:

Edit `backend/ml_processor.py`:
```python
llm_pipeline = pipeline(
    "text-generation",
    model=LLM_MODEL,
    torch_dtype=torch.float16,
    device_map="cpu",  # Changed from "auto" to "cpu"
    tokenizer=tokenizer
)
```

### Issue: Processing is very slow

**Solutions**:
1. **Use smaller Whisper model**: Change `WHISPER_MODEL=tiny` in `.env`
2. **Use smaller LLM**: Replace Mistral-7B with smaller model
3. **Add GPU**: Install CUDA and PyTorch with GPU support

### Issue: "Failed to parse Python output"

**Solution**: Check Python script output manually:
```bash
python ml_processor.py <video-path> <audio-path>
```

Look for JSON output. If you see errors, they'll be in stderr.

## Alternative: Mock Mode (For Testing)

If you don't want to install ML models, you can use mock mode:

1. Edit `backend/.env`:
```env
USE_LOCAL_ML=false
USE_MOCK_AI=true
```

2. The system will use sample data instead of real ML processing

## Optimization Tips

### 1. Cache Models
Models are loaded once and kept in memory. Don't restart the server unnecessarily.

### 2. Process in Background
Processing is already asynchronous. Users can continue using the platform while videos process.

### 3. Use GPU
If you have an NVIDIA GPU:
```bash
# Install CUDA-enabled PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 4. Reduce Model Size
Use smaller models for faster processing:
- Whisper: `tiny`, `base`, `small`, `medium`, `large`
- LLM: Try `mistralai/Mistral-7B-Instruct-v0.1` or smaller models

## Cost Comparison

### OpenAI API (Previous Implementation)
- **Cost**: ~$0.08 per 10-minute video
- **Speed**: Fast (~2-3 minutes)
- **Setup**: Easy (just API key)

### Local ML (Current Implementation)
- **Cost**: FREE (after setup)
- **Speed**: Slower (~15-20 minutes on CPU)
- **Setup**: Requires Python, models, and compute resources

## Next Steps

1. Install Python dependencies
2. Test ML processor
3. Upload a video and click "Process Video"
4. Monitor backend logs for progress
5. Check database for transcript and MCQs

## Support

If you encounter issues:
1. Check backend logs: `npm run dev`
2. Test Python script directly
3. Verify Python dependencies are installed
4. Check system resources (RAM, disk space)

---

**Note**: First-time model downloads may take 10-30 minutes depending on internet speed. Models are cached locally after first download.
