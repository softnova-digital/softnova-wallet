"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useCreateIncome, useUpdateIncome } from "@/hooks/use-incomes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { IncomeCategory, Income } from "@/types";

const incomeSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date({ message: "Date is required" }),
  source: z.string().min(1, "Source is required"),
  categoryId: z.string().min(1, "Category is required"),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  categories: IncomeCategory[];
  income?: Income;
  onSuccess?: () => void;
}

export function IncomeForm({ categories, income, onSuccess }: IncomeFormProps) {
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

  async function onSubmit(data: IncomeFormValues) {
    const incomeData = {
      ...data,
      amount: parseFloat(data.amount),
      date: data.date.toISOString(),
    };

    if (income) {
      updateIncome.mutate(
        { ...incomeData, id: income.id },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      createIncome.mutate(incomeData, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-7"
                      {...field}
                    />
                  </div>
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
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the income..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input placeholder="Client name, employer, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category.icon);
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <Icon
                              className="h-4 w-4"
                              style={{ color: category.color }}
                            />
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
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={createIncome.isPending || updateIncome.isPending} 
            className="btn-press w-full sm:w-auto min-h-[44px]"
          >
            {createIncome.isPending || updateIncome.isPending
              ? "Saving..."
              : income
              ? "Update Income"
              : "Add Income"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

