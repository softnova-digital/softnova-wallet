"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expense-form";
import { TablePagination } from "@/components/table-pagination";
import { getCategoryIcon } from "@/lib/category-icons";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Category, Label, Expense } from "@/types";

interface ExpensesListProps {
  categories: Category[];
  labels: Label[];
}

export function ExpensesList({ categories, labels }: ExpensesListProps) {
  const { data, isLoading: loading, error } = useExpenses();
  const deleteExpenseMutation = useDeleteExpense();
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  const expenses = data?.expenses || [];
  const pagination = data?.pagination;

  function handleDelete() {
    if (!deleteExpense) return;
    deleteExpenseMutation.mutate(deleteExpense.id, {
      onSuccess: () => {
        setDeleteExpense(null);
        setEditExpense(null);
      },
    });
  }

  if (loading) {
    return <LoadingCard text="Loading expenses..." />;
  }

  if (error) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium text-destructive">
            Failed to load expenses
          </p>
          <p className="text-sm mt-1">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  if (pagination ? pagination.total === 0 : expenses.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center animate-fade-in">
            <Receipt className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No expenses found</p>
          <p className="text-sm mt-1">Add your first expense to get started</p>
        </CardContent>
      </Card>
    );
  }

  // Pre-compute totals per month for the section headers
  const monthlyTotals = expenses.reduce<Record<string, number>>(
    (acc, expense) => {
      const key = format(new Date(expense.date), "MMMM yyyy");
      acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    },
    {},
  );

  return (
    <>
      {/* ── Desktop Table View ── */}
      <Card className="hidden md:block animate-fade-in-up overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 pr-4">Date</TableHead>
              <TableHead className="px-4">Description</TableHead>
              <TableHead className="px-4">Category</TableHead>
              <TableHead className="text-right px-4">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              let lastMonth = "";
              return expenses.map((expense, index) => {
                const Icon = getCategoryIcon(
                  expense.category?.icon || "folder",
                );
                const monthLabel = format(new Date(expense.date), "MMMM yyyy");
                const isNewMonth = monthLabel !== lastMonth;
                lastMonth = monthLabel;
                return (
                  <React.Fragment key={expense.id}>
                    {isNewMonth && (
                      <TableRow
                        key={`month-${monthLabel}`}
                        className="hover:bg-transparent border-t border-border/40 first:border-t-0"
                      >
                        <TableCell
                          colSpan={4}
                          className="px-6 py-2.5 bg-accent"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-widest text-destructive">
                              {monthLabel}
                            </span>
                            <span className="text-xs text-destructive tabular-nums">
                              ₹
                              {(monthlyTotals[monthLabel] || 0).toLocaleString(
                                "en-IN",
                                { minimumFractionDigits: 2 },
                              )}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow
                      key={expense.id}
                      className="table-row-animate animate-fade-in-up cursor-pointer hover:bg-accent/40 transition-colors"
                      style={{ animationDelay: `${index * 25}ms` }}
                      onClick={() => setEditExpense(expense)}
                    >
                      <TableCell className="text-muted-foreground pl-6 pr-4">
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="px-4">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          {expense.labels && expense.labels.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {expense.labels.slice(0, 3).map(({ label }) => (
                                <Badge
                                  key={label.id}
                                  variant="outline"
                                  className="text-xs transition-transform hover:scale-105"
                                  style={{
                                    borderColor: label.color,
                                    color: label.color,
                                  }}
                                >
                                  {label.name}
                                </Badge>
                              ))}
                              {expense.labels.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{expense.labels.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1.5 rounded-lg transition-transform hover:scale-110"
                            style={{
                              backgroundColor:
                                (expense.category?.color || "#2ECC71") + "20",
                            }}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{
                                color: expense.category?.color || "#2ECC71",
                              }}
                            />
                          </div>
                          <span className="text-sm">
                            {expense.category?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold px-4 pr-6">
                        ₹
                        {expense.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              });
            })()}
          </TableBody>
        </Table>
      </Card>

      {/* ── Mobile List View — grouped by month ── */}
      <div className="md:hidden space-y-4">
        {(() => {
          let lastMobileMonth = "";
          const groups: { monthLabel: string; items: typeof expenses }[] = [];
          expenses.forEach((expense) => {
            const ml = format(new Date(expense.date), "MMMM yyyy");
            if (ml !== lastMobileMonth) {
              groups.push({ monthLabel: ml, items: [] });
              lastMobileMonth = ml;
            }
            groups[groups.length - 1].items.push(expense);
          });

          return groups.map((group) => (
            <Card key={group.monthLabel} className="animate-fade-in-up overflow-hidden gap-2 py-2">
              {/* Month header */}
              <div className="flex items-center justify-between px-4 py-2 bg-accent/30 border-b border-border/40">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.monthLabel}
                </span>
                <span className="text-xs font-semibold text-muted-foreground/80 tabular-nums">
                  ₹{(monthlyTotals[group.monthLabel] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Entries */}
              {group.items.map((expense, idx) => {
                const Icon = getCategoryIcon(expense.category?.icon || "folder");
                return (
                  <div
                    key={expense.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors ${
                      idx !== group.items.length - 1 ? "border-b border-border/30" : ""
                    }`}
                    onClick={() => setEditExpense(expense)}
                  >
                    {/* Category icon */}
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{ backgroundColor: (expense.category?.color || "#2ECC71") + "20" }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: expense.category?.color || "#2ECC71" }}
                      />
                    </div>

                    {/* Description + Category */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate leading-tight">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {expense.category?.name}
                      </p>
                    </div>

                    {/* Amount + Date */}
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-sm tabular-nums">
                        ₹{expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(expense.date), "MMM d")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </Card>
          ));
        })()}
      </div>

      {/* ── Pagination ── */}
      {pagination && (
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          path="/expenses"
        />
      )}

      {/* ── Edit / Detail Modal ── */}
      <Dialog open={!!editExpense} onOpenChange={() => setEditExpense(null)}>
        <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-border/80 p-5 sm:p-6">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-xl font-semibold">Edit Expense</DialogTitle>
          </DialogHeader>

          {editExpense && (
            <ExpenseForm
              categories={categories}
              labels={labels}
              expense={editExpense}
              onSuccess={() => setEditExpense(null)}
              onDelete={() => setDeleteExpense(editExpense)}
              isDeleting={deleteExpenseMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={!!deleteExpense}
        onOpenChange={(open) => {
          if (!open) setDeleteExpense(null);
        }}
      >
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteExpenseMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteExpenseMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteExpenseMutation.isPending ? (
                <LoadingSpinner size="sm" text="Deleting..." />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
