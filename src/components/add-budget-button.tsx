"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BudgetForm } from "@/components/budget-form";
import type { Category } from "@/types";

interface AddBudgetButtonProps {
  categories: Category[];
}

export function AddBudgetButton({ categories }: AddBudgetButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-press shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Budget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-border/80 p-5 sm:p-6">
        <DialogHeader className="mb-1">
          <DialogTitle className="text-xl font-semibold">New Budget</DialogTitle>
        </DialogHeader>
        <BudgetForm categories={categories} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
