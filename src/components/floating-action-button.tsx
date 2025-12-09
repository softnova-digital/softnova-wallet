"use client";

import { useState } from "react";
import { Plus, TrendingDown, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddExpenseButton } from "@/components/add-expense-button";
import { AddIncomeButton } from "@/components/add-income-button";
import type { Category, Label } from "@/types";

interface FloatingActionButtonProps {
  expenseCategories: Category[];
  incomeCategories: Category[];
  labels: Label[];
}

export function FloatingActionButton({
  expenseCategories,
  incomeCategories,
  labels,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);

  const handleExpenseClick = () => {
    setExpenseDialogOpen(true);
    setIsOpen(false);
  };

  const handleIncomeClick = () => {
    setIncomeDialogOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Container - Only visible on mobile */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        {/* Backdrop overlay when open */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
            style={{ margin: 0 }}
          />
        )}

        <div className="relative z-50">
          {/* Action Buttons */}
          <div
            className={cn(
              "absolute bottom-20 right-0 flex flex-col gap-4 transition-all duration-300 ease-out items-end",
              isOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
            )}
          >
            {/* Add Income Button */}
            <div className="flex flex-col items-center gap-1.5">
              <Button
                onClick={handleIncomeClick}
                size="lg"
                className="h-14 w-14 rounded-full shadow-xl bg-green-600 hover:bg-green-700 active:scale-95 text-white touch-manipulation transition-transform"
                title="Add Income"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="sr-only">Add Income</span>
              </Button>
              <span className="text-xs font-medium text-foreground bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm">
                Income
              </span>
            </div>

            {/* Add Expense Button */}
            <div className="flex flex-col items-center gap-1.5">
              <Button
                onClick={handleExpenseClick}
                size="lg"
                className="h-14 w-14 rounded-full shadow-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white touch-manipulation transition-transform"
                title="Add Expense"
              >
                <TrendingDown className="h-6 w-6" />
                <span className="sr-only">Add Expense</span>
              </Button>
              <span className="text-xs font-medium text-foreground bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm">
                Expense
              </span>
            </div>
          </div>

          {/* Main FAB Button */}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 touch-manipulation active:scale-95",
              isOpen
                ? "bg-destructive hover:bg-destructive/90 rotate-45"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Plus className="h-6 w-6 text-white" />
            )}
            <span className="sr-only">Quick Actions</span>
          </Button>
        </div>
      </div>

      {/* Use the same components as desktop */}
      <AddExpenseButton
        categories={expenseCategories}
        labels={labels}
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        showTrigger={false}
      />
      <AddIncomeButton
        categories={incomeCategories}
        open={incomeDialogOpen}
        onOpenChange={setIncomeDialogOpen}
        showTrigger={false}
      />
    </>
  );
}
