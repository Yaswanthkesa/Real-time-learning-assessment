# 🚀 Deploy IntelliSense - Quick Start Guide

Follow these steps in order. Check each box as you complete it.

---

## ✅ STEP 1: Setup MongoDB Atlas (5 minutes)

1. [ ] Go to https://www.mongodb.com/cloud/atlas
2. [ ] Sign up for free account
3. [ ] Create new cluster (Free M0 tier)
4. [ ] Click "Connect" → "Connect your application"
5. [ ] Copy connection string and save it:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/intellisense
   ```
6. [ ] Go to "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

**Save this:** Your MongoDB connection string

---

## ✅ STEP 2: Setup Groq API (3 minutes)

1. [ ] Go to https://console.groq.com
2. [ ] Sign up for free account
3. [ ] Go to "API Keys" → "Create API Key"
4. [ ] Copy the key (starts with `gsk_...`)

**Save this:** Your Groq API key

---

## ✅ STEP 3: Setup Google OAuth (5 minutes)

1. [ ] Go to https://console.cloud.google.com
2. [ ] Create new project
3. [ ] Enable "Google+ API"
4. [ ] Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. [ ] Application type: "Web application"
6. [ ] Add authorized redirect URI:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. [ ] Copy Client ID and Client Secret

**Save these:**
- Google Client ID
- Google Client Secret

---

## ✅ STEP 4: Deploy Backend to Railway (10 minutes)

1. [ ] Go to https://railway.app
2. [ ] Click "Start a New Project"
3. [ ] Select "Deploy from GitHub repo"
4. [ ] Authorize Railway and select your repository
5. [ ] Click on your project → "Settings"
6. [ ] Set Root Directory to: `backend`
7. [ ] Go to "Variables" tab and add these:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<paste your MongoDB connection string>
JWT_SECRET=<generate random string - use: https://randomkeygen.com/>
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=<paste your Google Client ID>
GOOGLE_CLIENT_SECRET=<paste your Google Client Secret>
GOOGLE_CALLBACK_URL=<will update after deployment>
FRONTEND_URL=<will update after frontend deployment>
USE_GROQ_API=true
GROQ_API_KEY=<paste your Groq API key>
USE_LOCAL_ML=false
```

8. [ ] Click "Deploy"
9. [ ] Wait for deployment (~3-5 minutes)
10. [ ] Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

**Save this:** Your Railway backend URL

---

## ✅ STEP 5: Update Google OAuth with Railway URL (2 minutes)

1. [ ] Go back to Google Cloud Console → Credentials
2. [ ] Edit your OAuth 2.0 Client ID
3. [ ] Add new authorized redirect URI:
   ```
   https://your-railway-url.up.railway.app/api/auth/google/callback
   ```
4. [ ] Save

---

## ✅ STEP 6: Update Railway Environment Variables (2 minutes)

1. [ ] Go to Railway → Your Project → Variables
2. [ ] Update these variables:
   ```
   GOOGLE_CALLBACK_URL=https://your-railway-url.up.railway.app/api/auth/google/callback
   ```
3. [ ] Railway will auto-redeploy

---

## ✅ STEP 7: Deploy Frontend to Vercel (5 minutes)

1. [ ] Go to https://vercel.com
2. [ ] Sign up with GitHub
3. [ ] Click "Add New" → "Project"
4. [ ] Import your repository
5. [ ] Configure:
   - Framework Preset: **Create React App**
   - Root Directory: **frontend**
   - Build Command: **npm run build**
   - Output Directory: **build**
6. [ ] Add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-railway-url.up.railway.app`
7. [ ] Click "Deploy"
8. [ ] Wait for deployment (~2-3 minutes)
9. [ ] Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

**Save this:** Your Vercel frontend URL

---

## ✅ STEP 8: Final Railway Configuration (2 minutes)

1. [ ] Go to Railway → Your Project → Variables
2. [ ] Update:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
3. [ ] Railway will auto-redeploy

---

## ✅ STEP 9: Update Google OAuth with Vercel URL (2 minutes)

1. [ ] Go to Google Cloud Console → Credentials
2. [ ] Edit your OAuth 2.0 Client ID
3. [ ] Add authorized JavaScript origin:
   ```
   https://your-vercel-url.vercel.app
   ```
4. [ ] Save

---

## ✅ STEP 10: Test Your Deployment (5 minutes)

1. [ ] Open your Vercel URL in browser
2. [ ] Register a new account (Teacher)
3. [ ] Login successfully
4. [ ] Create a test course
5. [ ] Upload a short video (1-2 minutes)
6. [ ] Click "Process Video"
7. [ ] Wait for processing to complete
8. [ ] Logout and register as Student
9. [ ] Watch the video
10. [ ] Answer MCQs when they appear

---

## 🎉 DEPLOYMENT COMPLETE!

Your URLs:
- **Frontend**: https://your-vercel-url.vercel.app
- **Backend**: https://your-railway-url.up.railway.app

---

## 🐛 Quick Troubleshooting

### Problem: "Network Error" when calling API
**Fix**: Check CORS settings in Railway environment variables

### Problem: Google OAuth not working
**Fix**: Verify redirect URIs in Google Cloud Console match exactly

### Problem: Video processing fails
**Fix**: Check Groq API key in Railway environment variables

### Problem: Can't connect to database
**Fix**: Check MongoDB Atlas Network Access allows 0.0.0.0/0

---

## 📝 Important Notes

1. **Free Tier Limits:**
   - Railway: $5 credit/month
   - Vercel: Unlimited for personal projects
   - MongoDB Atlas: 512MB storage
   - Groq API: Check current limits

2. **Environment Variables:**
   - Always use HTTPS URLs in production
   - Never commit API keys to GitHub
   - Use strong JWT_SECRET (random string)

3. **After Deployment:**
   - Share your Vercel URL with teammates
   - They can register and start using the platform
   - Monitor Railway logs for any errors

---

## 🚀 Next Steps

1. [ ] Add custom domain (optional)
2. [ ] Set up monitoring (Sentry)
3. [ ] Configure automated backups
4. [ ] Add more test videos
5. [ ] Invite team members

---

**Total Time**: ~40 minutes
**Cost**: Free (with free tier limits)

Good luck! 🎉
