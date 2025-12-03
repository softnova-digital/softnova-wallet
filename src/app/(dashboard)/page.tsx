import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardCard } from "@/components/dashboard-card";
import { RecentExpenses } from "@/components/recent-expenses";
import { RecentIncomes } from "@/components/recent-incomes";
import { BudgetOverview } from "@/components/budget-overview";
import { SpendingChart } from "@/components/spending-chart";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subMonths,
} from "date-fns";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
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

  // Parallelize all initial queries for better performance
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
    // Get all categories
    db.category.findMany(),
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
  const budgetsWithSpent = budgets.map((budget, index) => {
    const spent = budgetExpenses[index]._sum.amount || 0;
    const percentage = (spent / budget.amount) * 100;

    if (percentage >= 80) {
      budgetAlerts++;
    }

    return {
      ...budget,
      spent,
    };
  });
  const chartData = expensesByCategory.map((e) => {
    const category = categories.find((c) => c.id === e.categoryId);
    return {
      name: category?.name || "Unknown",
      value: e._sum.amount || 0,
      color: category?.color || "#2ECC71",
    };
  });

  const thisMonthExpenseTotal = thisMonthExpenses._sum.amount || 0;
  const lastMonthExpenseTotal = lastMonthExpenses._sum.amount || 0;
  const expenseMonthlyChange =
    lastMonthExpenseTotal > 0
      ? ((thisMonthExpenseTotal - lastMonthExpenseTotal) / lastMonthExpenseTotal) * 100
      : 0;

  const thisMonthIncomeTotal = thisMonthIncomes._sum.amount || 0;
  const lastMonthIncomeTotal = lastMonthIncomes._sum.amount || 0;
  const incomeMonthlyChange =
    lastMonthIncomeTotal > 0
      ? ((thisMonthIncomeTotal - lastMonthIncomeTotal) / lastMonthIncomeTotal) * 100
      : 0;

  const netBalance = thisMonthIncomeTotal - thisMonthExpenseTotal;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Overview of your company finances
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Monthly Income"
          value={`$${thisMonthIncomeTotal.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          description="from last month"
          icon={Wallet}
          trend={{
            value: Math.abs(Math.round(incomeMonthlyChange)),
            isPositive: incomeMonthlyChange >= 0,
          }}
          index={0}
          className="border-blue-500/20"
        />
        <DashboardCard
          title="Monthly Expenses"
          value={`$${thisMonthExpenseTotal.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          description="from last month"
          icon={Receipt}
          trend={{
            value: Math.abs(Math.round(expenseMonthlyChange)),
            isPositive: expenseMonthlyChange <= 0,
          }}
          index={1}
        />
        <DashboardCard
          title="Net Balance"
          value={`${netBalance >= 0 ? '+' : '-'}$${Math.abs(netBalance).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          description="this month"
          icon={netBalance >= 0 ? TrendingUp : TrendingDown}
          className={netBalance >= 0 ? "border-green-500/20" : "border-destructive/20"}
          index={2}
        />
        <DashboardCard
          title="Budget Alerts"
          value={budgetAlerts.toString()}
          description={budgetAlerts > 0 ? "budgets need attention" : "all budgets on track"}
          icon={AlertTriangle}
          className={budgetAlerts > 0 ? "border-destructive/50" : ""}
          index={3}
        />
      </div>

      {/* Charts and Budget Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SpendingChart data={chartData} />
        <BudgetOverview budgets={budgetsWithSpent} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentIncomes incomes={recentIncomes} />
        <RecentExpenses expenses={recentExpenses} />
      </div>
    </div>
  );
}
