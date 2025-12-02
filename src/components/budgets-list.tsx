"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, MoreHorizontal, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BudgetForm } from "@/components/budget-form";
import { getCategoryIcon } from "@/lib/category-icons";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface BudgetWithSpent {
  id: string;
  amount: number;
  period: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  spent: number;
}

interface BudgetsListProps {
  budgets: BudgetWithSpent[];
  categories: Category[];
}

export function BudgetsList({ budgets, categories }: BudgetsListProps) {
  const router = useRouter();
  const [editBudget, setEditBudget] = useState<BudgetWithSpent | null>(null);
  const [deleteBudget, setDeleteBudget] = useState<BudgetWithSpent | null>(null);

  async function handleDelete() {
    if (!deleteBudget) return;

    try {
      const response = await fetch(`/api/budgets/${deleteBudget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Budget deleted");
      setDeleteBudget(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete budget");
    }
  }

  if (budgets.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center animate-bounce-in">
            <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No budgets set</p>
          <p className="text-sm mt-1">Create your first budget to track spending</p>
        </CardContent>
      </Card>
    );
  }

  // Group budgets by period
  const groupedBudgets = {
    weekly: budgets.filter((b) => b.period === "weekly"),
    monthly: budgets.filter((b) => b.period === "monthly"),
    yearly: budgets.filter((b) => b.period === "yearly"),
  };

  const periodLabels = {
    weekly: "Weekly Budgets",
    monthly: "Monthly Budgets",
    yearly: "Yearly Budgets",
  };

  return (
    <>
      <div className="space-y-8">
        {(Object.keys(groupedBudgets) as Array<keyof typeof groupedBudgets>).map(
          (period, periodIndex) => {
            const periodBudgets = groupedBudgets[period];
            if (periodBudgets.length === 0) return null;

            return (
              <div key={period} className="animate-fade-in-up" style={{ animationDelay: `${periodIndex * 100}ms` }}>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {periodLabels[period]}
                </h2>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {periodBudgets.map((budget, index) => {
                    const percentage = (budget.spent / budget.amount) * 100;
                    const isOverBudget = percentage >= 100;
                    const isWarning = percentage >= 80 && percentage < 100;
                    const remaining = budget.amount - budget.spent;

                    const Icon = budget.category
                      ? getCategoryIcon(budget.category.icon)
                      : TrendingUp;

                    return (
                      <Card
                        key={budget.id}
                        className={cn(
                          "relative card-interactive hover-lift animate-fade-in-up overflow-hidden",
                          isOverBudget && "border-destructive/50",
                          isWarning && "border-yellow-500/50"
                        )}
                        style={{ animationDelay: `${(periodIndex * 100) + (index * 75)}ms` }}
                      >
                        {/* Status indicator bar */}
                        <div 
                          className={cn(
                            "absolute top-0 left-0 right-0 h-1",
                            isOverBudget ? "bg-destructive" : isWarning ? "bg-yellow-500" : "bg-primary"
                          )}
                        />
                        
                        <CardHeader className="pb-2 pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="p-2 rounded-lg transition-transform hover:scale-110"
                                style={{
                                  backgroundColor:
                                    (budget.category?.color || "#2ECC71") + "20",
                                }}
                              >
                                <Icon
                                  className="h-5 w-5"
                                  style={{
                                    color: budget.category?.color || "#2ECC71",
                                  }}
                                />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {budget.category?.name || "Overall"}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {period}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="animate-scale-in">
                                <DropdownMenuItem
                                  onClick={() => setEditBudget(budget)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteBudget(budget)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                ${budget.spent.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                spent
                              </span>
                              <span className="font-medium">
                                ${budget.amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <Progress
                              value={Math.min(percentage, 100)}
                              className={cn(
                                "h-2.5 animate-progress-fill",
                                isOverBudget
                                  ? "[&>div]:bg-destructive"
                                  : isWarning
                                  ? "[&>div]:bg-yellow-500"
                                  : "[&>div]:bg-primary"
                              )}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {percentage.toFixed(0)}% used
                              </span>
                              {isOverBudget ? (
                                <div className="flex items-center gap-1 text-destructive text-sm font-medium">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>
                                    Over by $
                                    {Math.abs(remaining).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  ${remaining.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                  })}{" "}
                                  remaining
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editBudget} onOpenChange={() => setEditBudget(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          {editBudget && (
            <BudgetForm
              categories={categories}
              budget={editBudget}
              onSuccess={() => {
                setEditBudget(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteBudget}
        onOpenChange={() => setDeleteBudget(null)}
      >
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
