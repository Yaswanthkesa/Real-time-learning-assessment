# ⚡ Quick Deployment Checklist

Use this as a quick reference while following the detailed DEPLOYMENT_GUIDE.md

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub: https://github.com/Yaswanthkesa/Real-time-learning-assessment
- [ ] Have a Google account ready (for MongoDB, Railway, Vercel)
- [ ] Have 45-60 minutes available

---

## 🗄️ PHASE 1: MongoDB Atlas (10 min)

- [ ] Create account: https://www.mongodb.com/cloud/atlas/register
- [ ] Create M0 FREE cluster
- [ ] Create database user: `intellisense-admin`
- [ ] Save password: `___________________________`
- [ ] Setup network access: 0.0.0.0/0
- [ ] Get connection string
- [ ] Save connection string: `mongodb+srv://...`

---

## 🤖 PHASE 2: Groq API (5 min)

- [ ] Create account: https://console.groq.com
- [ ] Create API key
- [ ] Save API key: `gsk_...`

---

## 🚂 PHASE 3: Railway Backend (15 min)

- [ ] Create account: https://railway.app
- [ ] Deploy from GitHub repo
- [ ] Set root directory: `backend`
- [ ] Add environment variables:
  ```
  NODE_ENV=production
  PORT=5000
  MONGODB_URI=<your-mongodb-uri>
  JWT_SECRET=<random-32-char-string>
  JWT_EXPIRE=7d
  USE_GROQ_API=true
  GROQ_API_KEY=<your-groq-key>
  USE_LOCAL_ML=false
  FRONTEND_URL=https://your-frontend.vercel.app
  ```
- [ ] Wait for deployment
- [ ] Generate domain
- [ ] Save Railway URL: `https://...up.railway.app`
- [ ] Test: Open `https://your-url.up.railway.app/health`
- [ ] Should see: `{"status":"ok","message":"Server is running"}`

---

## 🔐 PHASE 4: Google OAuth (Optional - 10 min)

- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth credentials
- [ ] Save Client ID: `___________________________`
- [ ] Save Client Secret: `___________________________`
- [ ] Add to Railway variables:
  ```
  GOOGLE_CLIENT_ID=<your-client-id>
  GOOGLE_CLIENT_SECRET=<your-client-secret>
  GOOGLE_CALLBACK_URL=https://your-railway-url/api/auth/google/callback
  ```

---

## ▲ PHASE 5: Vercel Frontend (10 min)

- [ ] Update `frontend/.env.production`:
  ```
  REACT_APP_API_URL=https://your-railway-url.up.railway.app
  ```
- [ ] Commit and push changes
- [ ] Create account: https://vercel.com
- [ ] Import GitHub repo
- [ ] Set root directory: `frontend`
- [ ] Add environment variable:
  - Name: `REACT_APP_API_URL`
  - Value: `https://your-railway-url.up.railway.app`
- [ ] Deploy
- [ ] Save Vercel URL: `https://...vercel.app`

---

## 🔧 PHASE 6: Final Config (5 min)

- [ ] Update Railway `FRONTEND_URL` with Vercel URL
- [ ] Update Google OAuth origins (if using)
- [ ] Update backend CORS in `backend/src/index.ts`
- [ ] Commit and push CORS changes

---

## ✅ PHASE 7: Testing (10 min)

- [ ] Open frontend URL
- [ ] Register as teacher
- [ ] Login works
- [ ] Create test course
- [ ] Upload short video (1-2 min)
- [ ] Process video
- [ ] Wait for MCQs (2-3 min)
- [ ] Register as student
- [ ] Enroll in course
- [ ] Watch video
- [ ] MCQs appear during playback
- [ ] Check progress dashboard

---

## 📝 SAVE THESE URLS

**Frontend**: `___________________________`

**Backend**: `___________________________`

**MongoDB**: `___________________________`

---

## 🎯 SUCCESS CRITERIA

✅ All 7 phases completed
✅ All tests passed
✅ No errors in Railway logs
✅ No errors in Vercel logs
✅ No errors in browser console

---

## 🆘 QUICK FIXES

**Backend not working?**
→ Check Railway logs, verify MongoDB URI

**Frontend shows Network Error?**
→ Check CORS in backend, verify API URL in Vercel

**Video processing fails?**
→ Check Groq API key, try shorter video

**Can't login?**
→ Check JWT_SECRET is set, verify MongoDB connection

---

## 📞 NEED HELP?

1. Check DEPLOYMENT_GUIDE.md for detailed steps
2. Check Railway logs for backend errors
3. Check Vercel logs for frontend errors
4. Check browser console for client errors

---

**Estimated Time**: 45-60 minutes
**Cost**: FREE (using free tiers)
