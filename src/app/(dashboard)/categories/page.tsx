import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CategoriesList } from "@/components/categories-list";
import { AddCategoryButton } from "@/components/add-category-button";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage expense categories for better organization",
};

export default async function CategoriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Optimize: Use parallel queries and filter expense count by userId
  const [categories, expenseCounts] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
    // Get expense counts per category for this user
    db.expense.groupBy({
      by: ["categoryId"],
      where: {
        userId, // Filter by userId for performance
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Map expense counts to categories
  const expenseCountMap = new Map(
    expenseCounts.map((ec) => [ec.categoryId, ec._count.id])
  );

  const categoriesWithCount = categories.map((category) => ({
    ...category,
    _count: {
      expenses: expenseCountMap.get(category.id) || 0,
    },
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage expense categories for better organization
          </p>
        </div>
        <AddCategoryButton />
      </div>

      <CategoriesList categories={categoriesWithCount} />
    </div>
  );
}
