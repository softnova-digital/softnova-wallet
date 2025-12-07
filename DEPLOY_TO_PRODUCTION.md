# Deploy to Production - Quick Guide

Since you're already set up with Vercel + Git integration, deploying to production is simple:

## 🚀 Quick Deploy Steps

### Option 1: Automatic Deployment (Recommended)
Just push to `main` branch - Vercel will automatically deploy:

```bash
# 1. Commit all changes
git add .
git commit -m "Production ready: Final optimizations and production checklist"

# 2. Push to main (triggers automatic production deployment)
git push origin main
```

Vercel will:
- ✅ Automatically detect the push
- ✅ Run the build command (`prisma generate && next build`)
- ✅ Deploy to production
- ✅ Make it live on your production URL

### Option 2: Manual Deployment via Vercel CLI
If you prefer manual control:

```bash
vercel --prod
```

## ⚠️ Pre-Deployment Checklist

Before pushing, make sure:

- [x] All code changes committed
- [x] Production readiness checks passed
- [ ] **Environment variables set in Vercel dashboard**
- [ ] **Database migrations run** (if schema changed)

## 📋 Important: Set Environment Variables in Vercel

Go to your Vercel project dashboard:
1. Settings → Environment Variables
2. Add all required variables for **Production**:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_APP_URL` (optional but recommended)

## 🔍 Monitor Deployment

After pushing:
1. Go to your Vercel dashboard
2. Check the deployment logs
3. Verify build succeeds
4. Test your production URL

## ✅ Post-Deployment Verification

Once deployed, test:
- [ ] Sign in works
- [ ] Dashboard loads correctly
- [ ] Create/update/delete expenses
- [ ] Upload receipts
- [ ] All features functioning

---

**Ready to deploy?** Run the commands above! 🚀
