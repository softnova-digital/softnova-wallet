import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SettingsTabs } from "@/components/settings-tabs";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your expense tracking preferences",
};

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [labels, expenseCategories, incomeCategories, expenseCounts, incomeCounts] = await Promise.all([
    db.label.findMany({
      orderBy: { name: "asc" },
    }),
    // Get expense categories
    db.category.findMany({
      where: { type: "EXPENSE" },
      orderBy: { name: "asc" },
    }),
    // Get income categories
    db.category.findMany({
      where: { type: "INCOME" },
      orderBy: { name: "asc" },
    }),
    // Get expense counts per category
    db.expense.groupBy({
      by: ["categoryId"],
      where: { userId },
      _count: { id: true },
    }),
    // Get income counts per category
    db.income.groupBy({
      by: ["categoryId"],
      where: { userId },
      _count: { id: true },
    }),
  ]);

  // Map counts to categories
  const expenseCountMap = new Map(
    expenseCounts.map((ec) => [ec.categoryId, ec._count.id])
  );
  const incomeCountMap = new Map(
    incomeCounts.map((ic) => [ic.categoryId, ic._count.id])
  );

  const expenseCategoriesWithCount = expenseCategories.map((category) => ({
    ...category,
    _count: {
      expenses: expenseCountMap.get(category.id) || 0,
    },
  }));

  const incomeCategoriesWithCount = incomeCategories.map((category) => ({
    ...category,
    _count: {
      incomes: incomeCountMap.get(category.id) || 0,
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your categories, labels, and preferences
        </p>
      </div>

      <SettingsTabs
        expenseCategories={expenseCategoriesWithCount}
        incomeCategories={incomeCategoriesWithCount}
        labels={labels}
      />
    </div>
  );
}

