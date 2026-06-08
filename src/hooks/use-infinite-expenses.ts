import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type { Expense } from "@/types";

interface ExpensePage {
  expenses: Expense[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function useInfiniteExpenses({ enabled = false }: { enabled?: boolean } = {}) {
  const searchParams = useSearchParams();

  // Cache key excludes page so filter changes properly reset the query
  const filterKey = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    return p.toString();
  })();

  return useInfiniteQuery<ExpensePage>({
    queryKey: ["expenses-infinite", filterKey],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
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
      params.set("page", String(pageParam as number));
      params.set("limit", "20");
      const res = await fetch(`/api/expenses?${params}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
