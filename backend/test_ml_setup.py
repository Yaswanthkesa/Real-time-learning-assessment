"""
Test script to verify ML setup
Run this to check if all dependencies are installed correctly
"""

import sys

print("=" * 60)
print("Testing ML Setup for Video Learning Platform")
print("=" * 60)
print()

# Test 1: Python version
print("✓ Test 1: Python Version")
print(f"  Python {sys.version}")
if sys.version_info < (3, 8):
    print("  ❌ ERROR: Python 3.8+ required")
    sys.exit(1)
print("  ✅ PASS")
print()

# Test 2: PyTorch
print("✓ Test 2: PyTorch")
try:
    import torch
    print(f"  PyTorch version: {torch.__version__}")
    print(f"  CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"  CUDA version: {torch.version.cuda}")
        print(f"  GPU: {torch.cuda.get_device_name(0)}")
    print("  ✅ PASS")
except ImportError as e:
    print(f"  ❌ FAIL: {e}")
    print("  Run: pip install torch")
    sys.exit(1)
print()

# Test 3: Whisper
print("✓ Test 3: Whisper")
try:
    import whisper
    print(f"  Whisper installed: {whisper.__version__ if hasattr(whisper, '__version__') else 'Yes'}")
    print("  ✅ PASS")
except ImportError as e:
    print(f"  ❌ FAIL: {e}")
    print("  Run: pip install openai-whisper")
    sys.exit(1)
print()

# Test 4: Transformers
print("✓ Test 4: Transformers")
try:
    import transformers
    print(f"  Transformers version: {transformers.__version__}")
    print("  ✅ PASS")
except ImportError as e:
    print(f"  ❌ FAIL: {e}")
    print("  Run: pip install transformers")
    sys.exit(1)
print()

# Test 5: Other dependencies
print("✓ Test 5: Other Dependencies")
missing = []

try:
    import accelerate
    print("  ✓ accelerate")
except ImportError:
    missing.append("accelerate")
    print("  ✗ accelerate")

try:
    import sentencepiece
    print("  ✓ sentencepiece")
except ImportError:
    missing.append("sentencepiece")
    print("  ✗ sentencepiece")

try:
    import google.protobuf
    print("  ✓ protobuf")
except ImportError:
    missing.append("protobuf")
    print("  ✗ protobuf")

if missing:
    print(f"  ❌ FAIL: Missing {', '.join(missing)}")
    print("  Run: pip install -r requirements.txt")
    sys.exit(1)
print("  ✅ PASS")
print()

# Test 6: FFmpeg
print("✓ Test 6: FFmpeg")
try:
    import subprocess
    result = subprocess.run(
        ["ffmpeg", "-version"],
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        version_line = result.stdout.split('\n')[0]
        print(f"  {version_line}")
        print("  ✅ PASS")
    else:
        print("  ❌ FAIL: FFmpeg not working")
        sys.exit(1)
except FileNotFoundError:
    print("  ❌ FAIL: FFmpeg not found")
    print("  Install FFmpeg from: https://ffmpeg.org/download.html")
    sys.exit(1)
print()

# Test 7: Load Whisper model (optional, takes time)
print("✓ Test 7: Load Whisper Model (Optional)")
response = input("  Load Whisper base model? This will download ~140MB (y/n): ")
if response.lower() == 'y':
    try:
        print("  Loading Whisper base model...")
        model = whisper.load_model("base")
        print("  ✅ PASS: Whisper model loaded successfully")
    except Exception as e:
        print(f"  ❌ FAIL: {e}")
        sys.exit(1)
else:
    print("  ⏭️  SKIPPED")
print()

# Summary
print("=" * 60)
print("✅ All Tests Passed!")
print("=" * 60)
print()
print("Your ML setup is ready!")
print()
print("Next steps:")
print("  1. Start backend: npm run dev")
print("  2. Upload a video")
print("  3. Click 'Process Video'")
print()
print("Note: First-time processing will download Mistral-7B (~14GB)")
print("=" * 60)
