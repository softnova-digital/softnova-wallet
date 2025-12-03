# Softnova Digital - Expense Tracker

A full-stack expense management application built for Softnova Digital to track company expenses, manage budgets, and categorize spending.

## Features

- **Authentication**: Secure login with Clerk (Single company user only - sign-up disabled)
- **Expense Management**: Add, edit, delete expenses with detailed information
  - Amount, description, date
  - Payee/Payer tracking
  - Custom labels for organization
  - Track who recorded each expense
  - Receipt attachments
- **Categories**: Full CRUD for expense categories with icons and colors
- **Budget Tracking**: Set and monitor weekly, monthly, or yearly budgets
  - Overall or per-category budgets
  - Visual progress indicators
  - Budget alerts when approaching limits
- **Dashboard**: Overview with charts and recent activity

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL account
- Clerk account

### Installation

1. Clone the repository:
```bash
cd softnova-expenses
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your credentials in `.env`:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
# Note: Sign-up is disabled - this is a single company user application

# Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Seed default categories:
```bash
npx tsx prisma/seed.ts
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
softnova-expenses/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Default categories seed
├── src/
│   ├── app/
│   │   ├── (dashboard)/ # Protected dashboard routes
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── expenses/      # Expenses management
│   │   │   ├── budgets/       # Budget management
│   │   │   ├── categories/    # Category management
│   │   │   └── settings/      # Labels & settings
│   │   ├── api/         # API routes
│   │   └── sign-in/     # Clerk sign in (sign-up disabled)
│   ├── components/      # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities
│   └── types/           # TypeScript types
└── public/
    └── uploads/         # Receipt uploads
```

## Database Schema

- **Category**: Expense categories (name, icon, color)
- **Label**: Custom tags for expenses
- **Expense**: Main expense records (amount, description, date, payee, category, labels, receipt, who spent)
- **Budget**: Budget limits (amount, period, category)

## Contributing

This is an internal tool for Softnova Digital.

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

### Quick Production Checklist

- ✅ Set production environment variables
- ✅ Run database migrations
- ✅ Build and test: `npm run build && npm start`
- ✅ Configure security headers (already set in `next.config.ts`)
- ✅ Set up error monitoring
- ✅ Configure file upload storage

## Performance Optimizations

This project includes several production optimizations:

- **Image Optimization**: Automatic WebP/AVIF conversion and responsive sizing
- **Code Splitting**: Next.js automatic code splitting
- **Database Queries**: Optimized with parallel queries and proper indexing
- **Bundle Size**: Tree-shaking and package import optimization
- **Caching**: ETags and appropriate cache headers
- **Security**: Security headers, input validation, and authentication on all routes

## License

Private - Softnova Digital
