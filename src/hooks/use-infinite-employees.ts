import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type { Employee } from "@/types";

interface EmployeePage {
  employees: Employee[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useInfiniteEmployees({ enabled = false }: { enabled?: boolean } = {}) {
  const searchParams = useSearchParams();

  const filterKey = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    return p.toString();
  })();

  return useInfiniteQuery<EmployeePage>({
    queryKey: ["employees-infinite", filterKey],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      const search = searchParams.get("search");
      if (search) params.set("search", search);
      params.set("page", String(pageParam as number));
      params.set("limit", "20");
      const res = await fetch(`/api/employees?${params}`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
