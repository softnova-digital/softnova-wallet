"use client";

import dynamic from "next/dynamic";
import type { Category } from "@/types";

// Dynamically import client components that use Radix UI to avoid hydration mismatches
const IncomeFilters = dynamic(
  () => import("@/components/income-filters").then((mod) => ({ default: mod.IncomeFilters })),
  { ssr: false }
);

const AddIncomeButton = dynamic(
  () => import("@/components/add-income-button").then((mod) => ({ default: mod.AddIncomeButton })),
  { ssr: false }
);

interface IncomesPageClientProps {
  categories: Category[];
}

export function IncomesPageClient({ categories }: IncomesPageClientProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Incomes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and manage all your income sources
          </p>
        </div>
        <AddIncomeButton categories={categories} />
      </div>

      <IncomeFilters categories={categories} />
    </>
  );
}

