import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { SalaryRecord } from "@/types";
import { UnauthorizedError } from "@/lib/errors";

interface SalaryRecordsResponse {
  salaryRecords: SalaryRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useSalaryRecords() {
  const searchParams = useSearchParams();

  return useQuery<SalaryRecordsResponse>({
    queryKey: ["salary-records", searchParams.toString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      const employeeId = searchParams.get("employeeId");
      const month = searchParams.get("month");
      const year = searchParams.get("year");

      if (employeeId && employeeId !== "all") params.set("employeeId", employeeId);
      if (month && month !== "all") params.set("month", month);
      if (year && year !== "all") params.set("year", year);
      const page = searchParams.get("page");
      if (page) params.set("page", page);
      params.set("limit", "20");

      const response = await fetch(`/api/salary-records?${params.toString()}`, {
        cache: "no-store",
      });
      if (response.status === 401) throw new UnauthorizedError();
      if (!response.ok) throw new Error("Failed to fetch salary records");
      return response.json();
    },
    refetchOnWindowFocus: false,
  });
}

interface CreateSalaryRecordData {
  employeeId: string;
  month: number;
  year: number;
  amount: number;
  paymentDate: string;
  remarks?: string;
}

interface UpdateSalaryRecordData {
  id: string;
  amount?: number;
  paymentDate?: string;
  remarks?: string | null;
}

export function useCreateSalaryRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSalaryRecordData) => {
      const response = await fetch("/api/salary-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create salary record");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["salary-records"], refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: ["expenses"], refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: ["dashboard"] });
      toast.success("Salary record created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create salary record");
    },
  });
}

export function useUpdateSalaryRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSalaryRecordData) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/salary-records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update salary record");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["salary-records"], refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: ["expenses"], refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: ["dashboard"] });
      toast.success("Salary record updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update salary record");
    },
  });
}

export function useDeleteSalaryRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/salary-records/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete salary record");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["salary-records"], refetchType: "active" });
      await queryClient.invalidateQueries({ queryKey: ["expenses"], refetchType: "active" });
      await queryClient.refetchQueries({ queryKey: ["dashboard"] });
      toast.success("Salary record deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete salary record");
    },
  });
}
