"use client";

import { memo, useState } from "react";
import { format } from "date-fns";
import { DashboardCard } from "@/components/dashboard-card";
import { RecentExpenses } from "@/components/recent-expenses";
import { RecentIncomes } from "@/components/recent-incomes";
import { BudgetOverview } from "@/components/budget-overview";
import { SpendingChart } from "@/components/spending-chart";
import {
  TrendingUp,
  TrendingDown,
  CircleArrowUp,
  CircleArrowDown,
  AlertTriangle,
  CalendarIcon,
} from "lucide-react";
import { useDashboard, type DashboardTimeRange } from "@/hooks/use-dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const DashboardContent = memo(function DashboardContent() {
  const [range, setRange] = useState<DashboardTimeRange>("monthly");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data, isLoading, error } = useDashboard({
    range,
    from: startDate,
    to: endDate,
  });

  const getRangeDescription = () => {
    switch (range) {
      case "monthly":
        return "this month";
      case "yearly":
        return "this year";
      case "custom":
        if (startDate && endDate) {
          return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`;
        }
        return "selected period";
      default:
        return "this month";
    }
  };

  const rangeDescription = getRangeDescription();

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Overview of your company finances
            </p>
          </div>
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
      <div className="flex flex-row items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base hidden sm:block">
            Overview of your company finances
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select
            value={range}
            onValueChange={(value: DashboardTimeRange) => setRange(value)}
          >
            <SelectTrigger className="w-[130px] sm:w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom" className="hidden md:flex">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {range === "custom" && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">-</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Income"
          value={`₹${stats.monthlyIncome.value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`}
          description={range === 'custom' ? rangeDescription : `from last ${range === 'yearly' ? 'year' : 'month'}`}
          icon={CircleArrowDown}
          trend={{
            value: Math.abs(Math.round(stats.monthlyIncome.change)),
            isPositive: stats.monthlyIncome.change >= 0,
          }}
          index={0}
          className="border-blue-500/20"
        />
        <DashboardCard
          title="Expenses"
          value={`₹${stats.monthlyExpenses.value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}`}
          description={range === 'custom' ? rangeDescription : `from last ${range === 'yearly' ? 'year' : 'month'}`}
          icon={CircleArrowUp}
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
          description={rangeDescription}
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
});

