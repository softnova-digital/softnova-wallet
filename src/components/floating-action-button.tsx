"use client";

import { useState, useEffect } from "react";
import { Plus, TrendingDown, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expense-form";
import { IncomeForm } from "@/components/income-form";
import { cn } from "@/lib/utils";
import type { Category, Label } from "@/types";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<"expense" | "income" | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(
    []
  );
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeForm) {
      fetchData();
    }
  }, [isOpen, activeForm]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [expenseCategoriesRes, incomeCategoriesRes, labelsRes] = await Promise.all(
        [
          fetch("/api/categories?type=EXPENSE"),
          fetch("/api/categories?type=INCOME"),
          fetch("/api/labels"),
        ]
      );

      if (expenseCategoriesRes.ok) {
        const cats = await expenseCategoriesRes.json();
        setCategories(cats);
      }

      if (incomeCategoriesRes.ok) {
        const cats = await incomeCategoriesRes.json();
        setIncomeCategories(cats);
      }

      if (labelsRes.ok) {
        const labs = await labelsRes.json();
        setLabels(labs);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleExpenseClick = () => {
    setActiveForm("expense");
    setIsOpen(true);
  };

  const handleIncomeClick = () => {
    setActiveForm("income");
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form after animation
    setTimeout(() => {
      setActiveForm(null);
    }, 200);
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

      {/* Dialogs */}
      <Dialog
        open={isOpen && activeForm === "expense"}
        onOpenChange={handleClose}
      >
        <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ExpenseForm
              categories={categories}
              labels={labels}
              onSuccess={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isOpen && activeForm === "income"}
        onOpenChange={handleClose}
      >
        <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add New Income</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <IncomeForm categories={incomeCategories} onSuccess={handleClose} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
