"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, MoreHorizontal, AlertCircle, Tags } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CategoryForm } from "@/components/category-form";
import { getCategoryIcon } from "@/lib/category-icons";

interface CategoryWithCount {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
  icon: string;
  color: string;
  isDefault: boolean;
  _count?: {
    expenses?: number;
    incomes?: number;
  };
}

interface CategoriesListProps {
  categories: CategoryWithCount[];
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const router = useRouter();
  const [editCategory, setEditCategory] = useState<CategoryWithCount | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryWithCount | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteCategory) return;

    try {
      const response = await fetch(`/api/budgets/categories/${deleteCategory.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.message || "Failed to delete category");
        return;
      }

      toast.success("Category deleted");
      setDeleteCategory(null);
      setEditCategory(null);
      setDeleteError(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  }

  if (categories.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center animate-fade-in">
            <Tags className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No categories found</p>
          <p className="text-sm mt-1">Add your first category to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <Card 
              key={category.id} 
              className="relative card-interactive hover-lift animate-fade-in-up overflow-hidden group cursor-pointer"
              style={{ animationDelay: `${index * 25}ms` }}
              onClick={() => setEditCategory(category)}
            >
              {/* Color accent bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-150 group-hover:h-1.5"
                style={{ backgroundColor: category.color }}
              />
              
              <CardContent className="p-3 sm:p-4 sm:pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 sm:p-3 rounded-xl transition-all duration-200 group-hover:scale-110"
                      style={{ backgroundColor: category.color + "20" }}
                    >
                      <Icon
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base leading-tight">{category.name}</h3>
                        {category.isDefault && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 leading-none shrink-0 font-normal">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-tight">
                        {category.type === "EXPENSE" 
                          ? `${category._count?.expenses || 0} expense${(category._count?.expenses || 0) !== 1 ? "s" : ""}`
                          : `${category._count?.incomes || 0} income${(category._count?.incomes || 0) !== 1 ? "s" : ""}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-border/80 p-5 sm:p-6">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-xl font-semibold">Edit Category</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <CategoryForm
              category={editCategory}
              onSuccess={() => {
                setEditCategory(null);
                router.refresh();
              }}
              onDelete={() => setDeleteCategory(editCategory)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={() => {
          setDeleteCategory(null);
          setDeleteError(null);
        }}
      >
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteCategory?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
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
