# Vercel Deployment Guide for IntelliSense Learning Platform

## ⚠️ IMPORTANT LIMITATIONS

**Vercel has significant limitations for this project:**

1. **No Python/ML Support**: Vercel serverless functions don't support Python ML models (Whisper, Mistral-7B)
2. **10-second timeout**: Serverless functions timeout after 10 seconds (Pro: 60s, Enterprise: 900s)
3. **No persistent file storage**: Uploaded videos won't persist between deployments
4. **Memory limits**: 1GB RAM (Pro: 3GB) - insufficient for ML models

## 🎯 RECOMMENDED DEPLOYMENT STRATEGY

### Option 1: Hybrid Deployment (RECOMMENDED)
- **Frontend**: Deploy to Vercel ✅
- **Backend + ML**: Deploy to Railway, Render, or DigitalOcean ✅

### Option 2: Full Vercel (LIMITED FUNCTIONALITY)
- Deploy frontend to Vercel
- Use Groq API for ML processing (no local models)
- Use external storage (AWS S3, Cloudinary) for videos
- Use MongoDB Atlas for database

### Option 3: Alternative Platforms
- **Railway**: Supports full stack + Python + file storage
- **Render**: Free tier with Docker support
- **DigitalOcean App Platform**: Full control with droplets
- **AWS/GCP/Azure**: Complete infrastructure control

---

## 🚀 DEPLOYMENT OPTION 1: Frontend on Vercel + Backend Elsewhere

This is the **BEST** approach for your project.

### Step 1: Deploy Backend to Railway/Render

**Railway (Recommended):**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Add environment variables (see below)
7. Railway provides a URL like: `https://your-app.up.railway.app`

**Environment Variables for Backend:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.railway.app/api/auth/google/callback
FRONTEND_URL=https://your-frontend.vercel.app
USE_GROQ_API=true
GROQ_API_KEY=your-groq-api-key
```

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
7. Deploy!

### Step 3: Update Backend CORS

Update `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app',
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true
}));
```

---

## 🚀 DEPLOYMENT OPTION 2: Full Vercel (Limited)

**⚠️ This option requires:**
- Groq API for ML processing (no local models)
- MongoDB Atlas (cloud database)
- External storage for videos (AWS S3 or Cloudinary)

### Step 1: Prepare Backend for Vercel Serverless

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 2: Modify Backend for Serverless

Create `backend/api/index.ts`:
```typescript
import app from '../src/index';

// Export for Vercel serverless
export default app;
```

### Step 3: Remove File Upload (Use Cloud Storage)

You'll need to replace Multer with cloud storage:

**Install Cloudinary:**
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

**Update video upload to use Cloudinary:**
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'intellisense-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'avi', 'mov']
  }
});

export const upload = multer({ storage });
```

### Step 4: Use Only Groq API (No Local ML)

Update `backend/.env`:
```env
USE_GROQ_API=true
GROQ_API_KEY=your-groq-api-key
USE_LOCAL_ML=false
```

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 📋 COMPLETE SETUP CHECKLIST

### Prerequisites

- [ ] MongoDB Atlas account (free tier available)
- [ ] Groq API key (for ML processing)
- [ ] Google OAuth credentials
- [ ] GitHub repository

### Backend Setup

- [ ] Create MongoDB Atlas cluster
- [ ] Get connection string
- [ ] Create Groq API account
- [ ] Get Groq API key
- [ ] Set up Google OAuth (add production URLs)
- [ ] Choose deployment platform (Railway/Render/Vercel)

### Frontend Setup

- [ ] Update API URL in frontend code
- [ ] Build frontend locally to test
- [ ] Prepare environment variables

### Deployment

- [ ] Deploy backend first
- [ ] Note backend URL
- [ ] Update frontend environment variables
- [ ] Deploy frontend
- [ ] Test authentication flow
- [ ] Test video upload and processing

---

## 🔧 CONFIGURATION FILES

I'll create the necessary configuration files for you in the next step.

---

## 🐛 TROUBLESHOOTING

### Issue: CORS errors
**Solution:** Add your Vercel URL to backend CORS configuration

### Issue: API calls failing
**Solution:** Check `REACT_APP_API_URL` is set correctly in Vercel

### Issue: Video upload fails
**Solution:** Implement cloud storage (Cloudinary/S3) instead of local storage

### Issue: ML processing timeout
**Solution:** Use Groq API instead of local models

### Issue: Database connection fails
**Solution:** Whitelist Vercel IPs in MongoDB Atlas (or allow all: 0.0.0.0/0)

---

## 💰 COST ESTIMATION

### Free Tier (Recommended for Testing)
- **Vercel**: Free (100GB bandwidth, unlimited deployments)
- **Railway**: $5/month credit (enough for small projects)
- **MongoDB Atlas**: Free (512MB storage)
- **Groq API**: Free tier available

### Production (Estimated)
- **Vercel Pro**: $20/month (if needed)
- **Railway**: ~$10-20/month (depending on usage)
- **MongoDB Atlas**: $9/month (M2 cluster)
- **Groq API**: Pay per use (~$0.05 per video)

**Total**: ~$20-50/month for production

---

## 🎯 NEXT STEPS

1. Choose your deployment strategy (Option 1 recommended)
2. Set up MongoDB Atlas
3. Get Groq API key
4. Deploy backend to Railway/Render
5. Deploy frontend to Vercel
6. Test the complete flow

Would you like me to create the specific configuration files for your chosen deployment option?
