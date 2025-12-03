"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Edit, Trash2, Receipt, MoreHorizontal, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expense-form";
import { getCategoryIcon } from "@/lib/category-icons";
import type { Category, Label, Expense } from "@/types";

interface ExpensesListProps {
  categories: Category[];
  labels: Label[];
}

export function ExpensesList({ categories, labels }: ExpensesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
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

      const response = await fetch(`/api/expenses?${params.toString()}`);
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  async function handleDelete() {
    if (!deleteExpense) return;

    try {
      const response = await fetch(`/api/expenses/${deleteExpense.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Expense deleted");
      setDeleteExpense(null);
      router.refresh();
      fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete expense");
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-8 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading expenses...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center animate-bounce-in">
            <Receipt className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No expenses found</p>
          <p className="text-sm mt-1">Add your first expense to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <Card className="hidden md:block animate-fade-in-up overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Paid By</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense, index) => {
              const Icon = getCategoryIcon(expense.category?.icon || "folder");
              return (
                <TableRow 
                  key={expense.id} 
                  className="table-row-animate animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="p-1.5 rounded-lg transition-transform hover:scale-110"
                        style={{
                          backgroundColor: (expense.category?.color || "#2ECC71") + "20",
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: expense.category?.color || "#2ECC71" }}
                        />
                      </div>
                      <span className="text-sm">{expense.category?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {expense.payee}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{expense.userName}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(expense.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{expense.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="animate-scale-in">
                        <DropdownMenuItem onClick={() => setEditExpense(expense)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {expense.receiptUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Receipt className="h-4 w-4 mr-2" />
                              View Receipt
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteExpense(expense)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {expenses.map((expense, index) => {
          const Icon = getCategoryIcon(expense.category?.icon || "folder");
          return (
            <Card 
              key={expense.id} 
              className="animate-fade-in-up hover-lift"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{
                        backgroundColor: (expense.category?.color || "#2ECC71") + "20",
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: expense.category?.color || "#2ECC71" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{expense.payee}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>{expense.userName}</span>
                      </div>
                      {expense.labels && expense.labels.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {expense.labels.slice(0, 2).map(({ label }) => (
                            <Badge
                              key={label.id}
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: label.color,
                                color: label.color,
                              }}
                            >
                              {label.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">
                      ₹{expense.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 mt-1">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditExpense(expense)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {expense.receiptUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Receipt className="h-4 w-4 mr-2" />
                              View Receipt
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteExpense(expense)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editExpense} onOpenChange={() => setEditExpense(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editExpense && (
            <ExpenseForm
              categories={categories}
              labels={labels}
              expense={editExpense}
              onSuccess={() => {
                setEditExpense(null);
                fetchExpenses();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteExpense} onOpenChange={() => setDeleteExpense(null)}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be
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
