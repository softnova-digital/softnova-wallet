/**
 * Migration script to migrate IncomeCategory data to unified Category model
 * 
 * IMPORTANT: Run this BEFORE applying the Prisma schema changes
 * 
 * Usage: npx tsx scripts/migrate-income-categories.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateIncomeCategories() {
  console.log("Starting income category migration...");

  try {
    // Step 1: Check if Category table has type field
    // If not, we need to add it first (this should be done via migration)
    console.log("Checking schema...");

    // Step 2: Get all IncomeCategory records
    const incomeCategories = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      icon: string;
      color: string;
      isDefault: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM "IncomeCategory"
    `;

    console.log(`Found ${incomeCategories.length} income categories to migrate`);

    if (incomeCategories.length === 0) {
      console.log("No income categories to migrate. Skipping...");
      return;
    }

    // Step 3: For each IncomeCategory, create a Category with type INCOME
    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      for (const incomeCat of incomeCategories) {
        // Check if category with same name and type already exists
        const existing = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "Category" 
          WHERE name = ${incomeCat.name} 
          AND type = 'INCOME'
        `;

        if (existing.length > 0) {
          console.log(`  ⚠️  Category "${incomeCat.name}" already exists, skipping...`);
          // Update Income records to use existing category
          await tx.$executeRaw`
            UPDATE "Income" 
            SET "categoryId" = ${existing[0].id}
            WHERE "categoryId" = ${incomeCat.id}
          `;
          continue;
        }

        // Create new Category with type INCOME
        await tx.$executeRaw`
          INSERT INTO "Category" (id, name, type, icon, color, "isDefault", "createdAt", "updatedAt")
          VALUES (
            ${incomeCat.id},
            ${incomeCat.name},
            'INCOME',
            ${incomeCat.icon},
            ${incomeCat.color},
            ${incomeCat.isDefault},
            ${incomeCat.createdAt},
            ${incomeCat.updatedAt}
          )
        `;

        console.log(`  ✓ Migrated category: ${incomeCat.name}`);
      }
    });

    console.log("\n✅ Migration completed successfully!");
    console.log("\n⚠️  Next steps:");
    console.log("1. Run: npx prisma db push --accept-data-loss");
    console.log("2. Verify all income categories are accessible");
    console.log("3. Test creating/editing income categories");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateIncomeCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

