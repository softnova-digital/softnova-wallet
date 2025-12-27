import { useQuery } from "@tanstack/react-query";
import type { Expense, Income, Budget, Category } from "@/types";

interface DashboardStats {
  monthlyIncome: {
    value: number;
    change: number;
  };
  monthlyExpenses: {
    value: number;
    change: number;
  };
  netBalance: number;
  budgetAlerts: number;
}

interface DashboardChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface BudgetWithSpent extends Budget {
  spent: number;
  category?: Category;
}

interface DashboardData {
  stats: DashboardStats;
  recentExpenses: (Expense & {
    category: Category;
    labels: { label: { name: string; color: string } }[];
  })[];
  recentIncomes: (Income & {
    category: Category;
  })[];
  budgets: BudgetWithSpent[];
  chartData: DashboardChartData[];
}

export type DashboardTimeRange = "monthly" | "yearly" | "custom";

interface UseDashboardOptions {
  range?: DashboardTimeRange;
  from?: Date;
  to?: Date;
}

export function useDashboard({ range = "monthly", from, to }: UseDashboardOptions = {}) {
  const queryParams = new URLSearchParams();
  if (range) queryParams.set("range", range);
  if (from) queryParams.set("from", from.toISOString());
  if (to) queryParams.set("to", to.toISOString());

  return useQuery<DashboardData>({
    queryKey: ["dashboard", range, from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard?${queryParams.toString()}`, {
        cache: 'no-store' // Bypass browser cache
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't keep unused data in cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

