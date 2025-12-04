"use client";

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
import { useDashboard } from "@/hooks/use-dashboard";

export function DashboardContent() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overview of your company finances
          </p>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-accent/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overview of your company finances
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { stats, recentExpenses, recentIncomes, budgets, chartData } = data;

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
          value={`₹${stats.monthlyIncome.value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`}
          description="from last month"
          icon={Wallet}
          trend={{
            value: Math.abs(Math.round(stats.monthlyIncome.change)),
            isPositive: stats.monthlyIncome.change >= 0,
          }}
          index={0}
          className="border-blue-500/20"
        />
        <DashboardCard
          title="Monthly Expenses"
          value={`₹${stats.monthlyExpenses.value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`}
          description="from last month"
          icon={Receipt}
          trend={{
            value: Math.abs(Math.round(stats.monthlyExpenses.change)),
            isPositive: stats.monthlyExpenses.change <= 0,
          }}
          index={1}
        />
        <DashboardCard
          title="Net Balance"
          value={`${stats.netBalance >= 0 ? '+' : '-'}₹${Math.abs(stats.netBalance).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`}
          description="this month"
          icon={stats.netBalance >= 0 ? TrendingUp : TrendingDown}
          className={stats.netBalance >= 0 ? "border-green-500/20" : "border-destructive/20"}
          index={2}
        />
        <DashboardCard
          title="Budget Alerts"
          value={stats.budgetAlerts.toString()}
          description={stats.budgetAlerts > 0 ? "budgets need attention" : "all budgets on track"}
          icon={AlertTriangle}
          className={stats.budgetAlerts > 0 ? "border-destructive/50" : ""}
          index={3}
        />
      </div>

      {/* Charts and Budget Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SpendingChart data={chartData} />
        <BudgetOverview budgets={budgets} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentIncomes incomes={recentIncomes} />
        <RecentExpenses expenses={recentExpenses} />
      </div>
    </div>
  );
}

