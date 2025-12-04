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
import { CategoryForm } from "@/components/category-form";

interface AddCategoryButtonProps {
  defaultType?: "EXPENSE" | "INCOME";
}

export function AddCategoryButton({ defaultType = "EXPENSE" }: AddCategoryButtonProps = {}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-press shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add New {defaultType === "INCOME" ? "Income" : "Expense"} Category
          </DialogTitle>
        </DialogHeader>
        <CategoryForm defaultType={defaultType} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
