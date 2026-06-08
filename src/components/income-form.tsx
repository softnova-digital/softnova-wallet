"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import { useCreateIncome, useUpdateIncome } from "@/hooks/use-incomes";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import type { Category, Income } from "@/types";

const incomeSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  date: z.date({ message: "Date is required" }),
  source: z.string().min(1, "Source is required"),
  categoryId: z.string().min(1, "Category is required"),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  categories: Category[];
  income?: Income;
  onSuccess?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function IncomeForm({
  categories,
  income,
  onSuccess,
  onDelete,
  isDeleting,
}: IncomeFormProps) {
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: income?.amount?.toString() || "",
      description: income?.description || "",
      date: income?.date ? new Date(income.date) : new Date(),
      source: income?.source || "",
      categoryId: income?.categoryId || "",
    },
  });

  const isSubmitting = createIncome.isPending || updateIncome.isPending;

  async function onSubmit(data: IncomeFormValues) {
    const incomeData = {
      ...data,
      amount: parseFloat(data.amount),
      date: data.date.toISOString(),
      description: data.description?.trim() || undefined,
    };

    try {
      if (income) {
        await updateIncome.mutateAsync({ ...incomeData, id: income.id });
      } else {
        await createIncome.mutateAsync(incomeData);
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Row 1: Amount + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description — single-line input */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="What was this income for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Source */}
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input placeholder="Client name, company, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category.icon);
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: category.color }} />
                          {category.name}
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

        {/* ── Footer buttons ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 pt-2 border-t border-border/40 mt-1">
          {/* Delete — only shown when editing */}
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              className="flex-1 w-full rounded-sm"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" text="Deleting…" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Income
                </>
              )}
            </Button>
          )}

          {/* Update / Add */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 w-full bg-primary rounded-sm hover:bg-primary/90"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Saving…" />
            ) : income ? (
              "Update Income"
            ) : (
              "Add Income"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
