# Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Layers](#architecture-layers)
4. [API Endpoints](#api-endpoints)
5. [React Query Hooks & Data Flow](#react-query-hooks--data-flow)
6. [Database Schema](#database-schema)
7. [Component Structure](#component-structure)
8. [Query Flow Diagrams](#query-flow-diagrams)
9. [Authentication Flow](#authentication-flow)
10. [File Upload Flow](#file-upload-flow)
11. [State Management](#state-management)
12. [Caching Strategy](#caching-strategy)

---

## System Overview

Softnova Wallet is a full-stack expense management application built with Next.js 14 (App Router). It provides a comprehensive solution for tracking expenses, managing budgets, categorizing transactions, and monitoring financial health.

### Key Features
- **Expense & Income Management**: Full CRUD operations with filtering and search
- **Category Management**: Unified categories for expenses and incomes
- **Budget Tracking**: Weekly, monthly, and yearly budgets with alerts
- **Label System**: Custom tags for organizing expenses
- **Receipt Management**: Cloudinary integration for receipt storage
- **Dashboard Analytics**: Real-time financial overview with charts
- **Authentication**: Clerk-based authentication (single company user)

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (RESTful)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Clerk
- **File Storage**: Cloudinary

### Development Tools
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **PostCSS**: CSS processing

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React Components, UI, Forms, Charts, Navigation)      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  React Query Layer                       │
│  (useQuery, useMutation, Query Client, Cache Management) │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    API Layer                             │
│  (Next.js API Routes, Request Validation, Auth)        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Database Layer                         │
│  (Prisma ORM, PostgreSQL, Migrations)                   │
└─────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Base URL
All API endpoints are prefixed with `/api`

### Authentication
All endpoints require Clerk authentication via `auth()` middleware. The `userId` is extracted from the session and used for data isolation.

---

### Dashboard API

#### `GET /api/dashboard`
Fetches comprehensive dashboard data including stats, recent transactions, budgets, and chart data.

**Response:**
```typescript
{
  stats: {
    monthlyIncome: { value: number; change: number };
    monthlyExpenses: { value: number; change: number };
    netBalance: number;
    budgetAlerts: number;
  };
  recentExpenses: Expense[];
  recentIncomes: Income[];
  budgets: BudgetWithSpent[];
  chartData: { name: string; value: number; color: string }[];
}
```

**Cache Configuration:**
- `revalidate: 30` seconds
- `dynamic: "force-dynamic"`

**Query Flow:**
1. Parallel queries for this month/last month expenses and incomes
2. Fetch budgets with category relations
3. Fetch recent expenses (5) and incomes (5)
4. Group expenses by category for chart
5. Calculate budget spent amounts
6. Compute statistics and return combined data

---

### Expenses API

#### `GET /api/expenses`
Fetches expenses with filtering, pagination, and search.

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `payee` (optional): Filter by payee (from PARTNERS enum)
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)
- `search` (optional): Search in description and payee
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```typescript
{
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Cache Configuration:**
- `revalidate: 10` seconds
- `dynamic: "force-dynamic"`

#### `POST /api/expenses`
Creates a new expense.

**Request Body:**
```typescript
{
  amount: number;                    // Required, positive
  description?: string;               // Optional
  date: string;                      // ISO date string
  payee: string;                     // Must be from PARTNERS enum
  categoryId: string;                // Required
  labelIds?: string[];                // Optional array of label IDs
  receiptUrl?: string;                // Optional Cloudinary URL
  receiptPublicId?: string;           // Optional Cloudinary public ID
}
```

**Response:** Created expense with category and labels (201)

#### `GET /api/expenses/[id]`
Fetches a single expense by ID.

**Response:** Expense with category and labels

#### `PATCH /api/expenses/[id]`
Updates an expense.

**Request Body:** (All fields optional)
```typescript
{
  amount?: number;
  description?: string;
  date?: string;
  payee?: string;
  categoryId?: string;
  labelIds?: string[];
  receiptUrl?: string | null;
  receiptPublicId?: string | null;
}
```

**Special Handling:**
- If `labelIds` is provided, existing labels are deleted and new ones created
- If receipt is removed/replaced, old Cloudinary image is deleted

**Response:** Updated expense

#### `DELETE /api/expenses/[id]`
Deletes an expense.

**Special Handling:**
- Deletes associated receipt from Cloudinary if `receiptPublicId` exists
- Cascades to delete ExpenseLabel relations

**Response:** `{ success: true }`

---

### Incomes API

#### `GET /api/incomes`
Fetches incomes with filtering, pagination, and search.

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter
- `search` (optional): Search in description and source
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```typescript
{
  incomes: Income[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Cache Configuration:**
- `revalidate: 10` seconds
- `dynamic: "force-dynamic"`

#### `POST /api/incomes`
Creates a new income.

**Request Body:**
```typescript
{
  amount: number;                    // Required
  description: string;              // Required
  date: string;                      // ISO date string
  source: string;                    // Required (who paid)
  categoryId: string;                // Required
}
```

**Response:** Created income with category (201)

#### `GET /api/incomes/[id]`
Fetches a single income by ID.

**Response:** Income with category

#### `PUT /api/incomes/[id]`
Updates an income.

**Request Body:**
```typescript
{
  amount?: number;
  description?: string;
  date?: string;
  source?: string;
  categoryId?: string;
}
```

**Response:** Updated income

#### `DELETE /api/incomes/[id]`
Deletes an income.

**Response:** `{ success: true }`

---

### Categories API

#### `GET /api/categories`
Fetches all categories, optionally filtered by type.

**Query Parameters:**
- `type` (optional): Filter by `"EXPENSE"` or `"INCOME"`

**Response:** Category[] with `_count` for expenses/incomes

#### `POST /api/categories`
Creates a new category.

**Request Body:**
```typescript
{
  name: string;                     // Required, min 1 char
  type: "EXPENSE" | "INCOME";       // Required
  icon: string;                     // Required, min 1 char
  color: string;                    // Required, min 1 char
}
```

**Response:** Created category (201)

#### `GET /api/categories/[id]`
Fetches a single category with counts.

**Response:** Category with `_count`

#### `PATCH /api/categories/[id]`
Updates a category.

**Request Body:** (All fields optional)
```typescript
{
  name?: string;
  type?: "EXPENSE" | "INCOME";
  icon?: string;
  color?: string;
}
```

**Response:** Updated category

#### `DELETE /api/categories/[id]`
Deletes a category.

**Validation:**
- Checks if category has associated expenses or incomes
- Returns error if category is in use

**Response:** `{ success: true }` or error with count

---

### Labels API

#### `GET /api/labels`
Fetches all labels.

**Response:** Label[]

#### `POST /api/labels`
Creates a new label.

**Request Body:**
```typescript
{
  name: string;                     // Required, min 1 char, unique
  color: string;                    // Required, min 1 char
}
```

**Response:** Created label (201)

#### `PATCH /api/labels/[id]`
Updates a label.

**Request Body:** (All fields optional)
```typescript
{
  name?: string;
  color?: string;
}
```

**Response:** Updated label

#### `DELETE /api/labels/[id]`
Deletes a label.

**Special Handling:**
- Cascades to delete ExpenseLabel relations

**Response:** `{ success: true }`

---

### Budgets API

#### `GET /api/budgets`
Fetches all budgets for the authenticated user.

**Response:** Budget[] with category relations

#### `POST /api/budgets`
Creates a new budget.

**Request Body:**
```typescript
{
  amount: number;                   // Required, positive
  period: "weekly" | "monthly" | "yearly";  // Required
  categoryId?: string | null;      // Optional, null for overall budget
}
```

**Validation:**
- Checks for duplicate budget (same period + category + userId)
- Returns error if duplicate exists

**Response:** Created budget with category (201)

#### `GET /api/budgets/[id]`
Fetches a single budget.

**Response:** Budget with category

#### `PATCH /api/budgets/[id]`
Updates a budget.

**Request Body:** (All fields optional)
```typescript
{
  amount?: number;
  period?: "weekly" | "monthly" | "yearly";
  categoryId?: string | null;
}
```

**Response:** Updated budget

#### `DELETE /api/budgets/[id]`
Deletes a budget.

**Response:** `{ success: true }`

---

### Upload API

#### `POST /api/upload`
Uploads a receipt file to Cloudinary.

**Request:** Multipart form data with file

**Response:**
```typescript
{
  url: string;                      // Cloudinary URL
  publicId: string;                 // Cloudinary public ID
}
```

#### `DELETE /api/upload/delete`
Deletes a file from Cloudinary.

**Request Body:**
```typescript
{
  publicId: string;                 // Cloudinary public ID
}
```

**Response:** `{ success: true }`

---

## React Query Hooks & Data Flow

### Query Client Configuration

Located in `src/lib/react-query-provider.tsx`:

```typescript
{
  staleTime: 30 * 1000,              // 30 seconds
  gcTime: 5 * 60 * 1000,             // 5 minutes (cache time)
  refetchOnWindowFocus: false,        // Don't refetch on window focus
  refetchOnMount: true,               // Always refetch on mount
  refetchOnReconnect: true,           // Refetch on network reconnect
  retry: 1,                           // Retry once on failure
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
}
```

### Available Hooks

#### Dashboard Hooks

**`useDashboard()`**
- **Query Key:** `["dashboard"]`
- **Endpoint:** `GET /api/dashboard`
- **Stale Time:** 30 seconds
- **Refetch:** On window focus
- **Returns:** `{ data, isLoading, error }`

**Usage:**
```typescript
const { data, isLoading, error } = useDashboard();
// data: DashboardData
```

---

#### Expense Hooks

**`useExpenses()`**
- **Query Key:** `["expenses", searchParams.toString()]`
- **Endpoint:** `GET /api/expenses`
- **Parameters:** Automatically reads from URL search params
- **Returns:** `{ data, isLoading, error }`
- **Data:** `{ expenses: Expense[], pagination: {...} }`

**`useCreateExpense()`**
- **Mutation:** `POST /api/expenses`
- **Invalidates:** `["expenses"]`, `["dashboard"]`
- **Toast:** Success/error notifications

**`useUpdateExpense()`**
- **Mutation:** `PATCH /api/expenses/[id]`
- **Invalidates:** `["expenses"]`, `["dashboard"]`
- **Toast:** Success/error notifications

**`useDeleteExpense()`**
- **Mutation:** `DELETE /api/expenses/[id]`
- **Invalidates:** `["expenses"]`, `["dashboard"]`
- **Toast:** Success/error notifications

**Usage:**
```typescript
const { data, isLoading } = useExpenses();
const createMutation = useCreateExpense();
const updateMutation = useUpdateExpense();
const deleteMutation = useDeleteExpense();

// Create
createMutation.mutate({
  amount: 100,
  date: "2024-01-01",
  payee: "Vendor",
  categoryId: "cat_123",
  labelIds: ["label_1"]
});

// Update
updateMutation.mutate({
  id: "exp_123",
  amount: 150,
  // ... other fields
});

// Delete
deleteMutation.mutate("exp_123");
```

---

#### Income Hooks

**`useIncomes()`**
- **Query Key:** `["incomes", searchParams.toString()]`
- **Endpoint:** `GET /api/incomes`
- **Parameters:** Automatically reads from URL search params
- **Returns:** `{ data, isLoading, error }`
- **Data:** `{ incomes: Income[], pagination: {...} }`

**`useCreateIncome()`**
- **Mutation:** `POST /api/incomes`
- **Invalidates:** `["incomes"]`, `["dashboard"]`
- **Toast:** Success/error notifications

**`useUpdateIncome()`**
- **Mutation:** `PUT /api/incomes/[id]`
- **Invalidates:** `["incomes"]`, `["dashboard"]`
- **Toast:** Success/error notifications

**`useDeleteIncome()`**
- **Mutation:** `DELETE /api/incomes/[id]`
- **Invalidates:** `["incomes"]`, `["dashboard"]`
- **Toast:** Success/error notifications

**Usage:**
```typescript
const { data, isLoading } = useIncomes();
const createMutation = useCreateIncome();
const updateMutation = useUpdateIncome();
const deleteMutation = useDeleteIncome();
```

---

### Query Invalidation Strategy

When a mutation succeeds, related queries are invalidated to ensure UI consistency:

**Expense Mutations:**
- Invalidates all `["expenses"]` queries (with any search params)
- Invalidates `["dashboard"]` query

**Income Mutations:**
- Invalidates all `["incomes"]` queries (with any search params)
- Invalidates `["dashboard"]` query

**Category/Label Mutations:**
- Invalidates category/label queries
- Invalidates `["expenses"]` and `["incomes"]` (as they include category/label data)
- Invalidates `["dashboard"]` query

This ensures that:
1. List views update immediately after mutations
2. Dashboard reflects latest statistics
3. Filtered views maintain consistency
4. No stale data is displayed

---

## Database Schema

### Models

#### Category
```prisma
model Category {
  id        String      @id @default(cuid())
  name      String
  type      CategoryType @default(EXPENSE)  // EXPENSE | INCOME
  icon      String      @default("folder")
  color     String      @default("#2ECC71")
  isDefault Boolean     @default(false)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  expenses  Expense[]
  incomes   Income[]
  budgets   Budget[]
  
  @@index([type])
  @@index([type, name])
}
```

#### Label
```prisma
model Label {
  id        String         @id @default(cuid())
  name      String         @unique
  color     String         @default("#2ECC71")
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  expenses  ExpenseLabel[]
}
```

#### Expense
```prisma
model Expense {
  id              String         @id @default(cuid())
  amount          Float
  description     String?        // Optional
  date            DateTime
  payee           String
  categoryId      String
  category        Category       @relation(fields: [categoryId], references: [id])
  labels          ExpenseLabel[]
  receiptUrl      String?
  receiptPublicId String?
  userId          String
  userName        String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@index([userId])
  @@index([categoryId])
  @@index([date])
}
```

#### Income
```prisma
model Income {
  id          String   @id @default(cuid())
  amount      Float
  description String
  date        DateTime
  source      String
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  userId      String
  userName    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([categoryId])
  @@index([date])
}
```

#### ExpenseLabel (Junction Table)
```prisma
model ExpenseLabel {
  id        String  @id @default(cuid())
  expenseId String
  labelId   String
  expense   Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  label     Label   @relation(fields: [labelId], references: [id], onDelete: Cascade)
  
  @@unique([expenseId, labelId])
}
```

#### Budget
```prisma
model Budget {
  id         String    @id @default(cuid())
  amount     Float
  period     String    // "weekly" | "monthly" | "yearly"
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
  userId     String
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  @@unique([period, categoryId, userId])
  @@index([userId])
}
```

### Relationships

```
Category ──┬── Expense (many-to-one)
          ├── Income (many-to-one)
          └── Budget (many-to-one, optional)

Label ──── ExpenseLabel ──── Expense (many-to-many)

Expense ── ExpenseLabel ──── Label (many-to-many)
```

---

## Component Structure

### Page Components
- `src/app/(dashboard)/page.tsx` - Dashboard
- `src/app/(dashboard)/expenses/page.tsx` - Expenses list
- `src/app/(dashboard)/incomes/page.tsx` - Incomes list
- `src/app/(dashboard)/budgets/page.tsx` - Budgets management
- `src/app/(dashboard)/categories/page.tsx` - Categories management
- `src/app/(dashboard)/settings/page.tsx` - Settings (categories & labels)

### Feature Components

#### Dashboard
- `dashboard-content.tsx` - Main dashboard container
- `dashboard-card.tsx` - Stat card component
- `recent-expenses.tsx` - Recent expenses list
- `recent-incomes.tsx` - Recent incomes list
- `spending-chart.tsx` - Pie chart for spending by category
- `budget-overview.tsx` - Budget progress cards

#### Expenses
- `expenses-list.tsx` - Expenses table/list
- `expense-form.tsx` - Create/edit expense form
- `expense-filters.tsx` - Filter controls
- `add-expense-button.tsx` - FAB trigger

#### Incomes
- `incomes-list.tsx` - Incomes table/list
- `income-form.tsx` - Create/edit income form
- `income-filters.tsx` - Filter controls
- `add-income-button.tsx` - FAB trigger

#### Categories
- `categories-list.tsx` - Categories list
- `category-form.tsx` - Create/edit category form
- `add-category-button.tsx` - Add button

#### Labels
- `labels-list.tsx` - Labels list
- `label-form.tsx` - Create/edit label form
- `add-label-button.tsx` - Add button

#### Budgets
- `budgets-list.tsx` - Budgets list
- `budget-form.tsx` - Create/edit budget form
- `add-budget-button.tsx` - Add button

#### Shared
- `floating-action-button.tsx` - Global FAB for quick actions
- `upload-button.tsx` - Receipt upload component
- `settings-tabs.tsx` - Settings page tabs

### UI Components (shadcn/ui)
Located in `src/components/ui/`:
- `button.tsx`, `card.tsx`, `dialog.tsx`, `form.tsx`, `input.tsx`, `select.tsx`, `table.tsx`, `tabs.tsx`, `badge.tsx`, `alert.tsx`, `progress.tsx`, `calendar.tsx`, `popover.tsx`, `sheet.tsx`, `sonner.tsx`, etc.

---

## Query Flow Diagrams

### Dashboard Load Flow

```
User visits Dashboard
    │
    ▼
DashboardContent component mounts
    │
    ▼
useDashboard() hook called
    │
    ▼
React Query checks cache for ["dashboard"]
    │
    ├─ Cache HIT (fresh) ──► Return cached data
    │
    └─ Cache MISS or STALE ──►
            │
            ▼
        Fetch GET /api/dashboard
            │
            ▼
        API executes parallel queries:
        - This month expenses aggregate
        - Last month expenses aggregate
        - This month incomes aggregate
        - Last month incomes aggregate
        - Budgets with categories
        - Recent expenses (5)
        - Recent incomes (5)
        - Expenses grouped by category
        - All expense categories
            │
            ▼
        Calculate statistics:
        - Monthly income/expense totals
        - Percentage changes
        - Net balance
        - Budget alerts
        - Chart data
            │
            ▼
        Return combined DashboardData
            │
            ▼
        React Query caches result
            │
            ▼
        Component re-renders with data
```

### Create Expense Flow

```
User submits ExpenseForm
    │
    ▼
useCreateExpense().mutate(data) called
    │
    ▼
POST /api/expenses
    │
    ├─ Validate request with Zod schema
    │
    ├─ Extract userId from Clerk auth
    │
    ├─ Create expense in database
    │   - Create Expense record
    │   - Create ExpenseLabel records (if labelIds provided)
    │
    └─ Return created expense with relations
    │
    ▼
Mutation onSuccess callback
    │
    ├─ Invalidate ["expenses"] queries
    │   └─ All expense list views refetch
    │
    └─ Invalidate ["dashboard"] query
        └─ Dashboard refetches with new stats
    │
    ▼
Show success toast notification
    │
    ▼
Component updates automatically via React Query
```

### Filter Expenses Flow

```
User applies filters (category, date range, search)
    │
    ▼
URL search params updated
    │
    ▼
useExpenses() hook detects param change
    │
    ▼
Query key changes: ["expenses", "categoryId=cat_123&startDate=..."]
    │
    ▼
React Query treats as new query
    │
    ├─ Check cache for this specific query key
    │
    └─ Cache MISS ──►
            │
            ▼
        Fetch GET /api/expenses?categoryId=cat_123&startDate=...
            │
            ▼
        API filters expenses:
        - WHERE userId = currentUserId
        - AND categoryId = ...
        - AND date BETWEEN ...
        - AND (description LIKE ... OR payee LIKE ...)
            │
            ▼
        Return filtered expenses with pagination
            │
            ▼
        Cache result under specific query key
            │
            ▼
        Component displays filtered results
```

### Delete Expense Flow

```
User clicks delete button
    │
    ▼
useDeleteExpense().mutate(id) called
    │
    ▼
DELETE /api/expenses/[id]
    │
    ├─ Verify ownership (userId match)
    │
    ├─ Check if receiptPublicId exists
    │   └─ Delete from Cloudinary if present
    │
    ├─ Delete ExpenseLabel relations (cascade)
    │
    └─ Delete Expense record
    │
    ▼
Mutation onSuccess callback
    │
    ├─ Invalidate ["expenses"] queries
    │   └─ All expense lists refetch (removed item disappears)
    │
    └─ Invalidate ["dashboard"] query
        └─ Dashboard stats update
    │
    ▼
Show success toast
    │
    ▼
UI updates automatically
```

---

## Authentication Flow

```
User visits protected route
    │
    ▼
Next.js middleware checks Clerk session
    │
    ├─ No session ──► Redirect to /sign-in
    │
    └─ Valid session ──►
            │
            ▼
        Extract userId from session
            │
            ▼
        Allow access to route
            │
            ▼
        API routes use auth() to get userId
            │
            ▼
        All database queries filtered by userId
            │
            ▼
        Data isolation ensured
```

### Middleware
Located in `src/middleware.ts`:
- Protects all routes under `/(dashboard)`
- Redirects unauthenticated users to `/sign-in`
- Allows public access to `/sign-in` and `/sign-up`

---

## File Upload Flow

### Receipt Upload

```
User clicks upload button in ExpenseForm
    │
    ▼
File selected via input
    │
    ▼
POST /api/upload (multipart/form-data)
    │
    ├─ Validate file type and size
    │
    ├─ Upload to Cloudinary
    │   - Generate unique public_id
    │   - Store in "expense-receipts" folder
    │   - Return URL and public_id
    │
    └─ Return { url, publicId }
    │
    ▼
ExpenseForm receives upload result
    │
    ▼
Include receiptUrl and receiptPublicId in expense data
    │
    ▼
Create/update expense with receipt info
    │
    ▼
Receipt displayed in expense list/detail
```

### Receipt Deletion

```
User removes receipt or deletes expense
    │
    ▼
API checks if receiptPublicId exists
    │
    ├─ If exists ──►
    │   │
    │   ▼
    │   DELETE from Cloudinary
    │   │
    │   └─ cloudinary.uploader.destroy(publicId)
    │
    └─ Continue with database operation
    │
    ▼
Receipt removed from storage and database
```

---

## State Management

### React Query as State Manager

React Query serves as the primary state management solution:

**Advantages:**
- Automatic caching and synchronization
- Background refetching
- Optimistic updates support
- Request deduplication
- Error handling and retry logic

**Query Keys Structure:**
```typescript
["dashboard"]                           // Dashboard data
["expenses", "categoryId=cat_123&..."]  // Filtered expenses
["incomes", "categoryId=cat_456&..."]   // Filtered incomes
["categories", "type=EXPENSE"]          // Categories by type
["labels"]                              // All labels
["budgets"]                             // All budgets
```

### Local Component State

Used for:
- Form inputs (React Hook Form)
- UI state (dialogs, modals, dropdowns)
- Temporary filter values before applying to URL
- Loading states for mutations

### URL State

Used for:
- Expense/income filters (search params)
- Pagination
- Navigation state

**Benefits:**
- Shareable URLs
- Browser back/forward support
- Bookmarkable filtered views

---

## Caching Strategy

### React Query Cache Configuration

```typescript
{
  staleTime: 30 * 1000,        // Data considered fresh for 30s
  gcTime: 5 * 60 * 1000,       // Cache kept for 5 minutes after unused
  refetchOnMount: true,         // Always refetch on component mount
  refetchOnWindowFocus: false,  // Don't refetch on window focus
  refetchOnReconnect: true,     // Refetch when network reconnects
}
```

### Cache Invalidation

**Automatic Invalidation:**
- Mutations invalidate related queries
- Dashboard invalidated on expense/income changes
- List queries invalidated on create/update/delete

**Manual Invalidation:**
```typescript
queryClient.invalidateQueries({ queryKey: ["expenses"] });
queryClient.invalidateQueries({ queryKey: ["dashboard"] });
```

### Cache Layers

1. **React Query Cache** (Client-side)
   - In-memory cache
   - Shared across components
   - Automatic garbage collection

2. **Next.js API Cache** (Server-side)
   - `revalidate` settings control cache duration
   - Dashboard: 30 seconds
   - Expenses/Incomes: 10 seconds
   - Categories/Labels: No explicit cache (always fresh)

3. **Database Query Cache** (Prisma)
   - Connection pooling
   - Query result caching (if enabled)

### Cache Key Strategy

**Query Keys Include:**
- Resource type: `["expenses"]`
- Filter parameters: `["expenses", "categoryId=cat_123"]`
- Search params: Full URL search string

**Benefits:**
- Different filters = different cache entries
- Changing filters doesn't invalidate other cached views
- Efficient cache utilization

---

## Performance Optimizations

### Database Optimizations
- Indexes on `userId`, `categoryId`, `date` fields
- Parallel queries in dashboard API
- Efficient aggregation queries
- Connection pooling via Prisma

### React Optimizations
- `memo()` for expensive components
- Code splitting via Next.js
- Image optimization (Cloudinary)
- CSS transitions with `will-change`

### API Optimizations
- Request validation with Zod (fail fast)
- Parallel database queries
- Efficient Prisma queries with `include`
- Pagination for large datasets

### React Query Optimizations
- Request deduplication
- Background refetching
- Optimistic updates (where applicable)
- Stale-while-revalidate pattern

---

## Error Handling

### API Error Responses

**Standard Format:**
```typescript
{
  error: string;              // Error message
  details?: ZodError;         // Validation errors (if applicable)
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

### Client-Side Error Handling

**React Query:**
- Automatic retry (1 attempt)
- Error state in hook return
- Toast notifications for mutations

**Components:**
- Error boundaries for critical sections
- Loading states for better UX
- Graceful degradation

---

## Security Considerations

### Authentication
- All API routes protected with Clerk `auth()`
- User ID extracted from session
- All queries filtered by `userId`

### Data Isolation
- Database queries always include `userId` filter
- No cross-user data access possible
- Ownership verification on update/delete

### Input Validation
- Zod schemas for all API inputs
- Type-safe request/response handling
- SQL injection prevention via Prisma

### File Upload Security
- File type validation
- Size limits
- Cloudinary secure URLs
- Public ID validation

---

## Development Workflow

### Adding a New Feature

1. **Database Schema**
   - Update `prisma/schema.prisma`
   - Run `npx prisma migrate dev`

2. **API Route**
   - Create route in `src/app/api/[resource]/route.ts`
   - Add Zod validation schema
   - Implement CRUD operations
   - Add authentication checks

3. **React Query Hook**
   - Create hook in `src/hooks/use-[resource].ts`
   - Implement `useQuery` for fetching
   - Implement `useMutation` for mutations
   - Set up query invalidation

4. **Components**
   - Create form component
   - Create list component
   - Add to appropriate page
   - Connect to React Query hooks

5. **Testing**
   - Test API endpoints
   - Test React Query hooks
   - Test component interactions
   - Verify cache invalidation

---

## Future Enhancements

### Potential Improvements
- Real-time updates via WebSockets
- Advanced analytics and reporting
- Export functionality (CSV, PDF)
- Multi-currency support
- Recurring transactions
- Budget templates
- Mobile app (React Native)
- Advanced filtering and sorting
- Bulk operations
- Data import/export

---

## Conclusion

This architecture provides a scalable, maintainable foundation for the Softnova Wallet application. The separation of concerns, React Query for state management, and comprehensive API design ensure a smooth development experience and excellent user experience.

For questions or clarifications, refer to the codebase or contact the development team.

