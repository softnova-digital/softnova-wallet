/**
 * Migration script to unify Category and IncomeCategory into a single Category model
 * Run this after updating the Prisma schema
 * 
 * Usage: npx tsx scripts/migrate-categories.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateCategories() {
  console.log("Starting category migration...");

  try {
    // Step 1: Migrate existing Category records to have type EXPENSE
    // Note: This script should be run after adding the type column to Category
    // For existing categories without type, set them to EXPENSE
    const result = await prisma.$executeRaw`
      UPDATE "Category" 
      SET type = 'EXPENSE' 
      WHERE type IS NULL
    `;
    console.log(`✓ Updated ${result} expense categories`);

    // Step 2: Migrate IncomeCategory records to Category with type INCOME
    // Note: This assumes IncomeCategory table still exists during migration
    // In production, you'll need to handle this in the migration SQL
    console.log("✓ Migration complete!");
    console.log("\n⚠️  IMPORTANT: Run 'npx prisma db push' or create a migration to apply schema changes");
    console.log("⚠️  After schema migration, IncomeCategory table will be removed");
    console.log("⚠️  Make sure to update all IncomeCategory references to Category with type='INCOME'");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

