import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ExpensesList } from "@/components/expenses-list";
import { ExpensesPageClient } from "@/components/expenses-page-client";
import { getExpenseCategories, getLabels } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Expenses",
  description: "Track and manage all your business expenses",
};

export default async function ExpensesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [categories, labels] = await Promise.all([
    getExpenseCategories(),
    getLabels(),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <ExpensesPageClient categories={categories} labels={labels} />
      
      <ExpensesList categories={categories} labels={labels} />
    </div>
  );
}
