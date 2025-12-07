# Softnova Wallet - Expense & Income Tracker

A production-ready full-stack financial management application built for Softnova Digital to track company expenses, incomes, manage budgets, and categorize spending with comprehensive reporting.

## 🚀 Features

### Core Functionality

- **Authentication**: Secure login with Clerk (Single company user only - sign-up disabled)
- **Expense Management**: Complete expense tracking with detailed information
  - Amount, optional description, date
  - Payee tracking
  - Custom labels for organization
  - Track who recorded each expense
  - Receipt attachments (images/PDFs)
- **Income Management**: Track all income sources
  - Amount, optional description, date
  - Source tracking (client, employer, etc.)
  - Category-based organization
- **Categories**: Unified category system for both expenses and incomes
  - Full CRUD operations
  - Custom icons and colors
  - Type-based filtering (EXPENSE/INCOME)
- **Budget Tracking**: Set and monitor financial goals
  - Weekly, monthly, or yearly budgets
  - Overall or per-category budgets
  - Visual progress indicators
  - Budget alerts when approaching limits
- **Dashboard**: Real-time overview with charts and recent activity
  - Spending trends
  - Income vs. Expense analysis
  - Recent transactions
  - Budget status

### Advanced Features

- **Smart Filtering**: Filter expenses/incomes by date range, category, payee/source
- **Receipt Management**: Upload and manage receipt images with Cloudinary
- **Label System**: Organize expenses with custom labels
- **Real-time Updates**: React Query for instant UI updates
- **Responsive Design**: Mobile-first design with touch-friendly interface
- **Error Boundaries**: Graceful error handling throughout the app

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Query (TanStack Query v5)

### Backend

- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Authentication**: Clerk
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **File Storage**: Cloudinary

### DevOps & Deployment

- **Hosting**: Vercel
- **CI/CD**: Automatic deployment via Git integration
- **Monitoring**: Vercel Analytics ready

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (Neon recommended)
- Clerk account for authentication
- Cloudinary account for receipt uploads

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd softnova-wallet
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

# Cloudinary (Receipt Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma db push

# Seed default categories
npx tsx prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
softnova-wallet/
├── prisma/
│   ├── schema.prisma           # Database schema with unified categories
│   ├── seed.ts                 # Default categories seed data
│   └── migrations/             # Database migrations
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── page.tsx        # Dashboard home with analytics
│   │   │   ├── expenses/       # Expense management pages
│   │   │   ├── incomes/        # Income management pages
│   │   │   ├── budgets/        # Budget tracking pages
│   │   │   ├── categories/     # Category management pages
│   │   │   └── settings/       # Settings and labels
│   │   ├── api/                # API routes
│   │   │   ├── expenses/       # Expense CRUD endpoints
│   │   │   ├── incomes/        # Income CRUD endpoints
│   │   │   ├── budgets/        # Budget endpoints
│   │   │   ├── categories/     # Category endpoints
│   │   │   ├── dashboard/      # Dashboard data endpoint
│   │   │   ├── upload/         # Receipt upload endpoint
│   │   │   └── webhooks/       # Clerk webhooks
│   │   ├── sign-in/            # Authentication pages
│   │   └── layout.tsx          # Root layout with providers
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── *-form.tsx          # Form components
│   │   ├── *-list.tsx          # List components
│   │   └── dashboard-*.tsx     # Dashboard components
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-expenses.ts     # Expense data hooks
│   │   ├── use-incomes.ts      # Income data hooks
│   │   └── use-dashboard.ts    # Dashboard data hooks
│   ├── lib/                    # Utilities and configurations
│   │   ├── db.ts               # Prisma client
│   │   ├── env.ts              # Environment validation
│   │   ├── logger.ts           # Production logger
│   │   ├── utils.ts            # Utility functions
│   │   └── constants.ts        # App constants
│   └── types/                  # TypeScript type definitions
└── public/
    └── uploads/                # Uploaded receipts (dev only)
```

## 🗄 Database Schema

### Main Models

- **Category**: Unified categories for expenses and incomes

  - `type`: EXPENSE | INCOME
  - `name`, `icon`, `color`
  - Relations to expenses, incomes, and budgets

- **Expense**: Expense records

  - `amount`, `description` (optional), `date`, `payee`
  - Relations to category, labels, and receipts
  - `userId`, `userName` for tracking

- **Income**: Income records

  - `amount`, `description` (optional), `date`, `source`
  - Relations to category
  - `userId`, `userName` for tracking

- **Budget**: Budget limits

  - `amount`, `period` (weekly/monthly/yearly)
  - Optional category-specific budgets
  - `userId` for user isolation

- **Label**: Custom tags for expenses
  - `name`, `color`
  - Many-to-many with expenses

## 🔒 Security Features

### Authentication & Authorization

- ✅ Clerk authentication on all protected routes
- ✅ Middleware protects dashboard pages
- ✅ API route authentication checks
- ✅ User ID filtering on all database queries
- ✅ Sign-up disabled (single company user)

### Security Headers (Configured)

- ✅ HSTS (Strict-Transport-Security)
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection
- ✅ Referrer-Policy: origin-when-cross-origin
- ✅ Permissions-Policy (restrictive)

### Input Validation

- ✅ Zod schemas for all API inputs
- ✅ File upload validation (type, size, sanitization)
- ✅ SQL injection prevention via Prisma ORM
- ✅ Environment variable validation

## ⚡ Performance Optimizations

### Database

- ✅ Prisma client optimized for serverless
- ✅ Connection pooling ready
- ✅ Parallel query execution with `Promise.all`
- ✅ Proper database indexes
- ✅ Efficient filtering and pagination

### Frontend

- ✅ React Query caching (30s stale time)
- ✅ Component memoization (React.memo)
- ✅ Code splitting and lazy loading
- ✅ Optimized bundle size
- ✅ Image optimization (AVIF/WebP)

### API & Caching

- ✅ API response caching with revalidation
- ✅ ETag generation for efficient caching
- ✅ Static asset caching (1 year, immutable)
- ✅ Smart invalidation strategies

### Build Optimization

- ✅ Standalone output mode for Vercel
- ✅ SWC minification
- ✅ Tree shaking
- ✅ Package import optimization

## 🚀 Production Deployment

### Quick Deploy to Vercel

Since the project is configured for Vercel with Git integration:

```bash
# Push to main branch for automatic deployment
git push origin main
```

### Pre-Deployment Checklist

#### 1. Environment Variables in Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://...              # Production database
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...  # Clerk public key
CLERK_SECRET_KEY=sk_...                    # Clerk secret key
CLOUDINARY_CLOUD_NAME=...                  # Cloudinary name
CLOUDINARY_API_KEY=...                     # Cloudinary API key
CLOUDINARY_API_SECRET=...                  # Cloudinary secret
NEXT_PUBLIC_APP_URL=https://...            # Production URL
```

**Important**: Set for Production, Preview, and Development environments.

#### 2. Database Setup

```bash
# Run migrations in production database
npx prisma migrate deploy

# Generate Prisma client (runs automatically on build)
npx prisma generate
```

#### 3. Build & Test Locally

```bash
# Run production build
npm run build

# Test production build
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Deployment Options

#### Option A: Automatic (Recommended)

- Push to `main` branch
- Vercel detects and deploys automatically
- Build: `prisma generate && next build`
- Deployment happens in ~2-3 minutes

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Post-Deployment Testing

After deployment, verify:

- [ ] Sign in works correctly
- [ ] Dashboard loads with data
- [ ] Create/edit/delete expenses
- [ ] Create/edit/delete incomes
- [ ] Upload receipts
- [ ] Budget tracking works
- [ ] Filters and search function
- [ ] All charts render correctly

### Database Connection Pooling

For production, use connection pooling:

**Neon**: Use pooler URL (ends with `-pooler`)

```
postgresql://user:password@host-pooler:port/database
```

**Supabase**: Enable connection pooling in dashboard

**Railway**: Automatic pooling

### Monitoring & Analytics

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Monitor build logs and runtime errors
3. **Database**: Monitor connection pool usage
4. **Performance**: Track Core Web Vitals

## 🐛 Troubleshooting

### Build Issues

**Prisma Client not generated**

```bash
# Ensure DATABASE_URL is set
echo $DATABASE_URL

# Manually generate
npx prisma generate
```

**Environment variables missing**

- Verify all required variables in Vercel dashboard
- Check variable names match exactly (case-sensitive)

### Runtime Issues

**Database connection errors**

- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Vercel
- Check SSL is enabled in connection string
- Use connection pooler URL for production

**Authentication not working**

- Verify Clerk keys are correct
- Check callback URLs in Clerk dashboard
- Ensure middleware is protecting routes

**Receipt uploads failing**

- Verify Cloudinary credentials
- Check file size limits (5MB max)
- Ensure allowed file types: jpeg, png, gif, pdf

## 📊 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm run lint:check   # Run lint without fixing
```

## 🎯 Production Readiness Status

- ✅ **Build**: Clean with no errors
- ✅ **TypeScript**: 100% type-safe
- ✅ **Linting**: All issues resolved
- ✅ **Security**: Comprehensive headers and validation
- ✅ **Performance**: Fully optimized
- ✅ **Error Handling**: Error boundaries implemented
- ✅ **Testing**: Manual testing completed
- ✅ **Documentation**: Complete

## 📚 Additional Documentation

For more detailed information, see:

- `Architecture.md` - System architecture and design patterns

## 🤝 Contributing

This is an internal tool for Softnova Digital. For feature requests or bug reports, contact the development team.

## 📄 License

Private - Softnova Digital

## 👨‍💻 Development Team

Built with ❤️ by Softnova Digital

---

**Current Status**: ✅ Production Ready
**Last Updated**: 07 December 2025
