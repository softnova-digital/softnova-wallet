-- Migration: Unify Category and IncomeCategory into single Category model
-- Run this BEFORE applying Prisma schema changes
-- 
-- Steps:
-- 1. Add type column to Category (nullable first)
-- 2. Set all existing categories to EXPENSE
-- 3. Migrate IncomeCategory data to Category
-- 4. Update Income foreign keys
-- 5. Make type non-nullable
-- 6. Drop IncomeCategory table (done by Prisma)

-- Step 1: Add type column to Category (nullable with default)
ALTER TABLE "Category" 
ADD COLUMN IF NOT EXISTS "type" TEXT;

-- Step 2: Set all existing categories to EXPENSE
UPDATE "Category" 
SET "type" = 'EXPENSE' 
WHERE "type" IS NULL;

-- Step 3: Migrate IncomeCategory data to Category
INSERT INTO "Category" (id, name, "type", icon, color, "isDefault", "createdAt", "updatedAt")
SELECT 
  id,
  name,
  'INCOME' as "type",
  icon,
  color,
  "isDefault",
  "createdAt",
  "updatedAt"
FROM "IncomeCategory"
ON CONFLICT (id) DO NOTHING;

-- Step 4: Update Income records to use the migrated category IDs
-- (This should already be done since IDs are preserved, but verify)
-- Note: If IncomeCategory IDs conflict with Category IDs, you may need to generate new IDs

-- Step 5: Make type non-nullable (will be done by Prisma schema)
-- ALTER TABLE "Category" ALTER COLUMN "type" SET NOT NULL;

-- Step 6: Drop IncomeCategory table (done automatically by Prisma db push)

-- Verification queries:
-- SELECT COUNT(*) FROM "Category" WHERE "type" = 'EXPENSE';
-- SELECT COUNT(*) FROM "Category" WHERE "type" = 'INCOME';
-- SELECT COUNT(*) FROM "Income" WHERE "categoryId" IN (SELECT id FROM "Category" WHERE "type" = 'INCOME');

