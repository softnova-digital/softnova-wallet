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
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
  });
}

