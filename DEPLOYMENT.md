# Deployment Guide for Vercel

This guide will help you deploy your Softnova Expenses application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A PostgreSQL database (recommended: Neon, Supabase, or Railway)
- A Cloudinary account for receipt uploads
- Clerk account for authentication

## Step 1: Prepare Your Database

1. **Set up your PostgreSQL database:**
   - Recommended providers:
     - [Neon](https://neon.tech) - Serverless PostgreSQL
     - [Supabase](https://supabase.com) - Open source Firebase alternative
     - [Railway](https://railway.app) - Simple database hosting
   
2. **Get your database connection string:**
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
   - Make sure to enable SSL

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

## Step 2: Set Up Environment Variables

In your Vercel project settings, add the following environment variables:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Cloudinary (for receipt uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Application URL (optional but recommended)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Optional Variables

```env
# Clerk Webhook Secret (if using webhooks)
CLERK_WEBHOOK_SECRET=whsec_...

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **For production:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy via GitHub Integration

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import project in Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure environment variables:**
   - Add all required environment variables in project settings
   - Make sure to add them for Production, Preview, and Development

4. **Deploy:**
   - Vercel will automatically deploy on every push to main
   - Preview deployments are created for pull requests

## Step 4: Configure Build Settings

Vercel will automatically detect Next.js, but you can verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install`

The `vercel.json` file in the root already configures these settings.

## Step 5: Post-Deployment Steps

1. **Verify Prisma Client Generation:**
   - Check build logs to ensure `prisma generate` runs successfully
   - The `postinstall` script in `package.json` also runs this

2. **Test Your Application:**
   - Visit your deployed URL
   - Test authentication flow
   - Test expense/income creation
   - Test receipt uploads

3. **Set Up Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

## Step 6: Database Connection Pooling (Recommended)

For serverless environments like Vercel, use connection pooling:

### Neon
- Use the connection pooler URL (ends with `-pooler`)
- Format: `postgresql://user:password@host-pooler:port/database?sslmode=require`

### Supabase
- Use the connection pooler URL from Supabase dashboard
- Enable connection pooling in Supabase settings

### Railway
- Railway automatically handles connection pooling

## Performance Optimizations

The application is already optimized for Vercel with:

- ✅ Standalone output mode
- ✅ Optimized Prisma client
- ✅ React Query caching
- ✅ Image optimization
- ✅ Code splitting
- ✅ Bundle optimization

## Monitoring

1. **Vercel Analytics:**
   - Enable in Project Settings → Analytics
   - Monitor performance metrics

2. **Error Tracking:**
   - Check Vercel logs for errors
   - Set up error notifications

3. **Database Monitoring:**
   - Monitor connection pool usage
   - Set up alerts for high usage

## Troubleshooting

### Build Fails

- **Prisma Client not generated:**
  - Ensure `DATABASE_URL` is set correctly
  - Check that `prisma generate` runs in build logs

- **Environment variables missing:**
  - Verify all required variables are set
  - Check variable names match exactly

### Runtime Errors

- **Database connection issues:**
  - Verify `DATABASE_URL` is correct
  - Check database is accessible from Vercel
  - Ensure SSL is enabled

- **Authentication not working:**
  - Verify Clerk keys are correct
  - Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
  - Ensure callback URLs are configured in Clerk

### Performance Issues

- **Slow API routes:**
  - Check database query performance
  - Review connection pooling setup
  - Monitor Vercel function logs

- **Large bundle size:**
  - Check bundle analyzer output
  - Review imported dependencies
  - Consider code splitting

## Support

For issues specific to:
- **Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Prisma:** [prisma.io/docs](https://www.prisma.io/docs)
- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)

## Security Checklist

- ✅ Environment variables are set (never commit secrets)
- ✅ Database uses SSL connections
- ✅ Clerk authentication is configured
- ✅ Cloudinary API keys are secured
- ✅ CORS is properly configured
- ✅ Rate limiting is considered (Vercel Pro)

## Next Steps

After deployment:

1. Set up monitoring and alerts
2. Configure custom domain
3. Set up staging environment
4. Enable Vercel Analytics
5. Configure backup strategy for database
