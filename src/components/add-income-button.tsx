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
import { IncomeForm } from "@/components/income-form";
import type { Category } from "@/types";

interface AddIncomeButtonProps {
  categories: Category[]; // Now uses unified Category type
}

export function AddIncomeButton({ categories }: AddIncomeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-press shrink-0 min-h-[44px]">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Income</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Add New Income</DialogTitle>
        </DialogHeader>
        <IncomeForm
          categories={categories}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

