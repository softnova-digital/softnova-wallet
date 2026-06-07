# Softnova Wallet

Internal financial management application for Softnova Digital. Track company expenses, incomes, budgets, and employee salaries — installable as a Progressive Web App on any device.

**Status:** Production Ready · **Stack:** Next.js 16 · Prisma · Clerk · Vercel

---

## Features

### Finance

| Area | Capabilities |
|---|---|
| **Expenses** | Amount, description, date, payee, category, labels, receipt attachments |
| **Incomes** | Amount, description, date, source, category |
| **Budgets** | Weekly / monthly / yearly limits, per-category or overall, visual progress |
| **Dashboard** | Spend chart, budget overview, recent activity, all-time / monthly / yearly / custom range |
| **Categories** | Unified EXPENSE / INCOME model, custom icon and color, full CRUD |
| **Labels** | Free-form tags on expenses, custom colors |
| **Receipts** | Upload via Cloudinary, linked to expense records |

### Employee & Salary Management

| Area | Capabilities |
|---|---|
| **Employees** | Full name, phone, email, designation, profile image, active / inactive status |
| **Salary Records** | Variable salary amount per month, manual entry, one record per employee per month enforced |
| **Salary + Expense Integration** | Every salary payment auto-creates a linked expense in the Salary category |
| **Filters** | Filter salary records by employee, month, and year |
| **Duplicate Prevention** | System blocks a second salary entry for the same employee in the same month (409 conflict) |

**Business rules:**
- An employee can receive **at most one salary payment per month**
- The salary **amount can change every month** — no fixed salary stored
- Some months may have **no salary** — nothing is auto-generated
- All salary records are entered **manually** — no recurring logic, no payroll processing
- Salary payments automatically appear in **total expenses**, **dashboard analytics**, and **profit/loss** calculations via the linked expense

### Mobile & PWA

- Installable on iPhone, Android, and desktop — works like a native app
- Full offline support with structured fallback responses
- Navigation progress bar fires on every tap — instant visual feedback
- Optimistic active state on nav items (zero-lag highlight before server responds)
- iOS "Add to Home Screen" step-by-step install guide
- Safe-area insets — content never hides behind iOS notch or home indicator
- Offline / back-online indicator pill anchored above bottom nav
- 300ms tap delay eliminated globally (`touch-action: manipulation`)

### Performance

- `loading.tsx` skeletons on every route — skeleton appears the instant you tap, zero blank-screen time
- `unstable_cache` for reference data (categories, labels) — cached 60 s server-side, busted immediately on mutation
- Global React Query `staleTime: 30 s` — revisiting a page within 30 s serves from cache with no network round-trip
- Parallel DB queries (`Promise.all`) used throughout API handlers
- Prisma transactions for multi-table writes (salary record + expense creation)

### Authentication

- `AuthGuard` client component — covers token expiry, PWA resume from background, explicit sign-out
- No blank screen during session transitions — full-screen overlay during auth state change
- React Query cache cleared on every sign-out (no stale data leaks between sessions)
- Typed `UnauthorizedError` — API 401 dispatches `clerk:unauthorized` event immediately rather than waiting for Clerk's ~60 s polling interval
- React Query never retries 401 errors (avoids hammering expired sessions)

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack, React Compiler)
- **React 19** · TypeScript
- **Tailwind CSS v4** · shadcn/ui
- **TanStack Query v5** (React Query)
- **Recharts** — spending chart
- **React Hook Form + Zod** — validated forms
- **Clerk** — authentication

### Backend
- **Next.js API Routes** (Node.js / Fluid Compute on Vercel)
- **Prisma v5** ORM
- **PostgreSQL** (Neon)
- **Cloudinary** — receipt image storage

### Infrastructure
- **Vercel** hosting · auto-deploy from `main`
- **PWA** — custom service worker, Web App Manifest
- Region: `iad1` (US East)

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host.neon.tech/db?sslmode=require"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/sign-in

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## Getting Started

### 1. Install

```bash
pnpm install
```

### 2. Database

```bash
# Push schema and generate client
pnpm db:push

# Seed default expense categories (includes Salary category)
pnpm db:seed
```

### 3. Develop

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build

```bash
pnpm build
pnpm start
```

---

## Scripts

```bash
pnpm dev            # Dev server (Turbopack)
pnpm build          # Production build (generates Prisma client first)
pnpm start          # Serve production build
pnpm lint           # ESLint auto-fix
pnpm lint:check     # ESLint check only
pnpm type-check     # tsc --noEmit
pnpm db:generate    # prisma generate
pnpm db:push        # prisma db push
pnpm db:seed        # Seed default categories
pnpm db:studio      # Open Prisma Studio
pnpm db:migrate     # prisma migrate dev
```

---

## Project Structure

```
softnova-wallet/
├── prisma/
│   ├── schema.prisma          # DB schema — unified Category model
│   └── seed.ts                # Default expense categories (incl. Salary)
├── public/
│   ├── sw.js                  # Service worker (cache-first static, network-first pages)
│   └── manifest.json          # PWA manifest with id, display_override, shortcuts
└── src/
    ├── app/
    │   ├── (dashboard)/       # All protected routes share this layout
    │   │   ├── loading.tsx    # Dashboard skeleton (instant on tap)
    │   │   ├── page.tsx       # Dashboard
    │   │   ├── expenses/      # loading.tsx + page.tsx
    │   │   ├── incomes/       # loading.tsx + page.tsx
    │   │   ├── budgets/       # loading.tsx + page.tsx
    │   │   ├── employees/     # page.tsx — employee list, search, CRUD
    │   │   ├── salary-records/# page.tsx — salary records, filters, CRUD
    │   │   └── settings/      # loading.tsx + page.tsx
    │   ├── api/               # Route handlers (force-dynamic, private cache)
    │   │   ├── dashboard/
    │   │   ├── expenses/
    │   │   ├── incomes/
    │   │   ├── budgets/
    │   │   ├── employees/     # GET list + POST; [id] GET/PATCH/DELETE
    │   │   ├── salary-records/# GET list + POST; [id] GET/PATCH/DELETE
    │   │   ├── labels/
    │   │   └── upload/
    │   ├── sign-in/           # Clerk SignIn widget (PWA safe-area aware)
    │   └── layout.tsx         # Root: ClerkProvider + ReactQueryProvider + PWA
    ├── components/
    │   ├── auth-guard.tsx           # Session watchdog — clears cache, shows overlay, redirects
    │   ├── navigation-progress.tsx  # Top-bar progress bar on every link tap
    │   ├── offline-indicator.tsx    # Offline / back-online pill
    │   ├── mobile-bottom-nav.tsx    # Optimistic active state, safe-area-aware
    │   ├── employee-form.tsx        # Create / edit employee
    │   ├── employees-list.tsx       # Desktop table + mobile cards + edit/delete dialogs
    │   ├── employees-page-client.tsx# Search input + Add Employee button
    │   ├── salary-record-form.tsx   # Create / edit salary record (month/year locked on edit)
    │   ├── salary-records-list.tsx  # Desktop table + mobile cards + edit/delete dialogs
    │   ├── salary-records-page-client.tsx # Filters + Record Salary button
    │   ├── pwa-install-prompt.tsx   # Android native prompt + iOS step-by-step guide
    │   └── ui/                      # shadcn/ui base components
    ├── hooks/
    │   ├── use-expenses.ts        # UnauthorizedError on 401
    │   ├── use-incomes.ts         # UnauthorizedError on 401
    │   ├── use-dashboard.ts       # UnauthorizedError on 401
    │   ├── use-employees.ts       # CRUD mutations + list query
    │   ├── use-salary-records.ts  # CRUD mutations + list query; invalidates expenses + dashboard
    │   └── use-online-status.ts
    └── lib/
        ├── db.ts              # Prisma client (singleton)
        ├── errors.ts          # UnauthorizedError
        ├── queries.ts         # unstable_cache wrappers for categories / labels
        └── react-query-provider.tsx  # QueryCache with 401 → clerk:unauthorized event
```

---

## Database Schema

### Models

**Category** — unified for expenses and incomes
- `type: EXPENSE | INCOME`
- `name`, `icon`, `color`, `isDefault`
- Indexed on `[type]` and `[type, name]`
- Default categories: Office Supplies, Travel, Software/Subscriptions, Marketing, Utilities, Meals, Equipment, **Salary**, Other

**Expense**
- `amount`, `description?`, `date`, `payee`, `categoryId`
- `userId`, `userName`, `receiptUrl?`, `receiptPublicId?`
- Indexed on `[userId]`, `[userId, date]`, `[userId, categoryId, date]`

**Income**
- `amount`, `description?`, `date`, `source`, `categoryId`
- `userId`, `userName`

**Budget**
- `amount`, `period (weekly|monthly|yearly)`, `categoryId?`
- Unique on `[period, categoryId, userId]`

**Employee**
- `name`, `phone?`, `email?`, `designation`, `profileImage?`, `isActive`
- Indexed on `[isActive]`, `[name]`
- One employee can have many `SalaryRecord`s

**SalaryRecord**
- `employeeId`, `month (1–12)`, `year`, `amount`, `paymentDate`, `remarks?`
- `expenseId?` — links to auto-created Expense in the Salary category
- `userId`, `userName` — who recorded the payment
- **Unique on `[employeeId, month, year]`** — enforces one salary per employee per month
- Indexed on `[employeeId]`, `[userId]`, `[year, month]`
- Cascade deletes when parent Employee is deleted

**Label** · **ExpenseLabel** (many-to-many join)

### Salary → Expense Integration

When a salary record is created, a Prisma transaction atomically:
1. Creates an `Expense` with `categoryId: "salary"`, `payee: "Softnova Digital"`, and `description: "Salary – {Name} ({Month} {Year})"`
2. Stores the `expenseId` on the `SalaryRecord`

On update, the linked expense amount and date are synced in the same transaction.
On delete, the linked expense is removed first to prevent orphans.

---

## API Reference

### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | List employees. Query: `search`, `activeOnly`, `page`, `limit` |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/:id` | Get employee with last 12 salary records |
| PATCH | `/api/employees/:id` | Update employee fields |
| DELETE | `/api/employees/:id` | Delete employee + all salary records + linked expenses |

### Salary Records

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/salary-records` | List records. Query: `employeeId`, `month`, `year`, `page`, `limit` |
| POST | `/api/salary-records` | Create record + linked expense (409 if duplicate month) |
| GET | `/api/salary-records/:id` | Get single record |
| PATCH | `/api/salary-records/:id` | Update `amount`, `paymentDate`, `remarks` — syncs expense |
| DELETE | `/api/salary-records/:id` | Delete record + linked expense |

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses` | List with filters: `categoryId`, `payee`, `startDate`, `endDate`, `search`, `page`, `limit` |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/:id` | Get single expense |
| PATCH | `/api/expenses/:id` | Update expense (handles Cloudinary receipt replacement) |
| DELETE | `/api/expenses/:id` | Delete expense + Cloudinary receipt |

### Incomes / Budgets / Labels / Categories

Standard CRUD routes following the same pattern as Expenses. See `src/app/api/` for full implementations.

---

## Security

| Layer | Detail |
|---|---|
| Authentication | Clerk middleware, `auth.protect()` on all non-public routes |
| API auth | Every route handler calls `auth()` and returns 401 if no `userId` |
| User isolation | All DB queries scoped to authenticated user |
| Input validation | Zod schemas on all POST/PATCH endpoints |
| Duplicate prevention | `@@unique` DB constraint + 409 API response for salary conflicts |
| SQL injection | Prisma ORM (parameterised queries) |
| Sign-up | Disabled — single-tenant app, sign-up route redirects to sign-in |
| Security headers | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| PWA cache | User-specific API responses served `private, no-store` — never shared at CDN |

---

## Deployment

### Automatic (recommended)

Push to `main` → Vercel builds and deploys automatically.

Build command: `prisma generate && next build`

### Manual via CLI

```bash
pnpm add -g vercel
vercel --prod
```

### Pre-deploy checklist

- [ ] All environment variables set in Vercel dashboard (Production + Preview)
- [ ] `DATABASE_URL` points to production database with pooler URL
- [ ] Run `pnpm db:push` against production DB to apply schema changes
- [ ] Run `pnpm db:seed` to ensure the Salary category exists
- [ ] Verify Clerk callback URLs in Clerk dashboard match the production domain

### Post-deploy verification

- [ ] Sign in / sign out flow works end to end
- [ ] Dashboard, expenses, incomes, budgets all load
- [ ] Add / edit / delete operations persist correctly
- [ ] Receipt upload succeeds (Cloudinary)
- [ ] Employees page: create, edit, deactivate, delete
- [ ] Salary Records page: record salary, confirm linked expense appears in Expenses
- [ ] Duplicate salary for same employee + month returns an error (not a second record)
- [ ] PWA install prompt appears on Android
- [ ] iOS "Add to Home Screen" guide shows on Safari
- [ ] App works after installing to home screen (standalone mode)
- [ ] Offline indicator appears when network is disabled

---

## Troubleshooting

**Prisma client not found**
```bash
pnpm db:generate
```

**Database connection error**
- Confirm `DATABASE_URL` uses the Neon pooler endpoint (ends in `-pooler`)
- Verify `?sslmode=require` is appended

**Clerk authentication not working**
- Keys must match the environment (test keys for dev, live keys for production)
- Add your production domain to Clerk's allowed origins

**Receipt upload failing**
- Cloudinary credentials must be set server-side (not `NEXT_PUBLIC_*`)
- Allowed types: `jpeg`, `png`, `gif`, `pdf` · Max size: 5 MB

**Salary record creation returns 409**
- A salary record for that employee and month already exists
- Edit the existing record or delete it first, then recreate

**Salary expense not appearing in dashboard**
- Confirm the `salary` category was seeded (`pnpm db:seed` or run the upsert script)
- The linked expense uses `categoryId: "salary"` and `payee: "Softnova Digital"`

**PWA not installing on Android**
- The app must be served over HTTPS
- Lighthouse PWA audit must pass (check for manifest + SW errors)

---

## License

Private — Softnova Digital

---

*Built by Softnova Digital · Last updated 7 June 2026*
