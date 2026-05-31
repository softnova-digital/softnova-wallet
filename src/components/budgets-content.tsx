"use client";

import { AddBudgetButton } from "@/components/add-budget-button";
import { BudgetsList } from "@/components/budgets-list";
import { useBudgets } from "@/hooks/use-budgets";
import type { Category } from "@/types";

interface BudgetsContentProps {
  categories: Category[];
}

export function BudgetsContent({ categories }: BudgetsContentProps) {
  const { data: budgets, isLoading } = useBudgets();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Set and track your spending limits
          </p>
        </div>
        <AddBudgetButton categories={categories} />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-5 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-accent/50 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-accent/50 rounded" />
                  <div className="h-3 w-16 bg-accent/50 rounded" />
                </div>
              </div>
              <div className="h-2.5 w-full bg-accent/50 rounded-full" />
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-accent/50 rounded" />
                <div className="h-3 w-20 bg-accent/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <BudgetsList budgets={budgets ?? []} categories={categories} />
      )}
    </div>
  );
}
