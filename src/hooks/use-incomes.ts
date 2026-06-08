import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Income } from "@/types";
import { UnauthorizedError } from "@/lib/errors";

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
      const page = searchParams.get("page");
      if (page) params.set("page", page);
      params.set("limit", "20");

      const response = await fetch(`/api/incomes?${params.toString()}`, {
        cache: 'no-store'
      });
      if (response.status === 401) throw new UnauthorizedError();
      if (!response.ok) throw new Error("Failed to fetch incomes");
      return response.json();
    },
    staleTime: 10 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

interface CreateIncomeData {
  amount: number;
  description?: string;
  date: string;
  source: string;
  categoryId: string;
}

interface UpdateIncomeData extends CreateIncomeData {
  id: string;
}

async function invalidateIncomes(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["incomes"], refetchType: "active" });
  await queryClient.invalidateQueries({ queryKey: ["incomes-infinite"] });
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
      await invalidateIncomes(queryClient);
      await queryClient.refetchQueries({ queryKey: ["dashboard"] });
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
      await invalidateIncomes(queryClient);
      await queryClient.refetchQueries({ queryKey: ["dashboard"] });
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
      await invalidateIncomes(queryClient);
      await queryClient.refetchQueries({ queryKey: ["dashboard"] });
      toast.success("Income deleted");
    },
    onError: () => {
      toast.error("Failed to delete income");
    },
  });
}
