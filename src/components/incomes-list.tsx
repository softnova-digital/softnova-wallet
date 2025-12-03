"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Edit, Trash2, Wallet, MoreHorizontal, ChevronRight } from "lucide-react";
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
import { IncomeForm } from "@/components/income-form";
import { getCategoryIcon } from "@/lib/category-icons";
import type { IncomeCategory, Income } from "@/types";

interface IncomesListProps {
  categories: IncomeCategory[];
}

export function IncomesList({ categories }: IncomesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [deleteIncome, setDeleteIncome] = useState<Income | null>(null);

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const categoryId = searchParams.get("categoryId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const search = searchParams.get("search");

      if (categoryId && categoryId !== "all") params.set("categoryId", categoryId);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (search) params.set("search", search);

      const response = await fetch(`/api/incomes?${params.toString()}`);
      const data = await response.json();
      setIncomes(data.incomes || []);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      toast.error("Failed to load incomes");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  async function handleDelete() {
    if (!deleteIncome) return;

    try {
      const response = await fetch(`/api/incomes/${deleteIncome.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Income deleted");
      setDeleteIncome(null);
      router.refresh();
      fetchIncomes();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete income");
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-8 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading incomes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (incomes.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center animate-bounce-in">
            <Wallet className="h-8 w-8 text-blue-500/50" />
          </div>
          <p className="text-lg font-medium">No incomes found</p>
          <p className="text-sm mt-1">Add your first income to get started</p>
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
              <TableHead>Source</TableHead>
              <TableHead>Received By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income, index) => {
              const Icon = getCategoryIcon(income.category?.icon || "wallet");
              return (
                <TableRow 
                  key={income.id} 
                  className="table-row-animate animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <p className="font-medium">{income.description}</p>
                  </TableCell>
                  <TableCell>
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
                  <TableCell className="text-muted-foreground">
                    {income.source}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{income.userName}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(income.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    +₹{income.amount.toLocaleString("en-IN", {
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
                        <DropdownMenuItem onClick={() => setEditIncome(income)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteIncome(income)}
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
        {incomes.map((income, index) => {
          const Icon = getCategoryIcon(income.category?.icon || "wallet");
          return (
            <Card 
              key={income.id} 
              className="animate-fade-in-up hover-lift"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{
                        backgroundColor: (income.category?.color || "#3498DB") + "20",
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: income.category?.color || "#3498DB" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{income.description}</p>
                      <p className="text-sm text-muted-foreground">{income.source}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(income.date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>{income.userName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-green-600">
                      +₹{income.amount.toLocaleString("en-IN", {
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
                        <DropdownMenuItem onClick={() => setEditIncome(income)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteIncome(income)}
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
      <Dialog open={!!editIncome} onOpenChange={() => setEditIncome(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          {editIncome && (
            <IncomeForm
              categories={categories}
              income={editIncome}
              onSuccess={() => {
                setEditIncome(null);
                fetchIncomes();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteIncome} onOpenChange={() => setDeleteIncome(null)}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income? This action cannot be
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

