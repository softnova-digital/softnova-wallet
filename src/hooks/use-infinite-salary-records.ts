import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type { SalaryRecord } from "@/types";

interface SalaryPage {
  salaryRecords: SalaryRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useInfiniteSalaryRecords({ enabled = false }: { enabled?: boolean } = {}) {
  const searchParams = useSearchParams();

  const filterKey = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    return p.toString();
  })();

  return useInfiniteQuery<SalaryPage>({
    queryKey: ["salary-records-infinite", filterKey],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      const employeeId = searchParams.get("employeeId");
      const month = searchParams.get("month");
      const year = searchParams.get("year");
      if (employeeId && employeeId !== "all") params.set("employeeId", employeeId);
      if (month && month !== "all") params.set("month", month);
      if (year && year !== "all") params.set("year", year);
      params.set("page", String(pageParam as number));
      params.set("limit", "20");
      const res = await fetch(`/api/salary-records?${params}`);
      if (!res.ok) throw new Error("Failed to fetch salary records");
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
