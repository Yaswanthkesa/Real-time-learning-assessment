# 🔄 Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    START DEPLOYMENT                          │
│              (Code already on GitHub ✓)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: Setup MongoDB Atlas (10 min)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Create account                                   │    │
│  │ 2. Create M0 FREE cluster                          │    │
│  │ 3. Create database user                            │    │
│  │ 4. Whitelist all IPs (0.0.0.0/0)                  │    │
│  │ 5. Get connection string                           │    │
│  └────────────────────────────────────────────────────┘    │
│  Output: mongodb+srv://user:pass@cluster.mongodb.net/db    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: Get Groq API Key (5 min)                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Create Groq account                             │    │
│  │ 2. Generate API key                                │    │
│  └────────────────────────────────────────────────────┘    │
│  Output: gsk_xxxxxxxxxxxxxxxxxxxxx                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: Deploy Backend to Railway (15 min)               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Connect GitHub account                          │    │
│  │ 2. Import repository                               │    │
│  │ 3. Set root directory: backend                     │    │
│  │ 4. Add environment variables:                      │    │
│  │    - MONGODB_URI (from Phase 1)                    │    │
│  │    - GROQ_API_KEY (from Phase 2)                   │    │
│  │    - JWT_SECRET (generate random)                  │    │
│  │    - Other configs                                 │    │
│  │ 5. Deploy and wait                                 │    │
│  │ 6. Generate domain                                 │    │
│  └────────────────────────────────────────────────────┘    │
│  Output: https://your-app.up.railway.app                    │
│  Test: /health endpoint should return OK                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 4: Google OAuth (Optional - 10 min)                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Create Google Cloud project                     │    │
│  │ 2. Enable Google+ API                              │    │
│  │ 3. Create OAuth credentials                        │    │
│  │ 4. Add redirect URI (Railway URL)                  │    │
│  │ 5. Update Railway env vars                         │    │
│  └────────────────────────────────────────────────────┘    │
│  Output: Client ID & Secret                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 5: Deploy Frontend to Vercel (10 min)               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Update frontend/.env.production                 │    │
│  │    REACT_APP_API_URL=<Railway URL>                 │    │
│  │ 2. Commit and push to GitHub                       │    │
│  │ 3. Connect GitHub to Vercel                        │    │
│  │ 4. Import repository                               │    │
│  │ 5. Set root directory: frontend                    │    │
│  │ 6. Add environment variable                        │    │
│  │ 7. Deploy and wait                                 │    │
│  └────────────────────────────────────────────────────┘    │
│  Output: https://your-app.vercel.app                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 6: Final Configuration (5 min)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Update Railway FRONTEND_URL                     │    │
│  │    with Vercel URL                                 │    │
│  │ 2. Update Google OAuth origins                     │    │
│  │    (if using OAuth)                                │    │
│  │ 3. Update backend CORS settings                    │    │
│  │    in code and push                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 7: Testing (10 min)                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✓ Open frontend URL                                │    │
│  │ ✓ Register as teacher                              │    │
│  │ ✓ Login                                            │    │
│  │ ✓ Create course                                    │    │
│  │ ✓ Upload video                                     │    │
│  │ ✓ Process video (wait 2-3 min)                    │    │
│  │ ✓ Register as student                              │    │
│  │ ✓ Watch video with MCQs                           │    │
│  │ ✓ Check progress                                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  ✅ DEPLOYMENT COMPLETE!                     │
│                                                              │
│  Your app is now live at:                                   │
│  Frontend: https://your-app.vercel.app                      │
│  Backend:  https://your-app.up.railway.app                  │
│                                                              │
│  Total Time: 45-60 minutes                                  │
│  Total Cost: FREE (using free tiers)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Data Flow After Deployment

```
┌──────────────┐
│   Student    │
│   Browser    │
└──────┬───────┘
       │ 1. Opens app
       ▼
┌──────────────────────┐
│  Vercel Frontend     │
│  (React App)         │
└──────┬───────────────┘
       │ 2. API calls
       ▼
┌──────────────────────┐
│  Railway Backend     │
│  (Node.js/Express)   │
└──┬────────┬──────────┘
   │        │
   │ 3.     │ 4.
   │ DB     │ ML
   │ ops    │ processing
   ▼        ▼
┌─────┐  ┌──────┐
│Mongo│  │Groq  │
│Atlas│  │ API  │
└─────┘  └──────┘
```

---

## 📊 Component Interaction

```
Frontend (Vercel)
    │
    ├─→ /api/auth/login ────────→ Backend (Railway)
    │                                  │
    ├─→ /api/courses ──────────→      │
    │                                  ├─→ MongoDB Atlas
    ├─→ /api/videos/upload ────→      │
    │                                  │
    └─→ /api/videos/:id/process →     │
                                       └─→ Groq API
                                           (MCQ generation)
```

---

## ⏱️ Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1 | MongoDB Atlas Setup | 10 min |
| 2 | Groq API Key | 5 min |
| 3 | Railway Backend | 15 min |
| 4 | Google OAuth (Optional) | 10 min |
| 5 | Vercel Frontend | 10 min |
| 6 | Final Configuration | 5 min |
| 7 | Testing | 10 min |
| **Total** | | **45-60 min** |

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid (if exceeded) |
|---------|-----------|-------------------|
| Railway | $5 credit/month | ~$5-10/month |
| Vercel | 100GB bandwidth | $20/month (Pro) |
| MongoDB Atlas | 512MB storage | $9/month (M2) |
| Groq API | Rate limited | ~$0.05/video |
| **Total** | **FREE** | **$15-40/month** |

---

## 🎯 Success Indicators

✅ Railway deployment shows "SUCCESS"
✅ Vercel deployment shows "Ready"
✅ Backend /health returns 200 OK
✅ Frontend loads without errors
✅ Can register and login
✅ Can create courses
✅ Can upload videos
✅ Videos process successfully
✅ MCQs appear during playback
✅ Progress tracking works

---

## 🚨 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Backend won't start | Check MongoDB URI in Railway vars |
| Frontend shows Network Error | Verify CORS in backend code |
| Video processing fails | Check Groq API key |
| Can't login | Verify JWT_SECRET is set |
| MongoDB connection fails | Check IP whitelist (0.0.0.0/0) |

---

**Follow DEPLOYMENT_GUIDE.md for detailed step-by-step instructions!**
