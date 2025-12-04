# Category Unification Migration Guide

This guide will help you migrate from separate `Category` and `IncomeCategory` models to a unified `Category` model with a `type` field.

## Overview

The refactoring unifies income and expense categories into a single `Category` model with a `type` field that can be either `EXPENSE` or `INCOME`.

## Migration Steps

### Step 1: Backup Your Database
⚠️ **IMPORTANT**: Always backup your database before running migrations.

```bash
# Export your database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Data Migration Script

First, we need to migrate existing `IncomeCategory` data to the unified `Category` model:

```bash
npx tsx scripts/migrate-income-categories.ts
```

This script will:
- Copy all `IncomeCategory` records to `Category` with `type = 'INCOME'`
- Update all `Income` records to reference the new category IDs
- Preserve all existing data

### Step 3: Apply Schema Changes

After the data migration, apply the Prisma schema changes:

```bash
npx prisma db push --accept-data-loss
```

**Note**: The `--accept-data-loss` flag is needed because we're dropping the `IncomeCategory` table. However, we've already migrated the data in Step 2, so no data will actually be lost.

### Step 4: Regenerate Prisma Client

```bash
npx prisma generate
```

### Step 5: Update Existing Category Records

If you have existing `Category` records (expense categories), they need the `type` field set to `EXPENSE`:

```bash
npx tsx scripts/migrate-categories.ts
```

Or manually via SQL:
```sql
UPDATE "Category" SET type = 'EXPENSE' WHERE type IS NULL;
```

### Step 6: Verify Migration

1. Check that all income categories are accessible
2. Check that all expense categories are accessible
3. Test creating new categories of both types
4. Verify that filtering by type works correctly

## What Changed

### Database Schema
- `Category` model now has a `type` field (enum: `EXPENSE` | `INCOME`)
- `IncomeCategory` model is removed
- `Income` model now references `Category` instead of `IncomeCategory`

### API Routes
- `/api/categories` - Now accepts `?type=EXPENSE` or `?type=INCOME` query parameter
- `/api/income-categories` - Still works for backward compatibility, but uses unified model internally

### Components
- All components now use the unified `Category` type
- `IncomeCategory` type is now an alias for `Category` (for backward compatibility)
- Category forms now include a type selector

## Rollback Plan

If you need to rollback:

1. Restore database from backup
2. Revert code changes via git
3. Regenerate Prisma client

```bash
git revert <commit-hash>
npx prisma generate
```

## Testing Checklist

- [ ] All expense categories are visible and functional
- [ ] All income categories are visible and functional
- [ ] Can create new expense categories
- [ ] Can create new income categories
- [ ] Can edit categories
- [ ] Can delete categories (with proper validation)
- [ ] Expenses filter by expense categories only
- [ ] Incomes filter by income categories only
- [ ] Budgets only show expense categories
- [ ] Dashboard displays correctly

