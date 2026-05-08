# 🚀 Deployment Guide - Step by Step

## Overview
You'll deploy your IntelliSense Learning Platform in this order:
1. **Database** (MongoDB Atlas) - 10 minutes
2. **Backend** (Railway) - 15 minutes  
3. **Frontend** (Vercel) - 10 minutes
4. **Testing** - 10 minutes

**Total Time**: ~45 minutes
**Cost**: FREE (using free tiers)

---

## 📋 PHASE 1: Setup MongoDB Atlas (10 minutes)

### Step 1.1: Create MongoDB Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Click **"Sign up"**
3. Choose **"Sign up with Google"** (easiest) or use email
4. Complete registration

### Step 1.2: Create Free Cluster
1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select cloud provider: **AWS** (recommended)
4. Select region: Choose closest to you (e.g., **US East** or **Mumbai**)
5. Cluster name: Leave as default or name it `intellisense-cluster`
6. Click **"Create"**
7. Wait 3-5 minutes for cluster creation

### Step 1.3: Create Database User
1. You'll see "Security Quickstart"
2. **Authentication Method**: Username and Password
3. **Username**: `intellisense-admin`
4. **Password**: Click "Autogenerate Secure Password" 
   - **IMPORTANT**: Copy and save this password somewhere safe!
5. Click **"Create User"**

### Step 1.4: Setup Network Access
1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Confirm: `0.0.0.0/0` (allows Railway/Vercel to connect)
5. Click **"Confirm"**

### Step 1.5: Get Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://intellisense-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual password
7. **Add database name** at the end:
   ```
   mongodb+srv://intellisense-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/intellisense?retryWrites=true&w=majority
   ```
8. **Save this connection string** - you'll need it for Railway!

✅ **MongoDB Atlas Setup Complete!**

---

## 📋 PHASE 2: Get Groq API Key (5 minutes)

### Step 2.1: Create Groq Account
1. Go to: https://console.groq.com
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with Google or email
4. Verify your email if required

### Step 2.2: Create API Key
1. After login, go to **"API Keys"** section
2. Click **"Create API Key"**
3. Name it: `intellisense-production`
4. Click **"Create"**
5. **Copy the API key** (starts with `gsk_...`)
   - **IMPORTANT**: Save this key! You can't see it again!
6. **Save this API key** - you'll need it for Railway!

✅ **Groq API Key Obtained!**

---

## 📋 PHASE 3: Deploy Backend to Railway (15 minutes)

### Step 3.1: Create Railway Account
1. Go to: https://railway.app
2. Click **"Login"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub

### Step 3.2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`Yaswanthkesa/Real-time-learning-assessment`**
4. Railway will start deploying automatically

### Step 3.3: Configure Backend
1. Click on your deployed service (should show "intellisense-backend" or similar)
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Click **"Edit"** and set to: `backend`
5. Click **"Save"**

### Step 3.4: Add Environment Variables
1. Go to **"Variables"** tab
2. Click **"Raw Editor"** (top right)
3. Paste this (replace with YOUR values):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://intellisense-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/intellisense?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-random-string-min-32-characters-long-change-this
JWT_EXPIRE=7d
USE_GROQ_API=true
GROQ_API_KEY=gsk_your_groq_api_key_here
USE_LOCAL_ML=false
FRONTEND_URL=https://your-frontend.vercel.app
```

**IMPORTANT**: 
- Replace `MONGODB_URI` with your actual MongoDB connection string
- Replace `JWT_SECRET` with a random 32+ character string (you can use: https://randomkeygen.com/)
- Replace `GROQ_API_KEY` with your actual Groq API key
- Leave `FRONTEND_URL` as is for now (we'll update it later)

4. Click **"Save"** or press Ctrl+S
5. Railway will automatically redeploy

### Step 3.5: Wait for Deployment
1. Go to **"Deployments"** tab
2. Wait for status to show **"SUCCESS"** (2-3 minutes)
3. If it fails, check **"Logs"** for errors

### Step 3.6: Get Your Backend URL
1. Go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Copy your Railway URL (looks like):
   ```
   https://real-time-learning-assessment-production.up.railway.app
   ```
5. **Save this URL** - you'll need it for frontend!

### Step 3.7: Test Backend
1. Open your Railway URL in browser: `https://your-url.up.railway.app/health`
2. You should see:
   ```json
   {"status":"ok","message":"Server is running"}
   ```
3. If you see this, backend is working! ✅

✅ **Backend Deployed to Railway!**

---

## 📋 PHASE 4: Setup Google OAuth (Optional - 10 minutes)

**Note**: Skip this if you don't want Google Sign-In feature.

### Step 4.1: Create Google Cloud Project
1. Go to: https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Project name: `IntelliSense Learning`
4. Click **"Create"**

### Step 4.2: Enable Google+ API
1. In left menu, go to **"APIs & Services"** → **"Library"**
2. Search for: `Google+ API`
3. Click on it and click **"Enable"**

### Step 4.3: Create OAuth Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. If prompted, configure consent screen:
   - User Type: **External**
   - App name: `IntelliSense Learning`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"** through all steps
4. Back to Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `IntelliSense Production`
   - **Authorized JavaScript origins**:
     - Add: `https://your-frontend.vercel.app` (we'll update this later)
   - **Authorized redirect URIs**:
     - Add: `https://your-railway-url.up.railway.app/api/auth/google/callback`
   - Click **"Create"**
5. **Copy Client ID and Client Secret**
6. Save these for Railway environment variables

### Step 4.4: Update Railway Environment Variables
1. Go back to Railway → Your Project → Variables
2. Add these variables:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=https://your-railway-url.up.railway.app/api/auth/google/callback
   ```
3. Railway will auto-redeploy

✅ **Google OAuth Configured!** (Optional)

---

## 📋 PHASE 5: Deploy Frontend to Vercel (10 minutes)

### Step 5.1: Update Frontend Environment File
1. Open your project in VS Code
2. Edit `frontend/.env.production`
3. Update with your Railway URL:
   ```env
   REACT_APP_API_URL=https://your-railway-url.up.railway.app
   ```
4. Save the file

### Step 5.2: Commit and Push Changes
```bash
git add frontend/.env.production
git commit -m "Update production API URL"
git push
```

### Step 5.3: Create Vercel Account
1. Go to: https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### Step 5.4: Import Project
1. Click **"Add New"** → **"Project"**
2. Find and select: **`Yaswanthkesa/Real-time-learning-assessment`**
3. Click **"Import"**

### Step 5.5: Configure Project
1. **Framework Preset**: Should auto-detect as **"Create React App"**
2. **Root Directory**: Click **"Edit"** and set to: `frontend`
3. **Build Command**: `npm run build` (should be default)
4. **Output Directory**: `build` (should be default)
5. **Install Command**: `npm install` (should be default)

### Step 5.6: Add Environment Variable
1. Expand **"Environment Variables"** section
2. Add variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-railway-url.up.railway.app`
3. Click **"Add"**

### Step 5.7: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. You'll see "Congratulations!" when done

### Step 5.8: Get Your Frontend URL
1. Copy your Vercel URL (looks like):
   ```
   https://real-time-learning-assessment.vercel.app
   ```
2. **Save this URL**

✅ **Frontend Deployed to Vercel!**

---

## 📋 PHASE 6: Final Configuration (5 minutes)

### Step 6.1: Update Railway with Frontend URL
1. Go to Railway → Your Project → Variables
2. Update `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. Railway will auto-redeploy

### Step 6.2: Update Google OAuth (if configured)
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth Client ID
3. Update **Authorized JavaScript origins**:
   - Add: `https://your-frontend.vercel.app`
4. Click **"Save"**

### Step 6.3: Update Backend CORS (Important!)
1. Open your project in VS Code
2. Edit `backend/src/index.ts`
3. Find the CORS configuration and update:
   ```typescript
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-frontend.vercel.app',
       'https://*.vercel.app'
     ],
     credentials: true
   }));
   ```
4. Save and push:
   ```bash
   git add backend/src/index.ts
   git commit -m "Update CORS for production"
   git push
   ```
5. Railway will auto-redeploy

✅ **Final Configuration Complete!**

---

## 📋 PHASE 7: Testing (10 minutes)

### Test 1: Open Your App
1. Go to: `https://your-frontend.vercel.app`
2. You should see the login page

### Test 2: Register Account
1. Click **"Register"**
2. Fill in:
   - Name: Your name
   - Email: Your email
   - Password: Create a password
   - Role: Select **"Teacher"**
3. Click **"Register"**
4. You should be redirected to dashboard

### Test 3: Login
1. Logout if logged in
2. Click **"Login"**
3. Enter your credentials
4. Click **"Login"**
5. Should redirect to dashboard ✅

### Test 4: Create Course (Teacher)
1. Click **"Create Course"**
2. Fill in:
   - Course Name: "Test Course"
   - Description: "This is a test"
   - Category: "Technology"
   - Difficulty: "Beginner"
3. Click **"Create Course"**
4. Course should appear in your dashboard ✅

### Test 5: Upload Video
1. Click on your test course
2. Click **"Upload Video"**
3. Select a SHORT video (1-2 minutes recommended for first test)
4. Wait for upload to complete
5. Video should appear in course ✅

### Test 6: Process Video
1. Click **"Process Video"** button
2. Wait 2-3 minutes (check Railway logs for progress)
3. Status should change to "Completed"
4. MCQs should be generated ✅

### Test 7: Student View
1. Logout
2. Register as **"Student"**
3. Browse courses
4. Enroll in test course
5. Watch video
6. MCQs should appear during playback ✅

### Test 8: Check Progress
1. As student, go to **"My Progress"**
2. You should see:
   - Courses enrolled
   - Watch time
   - MCQ scores ✅

---

## 🎉 SUCCESS CHECKLIST

- [ ] MongoDB Atlas cluster created and running
- [ ] Groq API key obtained
- [ ] Backend deployed to Railway
- [ ] Backend health check returns OK
- [ ] Frontend deployed to Vercel
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Course creation works
- [ ] Video upload works
- [ ] Video processing works (MCQs generated)
- [ ] Student can watch videos
- [ ] MCQs appear during video playback
- [ ] Progress tracking works

---

## 🐛 TROUBLESHOOTING

### Issue: Backend health check fails
**Solution**: 
- Check Railway logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Issue: Frontend shows "Network Error"
**Solution**:
- Check `REACT_APP_API_URL` in Vercel
- Verify CORS is configured correctly in backend
- Check Railway backend is running

### Issue: MongoDB connection fails
**Solution**:
- Verify connection string is correct
- Check MongoDB Atlas → Network Access → 0.0.0.0/0 is whitelisted
- Ensure password doesn't have special characters (or URL encode them)

### Issue: Video processing fails
**Solution**:
- Check Groq API key is correct
- Verify `USE_GROQ_API=true` in Railway
- Check Railway logs for specific error
- Try with a shorter video (1-2 minutes)

### Issue: Google OAuth not working
**Solution**:
- Verify redirect URI matches exactly in Google Console
- Check `GOOGLE_CALLBACK_URL` in Railway
- Ensure Google+ API is enabled

---

## 📊 YOUR DEPLOYMENT URLS

After completing all steps, save these URLs:

**Frontend (Vercel)**:
```
https://real-time-learning-assessment.vercel.app
```

**Backend (Railway)**:
```
https://real-time-learning-assessment-production.up.railway.app
```

**Database (MongoDB Atlas)**:
```
mongodb+srv://intellisense-admin:PASSWORD@cluster0.xxxxx.mongodb.net/intellisense
```

---

## 💰 COST BREAKDOWN

### Free Tier Limits:
- **Railway**: $5 credit/month (enough for ~500 hours)
- **Vercel**: 100GB bandwidth, unlimited deployments
- **MongoDB Atlas**: 512MB storage, shared cluster
- **Groq API**: Free tier with rate limits

### If You Exceed Free Tier:
- **Railway**: ~$5-10/month
- **Vercel Pro**: $20/month (optional)
- **MongoDB M2**: $9/month
- **Groq API**: Pay per use (~$0.05 per video)

**Estimated Total**: $0-30/month depending on usage

---

## 🔄 UPDATING YOUR APP

### To update backend code:
```bash
git add backend/
git commit -m "Update backend"
git push
```
Railway will auto-deploy.

### To update frontend code:
```bash
git add frontend/
git commit -m "Update frontend"
git push
```
Vercel will auto-deploy.

---

## 📞 SUPPORT RESOURCES

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Groq API**: https://console.groq.com/docs

---

## ✅ NEXT STEPS AFTER DEPLOYMENT

1. **Add Custom Domain** (Optional):
   - Vercel: Settings → Domains → Add your domain
   - Railway: Settings → Domains → Add custom domain

2. **Setup Monitoring**:
   - Railway: Built-in metrics in dashboard
   - Vercel: Analytics tab for frontend metrics

3. **Backup Database**:
   - MongoDB Atlas: Automated backups enabled by default

4. **Scale if Needed**:
   - Railway: Upgrade plan for more resources
   - MongoDB: Upgrade to M2 cluster for more storage

---

**Congratulations! Your IntelliSense Learning Platform is now live! 🎉**

Total deployment time: ~45-60 minutes
