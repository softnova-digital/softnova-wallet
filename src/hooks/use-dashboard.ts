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

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard", {
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

