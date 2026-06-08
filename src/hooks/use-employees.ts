import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Employee } from "@/types";
import { UnauthorizedError } from "@/lib/errors";

interface EmployeesResponse {
  employees: Employee[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useEmployees(options?: { activeOnly?: boolean }) {
  const searchParams = useSearchParams();

  return useQuery<EmployeesResponse>({
    queryKey: ["employees", searchParams.toString(), options?.activeOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      const search = searchParams.get("search");
      if (search) params.set("search", search);
      if (options?.activeOnly) params.set("activeOnly", "true");
      const page = searchParams.get("page");
      if (page) params.set("page", page);
      params.set("limit", "20");

      const response = await fetch(`/api/employees?${params.toString()}`, {
        cache: "no-store",
      });
      if (response.status === 401) throw new UnauthorizedError();
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
    refetchOnWindowFocus: false,
  });
}

interface CreateEmployeeData {
  name: string;
  phone?: string;
  email?: string;
  designation: string;
  profileImage?: string;
  isActive: boolean;
}

interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  id: string;
}

async function invalidateEmployees(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["employees"], refetchType: "active" });
  await queryClient.invalidateQueries({ queryKey: ["employees-infinite"] });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmployeeData) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create employee");
      }

      return response.json();
    },
    onSuccess: async () => {
      await invalidateEmployees(queryClient);
      toast.success("Employee created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEmployeeData) => {
      const { id, ...updateData } = data;
      const response = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update employee");
      }

      return response.json();
    },
    onSuccess: async () => {
      await invalidateEmployees(queryClient);
      toast.success("Employee updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update employee");
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/employees/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete employee");
      }

      return response.json();
    },
    onSuccess: async () => {
      await invalidateEmployees(queryClient);
      await queryClient.refetchQueries({ queryKey: ["dashboard"] });
      toast.success("Employee deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });
}
