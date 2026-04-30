# Step-by-Step Deployment Instructions

## 🎯 Recommended: Frontend (Vercel) + Backend (Railway)

### PHASE 1: Setup Prerequisites (15 minutes)

#### 1.1 MongoDB Atlas Setup
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (Free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/`
6. Replace `<password>` with your actual password
7. Add database name: `mongodb+srv://username:password@cluster.mongodb.net/intellisense`
8. **Important**: Go to "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

#### 1.2 Groq API Setup
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)
6. Save it securely - you'll need it later

#### 1.3 Google OAuth Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for local testing)
   - `https://your-backend-url.railway.app/api/auth/google/callback` (add after backend deployment)
7. Copy Client ID and Client Secret

---

### PHASE 2: Deploy Backend to Railway (10 minutes)

#### 2.1 Push Code to GitHub
```bash
# If not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

#### 2.2 Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your repository
6. Railway will auto-detect Node.js

#### 2.3 Configure Railway
1. Click on your project
2. Go to "Settings" → "Root Directory" → Set to `backend`
3. Go to "Variables" tab
4. Add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intellisense
JWT_SECRET=your-super-secret-key-change-this-to-random-string
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.up.railway.app/api/auth/google/callback
FRONTEND_URL=https://your-frontend.vercel.app
USE_GROQ_API=true
GROQ_API_KEY=gsk_your_groq_api_key
USE_LOCAL_ML=false
```

5. Click "Deploy" (Railway will automatically deploy)
6. Wait for deployment to complete (~3-5 minutes)
7. Copy your Railway URL (e.g., `https://intellisense-backend-production.up.railway.app`)

#### 2.4 Update Google OAuth
1. Go back to Google Cloud Console
2. Update authorized redirect URI with your Railway URL:
   - `https://your-app.up.railway.app/api/auth/google/callback`

#### 2.5 Test Backend
```bash
# Test health endpoint
curl https://your-app.up.railway.app/health

# Should return: {"status":"ok","message":"Server is running"}
```

---

### PHASE 3: Deploy Frontend to Vercel (5 minutes)

#### 3.1 Update Frontend API URL
1. Open `frontend/.env.production`
2. Update with your Railway backend URL:
```env
REACT_APP_API_URL=https://your-app.up.railway.app
```

3. Commit changes:
```bash
git add frontend/.env.production
git commit -m "Update production API URL"
git push
```

#### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-app.up.railway.app`
7. Click "Deploy"
8. Wait for deployment (~2-3 minutes)
9. Copy your Vercel URL (e.g., `https://intellisense-learning.vercel.app`)

#### 3.3 Update Backend CORS
1. Go to Railway dashboard
2. Update `FRONTEND_URL` environment variable:
   - Value: `https://your-frontend.vercel.app`
3. Railway will automatically redeploy

---

### PHASE 4: Final Configuration (5 minutes)

#### 4.1 Update Backend CORS in Code
Edit `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    'https://*.vercel.app' // Allow Vercel preview deployments
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

Railway will auto-deploy the changes.

#### 4.2 Update Google OAuth (Final)
1. Go to Google Cloud Console
2. Add authorized JavaScript origins:
   - `https://your-frontend.vercel.app`
3. Confirm redirect URI is correct:
   - `https://your-app.up.railway.app/api/auth/google/callback`

---

### PHASE 5: Testing (10 minutes)

#### 5.1 Test Authentication
1. Open your Vercel URL: `https://your-frontend.vercel.app`
2. Click "Register" and create an account
3. Try logging in
4. Try "Sign in with Google"

#### 5.2 Test Course Creation (Teacher)
1. Login as teacher
2. Create a new course
3. Verify course appears in dashboard

#### 5.3 Test Video Upload and Processing
1. Upload a short video (1-2 minutes recommended for first test)
2. Click "Process Video"
3. Wait for processing to complete (~2-3 minutes with Groq API)
4. Check if MCQs are generated

#### 5.4 Test Student Flow
1. Logout and register as student
2. Browse courses
3. Enroll in a course
4. Watch video
5. Answer MCQs when they appear
6. Check progress dashboard

---

## 🎉 SUCCESS CHECKLIST

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] MongoDB Atlas connected
- [ ] Google OAuth working
- [ ] User registration working
- [ ] User login working
- [ ] Course creation working
- [ ] Video upload working
- [ ] Video processing working (with Groq API)
- [ ] MCQs displaying during video playback
- [ ] Progress tracking working
- [ ] Analytics dashboard showing data

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Network Error" when calling API
**Cause**: CORS not configured properly
**Solution**: 
1. Check `FRONTEND_URL` in Railway environment variables
2. Verify CORS configuration in `backend/src/index.ts`
3. Redeploy backend after changes

### Issue 2: "Cannot connect to database"
**Cause**: MongoDB Atlas IP whitelist
**Solution**:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)

### Issue 3: Google OAuth not working
**Cause**: Redirect URI mismatch
**Solution**:
1. Check Google Cloud Console → Credentials
2. Verify redirect URI matches exactly: `https://your-backend-url/api/auth/google/callback`
3. Check `GOOGLE_CALLBACK_URL` in Railway environment variables

### Issue 4: Video processing fails
**Cause**: Groq API key not set or invalid
**Solution**:
1. Verify `GROQ_API_KEY` in Railway environment variables
2. Check `USE_GROQ_API=true` is set
3. Check Groq API dashboard for usage limits

### Issue 5: Videos not uploading
**Cause**: File size limit or storage issue
**Solution**:
1. Railway has persistent storage - should work
2. Check Railway logs for errors
3. Consider implementing Cloudinary if issues persist

### Issue 6: Frontend shows old API URL
**Cause**: Environment variable not updated
**Solution**:
1. Go to Vercel → Project Settings → Environment Variables
2. Update `REACT_APP_API_URL`
3. Redeploy frontend (Vercel → Deployments → Redeploy)

---

## 📊 MONITORING YOUR DEPLOYMENT

### Railway (Backend)
- View logs: Railway Dashboard → Your Project → Logs
- Monitor usage: Railway Dashboard → Usage
- Check metrics: CPU, Memory, Network

### Vercel (Frontend)
- View deployments: Vercel Dashboard → Your Project → Deployments
- Check analytics: Vercel Dashboard → Analytics
- Monitor performance: Vercel Dashboard → Speed Insights

### MongoDB Atlas
- Monitor connections: Atlas Dashboard → Metrics
- Check storage: Atlas Dashboard → Collections
- View logs: Atlas Dashboard → Logs

---

## 💡 OPTIMIZATION TIPS

### Backend Performance
1. Enable MongoDB connection pooling (already configured)
2. Add Redis caching for frequently accessed data
3. Implement CDN for video streaming (Cloudflare)

### Frontend Performance
1. Enable Vercel Analytics
2. Implement lazy loading for routes
3. Optimize images and thumbnails

### Cost Optimization
1. Monitor Railway usage (free tier: $5 credit/month)
2. Use Groq API efficiently (cache results when possible)
3. Implement video compression before upload

---

## 🚀 NEXT STEPS AFTER DEPLOYMENT

1. **Custom Domain**: Add your own domain to Vercel
2. **SSL Certificate**: Automatic with Vercel and Railway
3. **Monitoring**: Set up error tracking (Sentry)
4. **Backups**: Configure MongoDB Atlas automated backups
5. **CI/CD**: Set up automatic deployments on git push
6. **Testing**: Add automated tests before deployment

---

## 📞 SUPPORT RESOURCES

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Groq API**: [console.groq.com/docs](https://console.groq.com/docs)

---

**Estimated Total Time**: 45-60 minutes
**Cost**: Free tier for testing, ~$20-30/month for production

Good luck with your deployment! 🎉
