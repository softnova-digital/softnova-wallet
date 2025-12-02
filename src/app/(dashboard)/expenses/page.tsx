import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ExpensesList } from "@/components/expenses-list";
import { ExpenseFilters } from "@/components/expense-filters";
import { AddExpenseButton } from "@/components/add-expense-button";

export default async function ExpensesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [categories, labels] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
    db.label.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
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
      
      <ExpensesList categories={categories} labels={labels} />
    </div>
  );
}
