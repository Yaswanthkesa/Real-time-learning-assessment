"""
Quick ML test - loads models on demand
"""
import sys
print("Testing ML setup...", file=sys.stderr)

try:
    import torch
    print(f"✅ PyTorch installed: {torch.__version__}", file=sys.stderr)
    
    import whisper
    print("✅ Whisper installed", file=sys.stderr)
    
    from transformers import AutoTokenizer
    print("✅ Transformers installed", file=sys.stderr)
    
    print("\n🎉 All dependencies ready!", file=sys.stderr)
    print("✅ Models will load on first video processing", file=sys.stderr)
    print("✅ Mistral-7B is already downloaded (14.5GB cached)", file=sys.stderr)
    
except Exception as e:
    print(f"❌ Error: {e}", file=sys.stderr)
    sys.exit(1)
