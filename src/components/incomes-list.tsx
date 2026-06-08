"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Wallet } from "lucide-react";
import { useIncomes, useDeleteIncome } from "@/hooks/use-incomes";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { IncomeForm } from "@/components/income-form";
import { TablePagination } from "@/components/table-pagination";
import { getCategoryIcon } from "@/lib/category-icons";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Category, Income } from "@/types";

interface IncomesListProps {
  categories: Category[];
}

export function IncomesList({ categories }: IncomesListProps) {
  const { data, isLoading: loading, error } = useIncomes();
  const deleteIncomeMutation = useDeleteIncome();
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [deleteIncome, setDeleteIncome] = useState<Income | null>(null);

  const incomes = data?.incomes || [];
  const pagination = data?.pagination;

  function handleDelete() {
    if (!deleteIncome) return;
    deleteIncomeMutation.mutate(deleteIncome.id, {
      onSuccess: () => {
        setDeleteIncome(null);
        setEditIncome(null);
      },
    });
  }

  if (loading) {
    return <LoadingCard text="Loading incomes..." />;
  }

  if (error) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium text-destructive">Failed to load incomes</p>
          <p className="text-sm mt-1">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  if (pagination ? pagination.total === 0 : incomes.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center animate-fade-in">
            <Wallet className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No incomes found</p>
          <p className="text-sm mt-1">Add your first income to get started</p>
        </CardContent>
      </Card>
    );
  }

  // Pre-compute totals per month for the section headers
  const monthlyTotals = incomes.reduce<Record<string, number>>((acc, income) => {
    const key = format(new Date(income.date), "MMMM yyyy");
    acc[key] = (acc[key] || 0) + income.amount;
    return acc;
  }, {});

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
              <TableHead className="px-4">Source</TableHead>
              <TableHead className="text-right px-4 pr-6">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              let lastMonth = "";
              return incomes.map((income, index) => {
                const Icon = getCategoryIcon(income.category?.icon || "wallet");
                const monthLabel = format(new Date(income.date), "MMMM yyyy");
                const isNewMonth = monthLabel !== lastMonth;
                lastMonth = monthLabel;
                return (
                  <React.Fragment key={income.id}>
                    {isNewMonth && (
                      <TableRow
                        key={`month-${monthLabel}`}
                        className="hover:bg-transparent border-t border-border/40 first:border-t-0"
                      >
                        <TableCell colSpan={5} className="px-6 py-2.5 bg-accent">
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-widest text-emerald-500 font-semibold">
                              {monthLabel}
                            </span>
                            <span className="text-xs text-emerald-500 font-semibold tabular-nums">
                              ₹
                              {(monthlyTotals[monthLabel] || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow
                      className="table-row-animate animate-fade-in-up cursor-pointer hover:bg-accent/40 transition-colors"
                      style={{ animationDelay: `${index * 25}ms` }}
                      onClick={() => setEditIncome(income)}
                    >
                      <TableCell className="text-muted-foreground pl-6 pr-4">
                        {format(new Date(income.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="px-4">
                        <p className="font-medium">{income.description || "—"}</p>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1.5 rounded-lg transition-transform hover:scale-110"
                            style={{
                              backgroundColor: (income.category?.color || "#3498DB") + "20",
                            }}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{ color: income.category?.color || "#3498DB" }}
                            />
                          </div>
                          <span className="text-sm">{income.category?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground px-4">
                        {income.source}
                      </TableCell>
                      <TableCell className="text-right font-semibold px-4 pr-6 text-green-600">
                        +₹
                        {income.amount.toLocaleString("en-IN", {
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
          const groups: { monthLabel: string; items: typeof incomes }[] = [];
          incomes.forEach((income) => {
            const ml = format(new Date(income.date), "MMMM yyyy");
            if (ml !== lastMobileMonth) {
              groups.push({ monthLabel: ml, items: [] });
              lastMobileMonth = ml;
            }
            groups[groups.length - 1].items.push(income);
          });

          return groups.map((group) => (
            <Card key={group.monthLabel} className="animate-fade-in-up overflow-hidden gap-2 py-2">
              {/* Month header */}
              <div className="flex items-center justify-between px-4 py-2 bg-accent/30 border-b border-border/40">
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
                  {group.monthLabel}
                </span>
                <span className="text-xs font-semibold text-emerald-500 tabular-nums">
                  ₹{(monthlyTotals[group.monthLabel] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Entries */}
              {group.items.map((income, idx) => {
                const Icon = getCategoryIcon(income.category?.icon || "wallet");
                return (
                  <div
                    key={income.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors ${
                      idx !== group.items.length - 1 ? "border-b border-border/30" : ""
                    }`}
                    onClick={() => setEditIncome(income)}
                  >
                    {/* Category icon */}
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{ backgroundColor: (income.category?.color || "#3498DB") + "20" }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: income.category?.color || "#3498DB" }}
                      />
                    </div>

                    {/* Description + Category + Source */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate leading-tight">
                        {income.description || "—"}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">
                          {income.category?.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80 truncate">
                          Source: {income.source}
                        </span>
                      </div>
                    </div>

                    {/* Amount + Date */}
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-sm text-green-600 tabular-nums">
                        +₹{income.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(income.date), "MMM d")}
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
          path="/incomes"
        />
      )}

      {/* ── Edit / Detail Modal ── */}
      <Dialog open={!!editIncome} onOpenChange={() => setEditIncome(null)}>
        <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-border/80 p-5 sm:p-6">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-xl font-semibold">Edit Income</DialogTitle>
          </DialogHeader>

          {editIncome && (
            <IncomeForm
              categories={categories}
              income={editIncome}
              onSuccess={() => setEditIncome(null)}
              onDelete={() => setDeleteIncome(editIncome)}
              isDeleting={deleteIncomeMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={!!deleteIncome}
        onOpenChange={(open) => {
          if (!open) setDeleteIncome(null);
        }}
      >
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteIncomeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteIncomeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm"
            >
              {deleteIncomeMutation.isPending ? (
                <LoadingSpinner size="sm" text="Deleting…" />
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
