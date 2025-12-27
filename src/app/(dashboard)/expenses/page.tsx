import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ExpensesList } from "@/components/expenses-list";
import { ExpensesPageClient } from "@/components/expenses-page-client";

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
    db.category.findMany({
      where: { type: "EXPENSE" },
      orderBy: { name: "asc" },
    }),
    db.label.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <ExpensesPageClient categories={categories} labels={labels} />
      
      <ExpensesList categories={categories} labels={labels} />
    </div>
  );
}
