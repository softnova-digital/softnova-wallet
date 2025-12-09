import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Expense } from "@/types";

interface ExpensesResponse {
  expenses: Expense[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useExpenses() {
  const searchParams = useSearchParams();

  return useQuery<ExpensesResponse>({
    queryKey: ["expenses", searchParams.toString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      const categoryId = searchParams.get("categoryId");
      const payee = searchParams.get("payee");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const search = searchParams.get("search");

      if (categoryId && categoryId !== "all") params.set("categoryId", categoryId);
      if (payee && payee !== "all") params.set("payee", payee);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (search) params.set("search", search);

      const response = await fetch(`/api/expenses?${params.toString()}`, {
        cache: 'no-store' // Ensure fresh data from server
      });
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      return response.json();
    },
    staleTime: 0, // Always consider data stale for expenses to ensure fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

interface CreateExpenseData {
  amount: number;
  description?: string; // Description is now optional
  date: string;
  payee: string;
  categoryId: string;
  labelIds: string[];
  receiptUrl?: string;
  receiptPublicId?: string;
}

interface UpdateExpenseData extends CreateExpenseData {
  id: string;
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create expense");
      }

      return response.json();
    },
    onSuccess: async () => {
      // Invalidate and refetch expenses
      await queryClient.invalidateQueries({ 
        queryKey: ["expenses"],
        refetchType: "active"
      });
      // Force refetch dashboard even if not currently mounted
      await queryClient.refetchQueries({ 
        queryKey: ["dashboard"]
      });
      toast.success("Expense created");
    },
    onError: () => {
      toast.error("Failed to create expense");
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateExpenseData) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["expenses"],
        refetchType: "active"
      });
      // Force refetch dashboard even if not currently mounted
      await queryClient.refetchQueries({ 
        queryKey: ["dashboard"]
      });
      toast.success("Expense updated");
    },
    onError: () => {
      toast.error("Failed to update expense");
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["expenses"],
        refetchType: "active"
      });
      // Force refetch dashboard even if not currently mounted
      await queryClient.refetchQueries({ 
        queryKey: ["dashboard"]
      });
      toast.success("Expense deleted");
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });
}

