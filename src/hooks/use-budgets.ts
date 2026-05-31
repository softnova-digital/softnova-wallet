import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UnauthorizedError } from "@/lib/errors";

export interface BudgetWithSpent {
  id: string;
  amount: number;
  period: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  spent: number;
}

export function useBudgets() {
  return useQuery<BudgetWithSpent[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await fetch("/api/budgets");
      if (response.status === 401) throw new UnauthorizedError();
      if (!response.ok) throw new Error("Failed to fetch budgets");
      return response.json();
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete budget");
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["budgets"], refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: ["dashboard"] });
      toast.success("Budget deleted");
    },
    onError: () => {
      toast.error("Failed to delete budget");
    },
  });
}
