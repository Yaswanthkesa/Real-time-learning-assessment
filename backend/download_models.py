"""
Download ML models in advance
This script downloads Whisper and Mistral-7B models to cache
"""

import sys
import os

print("=" * 70)
print("Downloading ML Models for Video Learning Platform")
print("=" * 70)
print()

# Step 1: Download Whisper
print("📥 Step 1: Downloading Whisper Base Model (~140MB)")
print("-" * 70)
try:
    import whisper
    print("Loading Whisper base model...")
    model = whisper.load_model("base")
    print("✅ Whisper base model downloaded successfully!")
    print(f"   Cached at: {os.path.expanduser('~/.cache/whisper')}")
except Exception as e:
    print(f"❌ Error downloading Whisper: {e}")
    sys.exit(1)

print()

# Step 2: Download Mistral-7B
print("📥 Step 2: Downloading Mistral-7B Model (~14GB)")
print("-" * 70)
print("⚠️  This will take 10-30 minutes depending on internet speed")
print("⚠️  Make sure you have at least 20GB free disk space")
print()

response = input("Continue with Mistral-7B download? (y/n): ")
if response.lower() != 'y':
    print("Skipped Mistral-7B download. It will download on first video processing.")
    sys.exit(0)

print()
print("Downloading Mistral-7B-Instruct-v0.2...")
print("This may take a while. Please be patient...")
print()

try:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
    
    model_name = "mistralai/Mistral-7B-Instruct-v0.2"
    
    print("📦 Downloading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    print("✅ Tokenizer downloaded")
    
    print()
    print("📦 Downloading model (this is the big one - ~14GB)...")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map="cpu",  # Use CPU to avoid GPU memory issues
        low_cpu_mem_usage=True
    )
    print("✅ Model downloaded successfully!")
    
    # Get cache location
    cache_dir = os.path.expanduser("~/.cache/huggingface/hub")
    print(f"   Cached at: {cache_dir}")
    
except Exception as e:
    print(f"❌ Error downloading Mistral-7B: {e}")
    print()
    print("Troubleshooting:")
    print("  1. Check internet connection")
    print("  2. Ensure you have 20GB+ free disk space")
    print("  3. Try again later if HuggingFace servers are busy")
    sys.exit(1)

print()
print("=" * 70)
print("✅ All Models Downloaded Successfully!")
print("=" * 70)
print()
print("Models are cached and ready to use!")
print()
print("Cache locations:")
print(f"  Whisper: {os.path.expanduser('~/.cache/whisper')}")
print(f"  Mistral-7B: {os.path.expanduser('~/.cache/huggingface/hub')}")
print()
print("Next steps:")
print("  1. Start backend: npm run dev")
print("  2. Upload a video")
print("  3. Click 'Process Video'")
print("  4. Processing will be fast (no download needed)")
print()
print("=" * 70)
