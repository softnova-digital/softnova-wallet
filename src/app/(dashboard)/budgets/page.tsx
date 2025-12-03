import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BudgetsList } from "@/components/budgets-list";
import { AddBudgetButton } from "@/components/add-budget-button";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

export default async function BudgetsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const [budgets, categories] = await Promise.all([
    db.budget.findMany({
      where: {
        userId, // Filter by userId for security and performance
      },
      include: {
        category: true,
      },
      orderBy: [{ period: "asc" }],
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Calculate spent amount for each budget - optimized to avoid N+1 queries
  // Group budgets by period type to batch queries
  const budgetQueries = budgets.map((budget) => {
    let periodStart: Date;
    let periodEnd: Date;

    switch (budget.period) {
      case "weekly":
        periodStart = weekStart;
        periodEnd = weekEnd;
        break;
      case "monthly":
        periodStart = monthStart;
        periodEnd = monthEnd;
        break;
      case "yearly":
        periodStart = yearStart;
        periodEnd = yearEnd;
        break;
      default:
        periodStart = monthStart;
        periodEnd = monthEnd;
    }

    return db.expense.aggregate({
      where: {
        userId, // Critical: Filter by userId
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
        ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
      },
      _sum: {
        amount: true,
      },
    });
  });

  const budgetExpenses = await Promise.all(budgetQueries);

  const budgetsWithSpent = budgets.map((budget, index) => {
    const spent = budgetExpenses[index]._sum.amount || 0;
    return {
      ...budget,
      spent,
    };
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Set and track your spending limits
          </p>
        </div>
        <AddBudgetButton categories={categories} />
      </div>

      <BudgetsList budgets={budgetsWithSpent} categories={categories} />
    </div>
  );
}
