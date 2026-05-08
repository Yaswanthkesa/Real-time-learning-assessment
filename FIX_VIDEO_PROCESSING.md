# Fix Video Processing on Render

## Problem
Video processing fails with: `ModuleNotFoundError: No module named 'whisper'`

## Root Cause
Render doesn't have Python ML dependencies installed.

---

## ✅ SOLUTION: Update Render Build Command

### Step 1: Update Render Build Settings

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on**: `intellisense-backend`
3. **Go to**: Settings tab
4. **Find**: "Build Command"
5. **Change from**: `npm install`
6. **Change to**: `chmod +x render-build.sh && ./render-build.sh`
7. **Click**: "Save Changes"

### Step 2: Commit and Push the Build Script

The build script `backend/render-build.sh` has been created. Now commit and push it:

```bash
git add backend/render-build.sh
git commit -m "Add Render build script for Python dependencies"
git push
```

### Step 3: Trigger Manual Deploy on Render

1. Go to Render dashboard → Your service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait 5-10 minutes for build to complete
4. Check logs for any errors

---

## 🔄 ALTERNATIVE: Groq API Only (No Python Install Needed)

If the above doesn't work, we can modify the code to use Groq API for transcription too (no Whisper needed).

This would require:
1. Using Groq's Whisper API endpoint instead of local Whisper
2. Modifying `ml_processor_groq.py` to not import whisper locally

---

## 🧪 TEST AFTER FIX

1. Go to your deployed site
2. Upload a short video (1-2 minutes)
3. Click "Process Video"
4. Wait 2-3 minutes
5. Check if MCQs are generated

---

## 📋 RENDER ENVIRONMENT VARIABLES (Verify These)

Make sure these are set in Render:

```
USE_GROQ_API=true
GROQ_API_KEY=<your-groq-api-key>
USE_LOCAL_ML=false
WHISPER_MODEL=base
```

---

## ⚠️ IMPORTANT NOTES

1. **Build Time**: Installing Python dependencies will increase build time to 5-10 minutes
2. **Render Free Tier**: Has limited build minutes per month
3. **Alternative**: Consider using a Python-specific hosting service for ML processing (like Hugging Face Spaces or Modal)

---

## 🎯 QUICK FIX (If Build Script Doesn't Work)

If Render doesn't support Python dependencies easily, you can:

1. **Use Groq API for everything** (including transcription)
2. **Deploy ML processing separately** on a Python-friendly platform
3. **Use a serverless function** (AWS Lambda, Google Cloud Functions) for video processing

---

**START WITH STEP 1 ABOVE** ⬆️
