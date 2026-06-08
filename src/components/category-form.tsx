"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategoryIcon, availableIcons } from "@/lib/category-icons";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["EXPENSE", "INCOME"]),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    type: "EXPENSE" | "INCOME";
    icon: string;
    color: string;
    isDefault?: boolean;
  };
  defaultType?: "EXPENSE" | "INCOME";
  onSuccess?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const colorOptions = [
  { name: "Emerald", value: "#2ECC71" },
  { name: "Blue", value: "#3498DB" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Red", value: "#E74C3C" },
  { name: "Orange", value: "#F39C12" },
  { name: "Teal", value: "#1ABC9C" },
  { name: "Dark Blue", value: "#34495E" },
  { name: "Gray", value: "#95A5A6" },
  { name: "Pink", value: "#E91E63" },
  { name: "Indigo", value: "#3F51B5" },
];

export function CategoryForm({
  category,
  defaultType = "EXPENSE",
  onSuccess,
  onDelete,
  isDeleting,
}: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || defaultType,
      icon: category?.icon || (defaultType === "INCOME" ? "wallet" : "folder"),
      color: category?.color || (defaultType === "INCOME" ? "#3498DB" : "#2ECC71"),
    },
  });

  async function onSubmit(data: CategoryFormValues) {
    setIsLoading(true);
    try {
      const url = category
        ? `/api/budgets/categories/${category.id}`
        : "/api/budgets/categories";
      const method = category ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || "Failed to save category";
        throw new Error(errorMessage);
      }

      toast.success(category ? "Category updated" : "Category created");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Category save error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedColor = form.watch("color");
  const selectedIcon = form.watch("icon");
  const SelectedIconComponent = getCategoryIcon(selectedIcon);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!category}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
              {category && (
                <p className="text-xs text-muted-foreground -mt-3">
                  Category type cannot be changed after creation
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableIcons.map((iconName) => {
                    const IconComponent = getCategoryIcon(iconName);
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="capitalize">
                            {iconName.replace("-", " ")}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preview */}
        <div className="p-4 bg-accent/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: selectedColor + "20" }}
            >
              <SelectedIconComponent
                className="h-5 w-5"
                style={{ color: selectedColor }}
              />
            </div>
            <span className="font-medium">
              {form.watch("name") || "Category Name"}
            </span>
          </div>
        </div>

        {/* ── Footer buttons ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 pt-2 border-t border-border/40 mt-1">
          {/* Delete — only shown when editing and not a default category */}
          {onDelete && !category?.isDefault && (
            <Button
              type="button"
              variant="destructive"
              className="flex-1 w-full rounded-sm"
              onClick={onDelete}
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" text="Deleting…" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Category
                </>
              )}
            </Button>
          )}

          {/* Update / Add */}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 w-full bg-primary rounded-sm hover:bg-primary/90"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" text="Saving…" />
            ) : category ? (
              "Update Category"
            ) : (
              "Add Category"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
