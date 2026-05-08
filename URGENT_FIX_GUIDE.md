# 🚨 URGENT FIX: Google OAuth Redirect Issue

## Problem
After Google OAuth login, users are redirected to a non-existent Vercel deployment URL instead of the production site.

## Root Cause
The `FRONTEND_URL` environment variable on Render is pointing to the wrong Vercel URL.

---

## ✅ IMMEDIATE FIX (5 minutes)

### Step 1: Update Render Environment Variable

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on**: `intellisense-backend`
3. **Click on**: "Environment" (left sidebar)
4. **Find**: `FRONTEND_URL`
5. **Change the value to**: `https://intellisense-git-main-yaswanthkesas-projects.vercel.app`
6. **Click**: "Save Changes"
7. **Wait**: 2-3 minutes for Render to redeploy

### Step 2: Test Google OAuth

1. **Open incognito window**
2. **Go to**: `https://intellisense-git-main-yaswanthkesas-projects.vercel.app`
3. **Click**: "Sign in with Google"
4. **Select your Google account**
5. **Should redirect properly now**

---

## 🔧 ALTERNATIVE: Use Main Domain (Recommended)

If the git-main URL is too long, let's fix the main domain:

### Fix Vercel Domain Assignment

1. **Go to Vercel Dashboard**
2. **Click on your project**
3. **Go to**: Deployments tab
4. **Find the latest "Ready" deployment**
5. **Click the three dots (•••)**
6. **Click**: "Promote to Production"
7. **Wait 1-2 minutes**
8. **Update Render `FRONTEND_URL` to**: `https://intellisense-phj.vercel.app`

---

## 📋 COMPLETE CHECKLIST

### Render Backend Environment Variables (MUST BE EXACT)
```
FRONTEND_URL=https://intellisense-git-main-yaswanthkesas-projects.vercel.app
GOOGLE_CALLBACK_URL=https://intellisense-backend.onrender.com/api/auth/google/callback
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Vercel Frontend Environment Variables
```
REACT_APP_API_URL=https://intellisense-backend.onrender.com/api
```

### Google Cloud Console OAuth Settings
**Authorized JavaScript origins:**
```
https://intellisense-git-main-yaswanthkesas-projects.vercel.app
https://intellisense-phj.vercel.app
https://intellisense-backend.onrender.com
```

**Authorized redirect URIs:**
```
https://intellisense-backend.onrender.com/api/auth/google/callback
```

---

## 🧪 TESTING STEPS

### Test 1: Normal Registration (Should Work)
1. Go to site
2. Click "Register here"
3. Fill form: name, email, password, role
4. Click Register
5. ✅ Should redirect to dashboard

### Test 2: Normal Login (Should Work)
1. Go to site
2. Enter email and password
3. Click Login
4. ✅ Should redirect to dashboard

### Test 3: Google OAuth (Should Work After Fix)
1. Go to site
2. Click "Sign in with Google"
3. Select Google account
4. ✅ Should redirect to role selection or dashboard

---

## 🎯 QUICK ACTION PLAN

**DO THIS NOW:**

1. ✅ Turn OFF "Vercel Authentication" in Vercel Settings → Deployment Protection
2. ✅ Update Render `FRONTEND_URL` to: `https://intellisense-git-main-yaswanthkesas-projects.vercel.app`
3. ✅ Wait 2-3 minutes for Render to redeploy
4. ✅ Test in incognito: `https://intellisense-git-main-yaswanthkesas-projects.vercel.app`
5. ✅ Try Google OAuth login

**TOTAL TIME: 5 minutes**

---

## 🚀 WORKING URLS

**Frontend (Use this one):**
`https://intellisense-git-main-yaswanthkesas-projects.vercel.app`

**Backend:**
`https://intellisense-backend.onrender.com`

**Backend Health Check:**
`https://intellisense-backend.onrender.com/health`

---

## ❌ COMMON MISTAKES TO AVOID

1. ❌ Don't use `intellisense-phj.vercel.app` until it's properly assigned to production
2. ❌ Don't forget `/api` at the end of `REACT_APP_API_URL`
3. ❌ Don't leave "Vercel Authentication" enabled
4. ❌ Don't forget to wait for Render to redeploy after changing env vars

---

## 💡 WHY THIS HAPPENS

When you redeploy on Vercel, it creates preview deployments with unique URLs. The backend was redirecting to one of these preview URLs instead of the production URL. By using the git-main URL (which is stable) or properly assigning the custom domain, the redirect will work correctly.

---

**START WITH STEP 1 NOW!** ⬆️
