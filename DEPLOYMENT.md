# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are set in your production environment:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

# Database
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Optional: App URL for metadata
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Database Setup
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (if using migrations)
npm run db:migrate

# Or push schema (for development/staging)
npm run db:push

# Seed default categories
npm run db:seed
```

### 3. Build & Test
```bash
# Type check
npm run type-check

# Lint
npm run lint:check

# Build for production
npm run build

# Test production build locally
npm start
```

### 4. Security Checklist
- ✅ All environment variables are set correctly
- ✅ Database connection string uses SSL (sslmode=require)
- ✅ Clerk is configured with production keys
- ✅ Sign-up is disabled (single user mode)
- ✅ File uploads directory has proper permissions
- ✅ API routes have authentication checks
- ✅ User data is filtered by userId in all queries

### 5. Performance Optimizations
- ✅ Image optimization enabled in `next.config.ts`
- ✅ Security headers configured
- ✅ Compression enabled
- ✅ Package imports optimized
- ✅ Database queries optimized (parallel queries, no N+1)

### 6. Monitoring & Logging
- Configure error tracking (Sentry, LogRocket, etc.)
- Set up database connection pooling
- Monitor API response times
- Track error rates

## Vercel Deployment

1. Push code to repository
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## Post-Deployment

1. Verify authentication works
2. Test file uploads
3. Verify database connections
4. Check error logs
5. Monitor performance metrics

## Database Connection Pooling

For production, consider using a connection pooler like:
- Neon Connection Pooler (recommended if using Neon)
- PgBouncer
- Supabase Connection Pooler

Update `DATABASE_URL` to use the pooler URL if available.

## Image Optimization

Images are automatically optimized by Next.js:
- WebP/AVIF format conversion
- Responsive sizing
- Lazy loading

Ensure `public/uploads/` directory is writable for receipt uploads.

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear `.next` directory: `rm -rf .next`
- Regenerate Prisma Client: `npm run db:generate`

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check SSL requirements
- Ensure database is accessible from deployment environment

### Authentication Issues
- Verify Clerk keys are production keys (pk_live_/sk_live_)
- Check Clerk dashboard for webhook configurations
- Ensure redirect URLs are correct

