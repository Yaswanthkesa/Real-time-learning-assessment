# Quick Deployment Guide for Your Project

## Your Repository
**GitHub URL**: `git@github.com:Yaswanthkesa/Real-time-learning-assessment.git`

---

## 🚀 STEP 1: Initialize Git and Push to GitHub (5 minutes)

### 1.1 Initialize Git Repository
```bash
# Initialize git in your project
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: IntelliSense Learning Platform"
```

### 1.2 Connect to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin git@github.com:Yaswanthkesa/Real-time-learning-assessment.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**If you get SSH key error:**
```bash
# Use HTTPS instead
git remote remove origin
git remote add origin https://github.com/Yaswanthkesa/Real-time-learning-assessment.git
git push -u origin main
```

---

## 🚀 STEP 2: Setup Prerequisites (15 minutes)

### 2.1 MongoDB Atlas
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intellisense
   ```
6. **IMPORTANT**: Network Access → Add IP → "Allow from Anywhere" (0.0.0.0/0)

### 2.2 Groq API Key
1. Go to: https://console.groq.com
2. Sign up (free)
3. Create API Key
4. Copy key (starts with `gsk_...`)

### 2.3 Google OAuth (Optional - for Google Sign-In)
1. Go to: https://console.cloud.google.com
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://your-backend-url/api/auth/google/callback`
6. Copy Client ID and Secret

---

## 🚀 STEP 3: Deploy Backend to Railway (10 minutes)

### 3.1 Sign Up for Railway
1. Go to: https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway

### 3.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select: `Yaswanthkesa/Real-time-learning-assessment`
4. Railway will start deploying

### 3.3 Configure Backend
1. Click on your service
2. Go to "Settings"
3. Set **Root Directory**: `backend`
4. Go to "Variables" tab
5. Click "Raw Editor" and paste:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intellisense
JWT_SECRET=super-secret-key-change-this-to-random-32-char-string
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://real-time-learning-assessment-production.up.railway.app/api/auth/google/callback
FRONTEND_URL=https://real-time-learning-assessment.vercel.app
USE_GROQ_API=true
GROQ_API_KEY=gsk_your_groq_api_key_here
USE_LOCAL_ML=false
USE_FAST_MODE=false
```

6. Click "Deploy" (if not auto-deployed)
7. Wait 3-5 minutes
8. Copy your Railway URL from "Settings" → "Domains"
   - Example: `https://real-time-learning-assessment-production.up.railway.app`

### 3.4 Test Backend
Open in browser: `https://your-railway-url.up.railway.app/health`

Should see: `{"status":"ok","message":"Server is running"}`

---

## 🚀 STEP 4: Deploy Frontend to Vercel (5 minutes)

### 4.1 Update Frontend Environment
1. Open `frontend/.env.production`
2. Update with your Railway URL:
```env
REACT_APP_API_URL=https://your-railway-url.up.railway.app
```

3. Commit and push:
```bash
git add frontend/.env.production
git commit -m "Update production API URL"
git push
```

### 4.2 Deploy to Vercel
1. Go to: https://vercel.com
2. Click "Login" → "Continue with GitHub"
3. Click "Add New" → "Project"
4. Import: `Yaswanthkesa/Real-time-learning-assessment`
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add Environment Variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-railway-url.up.railway.app`
7. Click "Deploy"
8. Wait 2-3 minutes
9. Copy your Vercel URL
   - Example: `https://real-time-learning-assessment.vercel.app`

---

## 🚀 STEP 5: Final Configuration (5 minutes)

### 5.1 Update Railway Environment Variables
1. Go to Railway → Your Project → Variables
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
3. Railway will auto-redeploy

### 5.2 Update Google OAuth (if using)
1. Go to Google Cloud Console
2. Update Authorized redirect URIs:
   - `https://your-railway-url.up.railway.app/api/auth/google/callback`
3. Add Authorized JavaScript origins:
   - `https://your-vercel-url.vercel.app`

### 5.3 Update CORS in Backend Code
Edit `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://real-time-learning-assessment.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
```

Commit and push:
```bash
git add backend/src/index.ts
git commit -m "Update CORS for production"
git push
```

Railway will auto-redeploy.

---

## 🎉 STEP 6: Test Your Deployment (10 minutes)

### 6.1 Open Your App
Go to: `https://your-vercel-url.vercel.app`

### 6.2 Test Registration
1. Click "Register"
2. Fill in details
3. Create account
4. Should redirect to dashboard

### 6.3 Test as Teacher
1. Login as teacher
2. Create a course
3. Upload a SHORT video (1-2 minutes for testing)
4. Click "Process Video"
5. Wait 2-3 minutes
6. Check if MCQs are generated

### 6.4 Test as Student
1. Logout
2. Register as student
3. Browse courses
4. Enroll in course
5. Watch video
6. Answer MCQs
7. Check progress

---

## 📋 YOUR DEPLOYMENT URLS

After deployment, you'll have:

**Frontend (Vercel)**:
- Production: `https://real-time-learning-assessment.vercel.app`
- You can add custom domain later

**Backend (Railway)**:
- Production: `https://real-time-learning-assessment-production.up.railway.app`
- API Health: `https://your-url.up.railway.app/health`

**Database (MongoDB Atlas)**:
- Connection string in Railway environment variables
- Access via MongoDB Compass or Atlas dashboard

---

## 🐛 TROUBLESHOOTING

### Problem: "git push" fails with SSH error
**Solution**: Use HTTPS instead
```bash
git remote remove origin
git remote add origin https://github.com/Yaswanthkesa/Real-time-learning-assessment.git
git push -u origin main
```

### Problem: Railway deployment fails
**Solution**: Check logs in Railway dashboard
- Common issue: Missing environment variables
- Make sure `ROOT_DIRECTORY` is set to `backend`

### Problem: Frontend shows "Network Error"
**Solution**: 
1. Check `REACT_APP_API_URL` in Vercel environment variables
2. Check CORS settings in backend
3. Verify Railway backend is running (check health endpoint)

### Problem: MongoDB connection fails
**Solution**:
1. Check MongoDB Atlas → Network Access
2. Make sure "0.0.0.0/0" is whitelisted
3. Verify connection string in Railway variables

### Problem: Video processing fails
**Solution**:
1. Check Groq API key is correct
2. Verify `USE_GROQ_API=true` in Railway
3. Check Railway logs for errors

### Problem: Google OAuth not working
**Solution**:
1. Verify redirect URI in Google Console matches Railway URL exactly
2. Check `GOOGLE_CALLBACK_URL` in Railway variables
3. Make sure Google OAuth is enabled in Google Console

---

## 💰 COST BREAKDOWN

### Free Tier (Perfect for Testing)
- **Railway**: $5 credit/month (enough for small projects)
- **Vercel**: Free (100GB bandwidth)
- **MongoDB Atlas**: Free (512MB storage)
- **Groq API**: Free tier available

### If You Exceed Free Tier
- **Railway**: ~$5-10/month
- **Vercel Pro**: $20/month (optional)
- **MongoDB Atlas M2**: $9/month
- **Groq API**: Pay per use (~$0.05 per video)

**Total for production**: ~$15-40/month

---

## 🎯 QUICK COMMAND REFERENCE

```bash
# Initialize and push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Yaswanthkesa/Real-time-learning-assessment.git
git branch -M main
git push -u origin main

# Update and redeploy
git add .
git commit -m "Your commit message"
git push

# Check deployment status
# Railway: Check dashboard
# Vercel: Check dashboard

# View logs
# Railway: Dashboard → Logs
# Vercel: Dashboard → Deployments → View Function Logs
```

---

## 📞 SUPPORT

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Groq API**: https://console.groq.com/docs

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Git initialized and pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Groq API key obtained
- [ ] Backend deployed to Railway
- [ ] Backend environment variables configured
- [ ] Backend health endpoint working
- [ ] Frontend environment updated with Railway URL
- [ ] Frontend deployed to Vercel
- [ ] CORS updated in backend code
- [ ] Google OAuth configured (optional)
- [ ] Registration tested
- [ ] Login tested
- [ ] Course creation tested
- [ ] Video upload tested
- [ ] Video processing tested
- [ ] Student flow tested
- [ ] Progress tracking tested

---

**Total Time**: ~45-60 minutes
**Difficulty**: Beginner-friendly
**Cost**: Free for testing

Good luck! 🚀
