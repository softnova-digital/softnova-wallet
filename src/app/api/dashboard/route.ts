import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subMonths,
} from "date-fns";

// Cache configuration for dashboard data
export const revalidate = 30; // Revalidate every 30 seconds
export const dynamic = "force-dynamic"; // Force dynamic rendering for user-specific data

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Parallelize all queries for better performance
    const [
      thisMonthExpenses,
      lastMonthExpenses,
      thisMonthIncomes,
      lastMonthIncomes,
      budgets,
      recentExpenses,
      recentIncomes,
      expensesByCategory,
      categories,
    ] = await Promise.all([
      // Get this month's expenses
      db.expense.aggregate({
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      // Get last month's expenses for comparison
      db.expense.aggregate({
        where: {
          userId,
          date: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      // Get this month's incomes
      db.income.aggregate({
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      // Get last month's incomes for comparison
      db.income.aggregate({
        where: {
          userId,
          date: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      // Get budgets
      db.budget.findMany({
        where: {
          userId,
        },
        include: {
          category: true,
        },
      }),
      // Get recent expenses
      db.expense.findMany({
        where: {
          userId,
        },
        take: 5,
        orderBy: {
          date: "desc",
        },
        include: {
          category: true,
          labels: {
            include: {
              label: true,
            },
          },
        },
      }),
      // Get recent incomes
      db.income.findMany({
        where: {
          userId,
        },
        take: 5,
        orderBy: {
          date: "desc",
        },
        include: {
          category: true,
        },
      }),
      // Get expenses by category for the chart
      db.expense.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      // Get all expense categories (for budgets and charts)
      db.category.findMany({
        where: { type: "EXPENSE" },
      }),
    ]);

    // Calculate spent amount for each budget
    const budgetQueries = budgets.map((budget: (typeof budgets)[0]) => {
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
          userId,
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

    let budgetAlerts = 0;
    const budgetsWithSpent = budgets.map(
      (budget: (typeof budgets)[0], index: number) => {
        const spent = budgetExpenses[index]._sum.amount || 0;
        const percentage = (spent / budget.amount) * 100;

        if (percentage >= 80) {
          budgetAlerts++;
        }

        return {
          ...budget,
          spent,
        };
      }
    );

    const chartData = expensesByCategory.map(
      (e: { categoryId: string; _sum: { amount: number | null } }) => {
        const category = categories.find(
          (c: (typeof categories)[0]) => c.id === e.categoryId
        );
        return {
          name: category?.name || "Unknown",
          value: e._sum.amount || 0,
          color: category?.color || "#2ECC71",
        };
      }
    );

    const thisMonthExpenseTotal = thisMonthExpenses._sum.amount || 0;
    const lastMonthExpenseTotal = lastMonthExpenses._sum.amount || 0;
    const expenseMonthlyChange =
      lastMonthExpenseTotal > 0
        ? ((thisMonthExpenseTotal - lastMonthExpenseTotal) /
            lastMonthExpenseTotal) *
          100
        : 0;

    const thisMonthIncomeTotal = thisMonthIncomes._sum.amount || 0;
    const lastMonthIncomeTotal = lastMonthIncomes._sum.amount || 0;
    const incomeMonthlyChange =
      lastMonthIncomeTotal > 0
        ? ((thisMonthIncomeTotal - lastMonthIncomeTotal) /
            lastMonthIncomeTotal) *
          100
        : 0;

    const netBalance = thisMonthIncomeTotal - thisMonthExpenseTotal;

    return NextResponse.json(
      {
        stats: {
          monthlyIncome: {
            value: thisMonthIncomeTotal,
            change: incomeMonthlyChange,
          },
          monthlyExpenses: {
            value: thisMonthExpenseTotal,
            change: expenseMonthlyChange,
          },
          netBalance,
          budgetAlerts,
        },
        recentExpenses,
        recentIncomes,
        budgets: budgetsWithSpent,
        chartData,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
