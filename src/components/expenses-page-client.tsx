"use client";

import dynamic from "next/dynamic";
import type { Category, Label } from "@/types";

// Dynamically import client components that use Radix UI to avoid hydration mismatches
const ExpenseFilters = dynamic(
  () => import("@/components/expense-filters").then((mod) => ({ default: mod.ExpenseFilters })),
  { ssr: false }
);

const AddExpenseButton = dynamic(
  () => import("@/components/add-expense-button").then((mod) => ({ default: mod.AddExpenseButton })),
  { ssr: false }
);

interface ExpensesPageClientProps {
  categories: Category[];
  labels: Label[];
}

export function ExpensesPageClient({ categories, labels }: ExpensesPageClientProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and manage all your business expenses
          </p>
        </div>
        <AddExpenseButton categories={categories} labels={labels} />
      </div>

      <ExpenseFilters categories={categories} />
    </>
  );
}

