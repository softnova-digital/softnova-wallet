import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Income } from "@/types";

interface IncomesResponse {
  incomes: Income[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useIncomes() {
  const searchParams = useSearchParams();

  return useQuery<IncomesResponse>({
    queryKey: ["incomes", searchParams.toString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      const categoryId = searchParams.get("categoryId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const search = searchParams.get("search");

      if (categoryId && categoryId !== "all") params.set("categoryId", categoryId);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (search) params.set("search", search);

      const response = await fetch(`/api/incomes?${params.toString()}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error("Failed to fetch incomes");
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

interface CreateIncomeData {
  amount: number;
  description?: string; // Description is now optional
  date: string;
  source: string;
  categoryId: string;
}

interface UpdateIncomeData extends CreateIncomeData {
  id: string;
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIncomeData) => {
      const response = await fetch("/api/incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create income");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["incomes"],
        refetchType: "active"
      });
      // Force refetch dashboard even if not currently mounted
      await queryClient.refetchQueries({ 
        queryKey: ["dashboard"]
      });
      toast.success("Income added");
    },
    onError: () => {
      toast.error("Failed to create income");
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateIncomeData) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/incomes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update income");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["incomes"],
        refetchType: "active"
      });
      // Force refetch dashboard even if not currently mounted
      await queryClient.refetchQueries({ 
        queryKey: ["dashboard"]
      });
      toast.success("Income updated");
    },
    onError: () => {
      toast.error("Failed to update income");
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/incomes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete income");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["incomes"],
        refetchType: "active"
      });
      // Force refetch dashboard even if not currently mounted
      await queryClient.refetchQueries({ 
        queryKey: ["dashboard"]
      });
      toast.success("Income deleted");
    },
    onError: () => {
      toast.error("Failed to delete income");
    },
  });
}

