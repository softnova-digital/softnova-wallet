import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  parseISO,
} from "date-fns";

// Cache configuration for dashboard data
export const revalidate = 30; // Cache for 30 seconds
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "monthly";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const now = new Date();
    
    // Default to monthly
    let currentStart = startOfMonth(now);
    let currentEnd = endOfMonth(now);
    let prevStart = startOfMonth(subMonths(now, 1));
    let prevEnd = endOfMonth(subMonths(now, 1));

    if (range === "yearly") {
      currentStart = startOfYear(now);
      currentEnd = endOfYear(now);
      prevStart = startOfYear(subYears(now, 1));
      prevEnd = endOfYear(subYears(now, 1));
    } else if (range === "custom" && from && to) {
      currentStart = parseISO(from);
      currentEnd = parseISO(to);
      // For custom range, currently no comparison or compare to 0
      // Could implement "same period length before" logic if needed
      prevStart = new Date(0); // far past
      prevEnd = new Date(0);
    }

    // Still needed for budget calculations
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    // Parallelize all queries for better performance
    const [
      currentPeriodExpenses,
      lastPeriodExpenses,
      currentPeriodIncomes,
      lastPeriodIncomes,
      budgets,
      recentExpenses,
      recentIncomes,
      expensesByCategory,
      categories,
    ] = await Promise.all([
      // Get current period's expenses
      db.expense.aggregate({
        where: {
          userId,
          date: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      // Get last period's expenses for comparison
      db.expense.aggregate({
        where: {
          userId,
          date: {
            gte: prevStart,
            lte: prevEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      // Get current period's incomes
      db.income.aggregate({
        where: {
          userId,
          date: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      // Get last period's incomes for comparison
      db.income.aggregate({
        where: {
          userId,
          date: {
            gte: prevStart,
            lte: prevEnd,
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
      // Get recent expenses (always top 5 most recent)
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
      // Get expenses by category for the chart (for selected period)
      db.expense.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          date: {
            gte: currentStart,
            lte: currentEnd,
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

    // Calculate spent amount for each budget (Optimized: group by period + category to reduce queries)
    // Group budgets by period and categoryId to batch queries
    const budgetGroups = new Map<string, typeof budgets>();
    
    budgets.forEach((budget) => {
      const key = `${budget.period}-${budget.categoryId || 'all'}`;
      if (!budgetGroups.has(key)) {
        budgetGroups.set(key, []);
      }
      budgetGroups.get(key)!.push(budget);
    });

    // Create one query per unique period+category combination
    const budgetQueries = Array.from(budgetGroups.entries()).map(([key, groupBudgets]) => {
      const firstBudget = groupBudgets[0];
      let periodStart: Date;
      let periodEnd: Date;

      switch (firstBudget.period) {
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

      return {
        key,
        budgets: groupBudgets,
        query: db.expense.aggregate({
          where: {
            userId,
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
            ...(firstBudget.categoryId ? { categoryId: firstBudget.categoryId } : {}),
          },
          _sum: {
            amount: true,
          },
        }),
      };
    });

    const budgetResults = await Promise.all(budgetQueries.map(({ query }) => query));
    
    // Map results back to individual budgets
    const budgetExpensesMap = new Map<string, number>();
    budgetQueries.forEach(({ key, budgets: groupBudgets }, index) => {
      const spent = budgetResults[index]._sum.amount || 0;
      // All budgets in this group have the same spent amount
      groupBudgets.forEach((budget) => {
        budgetExpensesMap.set(budget.id, spent);
      });
    });

    let budgetAlerts = 0;
    const budgetsWithSpent = budgets.map(
      (budget: (typeof budgets)[0]) => {
        const spent = budgetExpensesMap.get(budget.id) || 0;
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

    const currentExpenseTotal = currentPeriodExpenses._sum.amount || 0;
    const lastPeriodExpenseTotal = lastPeriodExpenses._sum.amount || 0;
    
    // Avoid division by zero
    const expenseChange =
      lastPeriodExpenseTotal > 0
        ? ((currentExpenseTotal - lastPeriodExpenseTotal) /
        lastPeriodExpenseTotal) *
          100
        : range === "custom" ? 0 : 0; // If no previous data, 0 change or 100%? 0 is safer.

    const currentIncomeTotal = currentPeriodIncomes._sum.amount || 0;
    const lastPeriodIncomeTotal = lastPeriodIncomes._sum.amount || 0;
    const incomeChange =
      lastPeriodIncomeTotal > 0
        ? ((currentIncomeTotal - lastPeriodIncomeTotal) /
        lastPeriodIncomeTotal) *
          100
        : range === "custom" ? 0 : 0;

    const netBalance = currentIncomeTotal - currentExpenseTotal;

    return NextResponse.json(
      {
        stats: {
          monthlyIncome: { // Keeping key name for frontend compatibility, but value is dynamic
            value: currentIncomeTotal,
            change: incomeChange,
          },
          monthlyExpenses: {
            value: currentExpenseTotal,
            change: expenseChange,
          },
          netBalance,
          budgetAlerts,
        },
        recentExpenses,
        recentIncomes,
        budgets: budgetsWithSpent,
        chartData,
        meta: { // return meta info to help frontend display correct context
           range,
           from: currentStart.toISOString(),
           to: currentEnd.toISOString()
        }
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
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
