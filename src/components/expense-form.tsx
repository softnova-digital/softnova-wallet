"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Category, Label, Expense } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";
import { UploadButton } from "@/components/upload-button";

const expenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date({ message: "Date is required" }),
  payee: z.string().min(1, "Payee is required"),
  categoryId: z.string().min(1, "Category is required"),
  labelIds: z.array(z.string()),
  receiptUrl: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  categories: Category[];
  labels: Label[];
  expense?: Expense;
  onSuccess?: () => void;
}

export function ExpenseForm({
  categories,
  labels,
  expense,
  onSuccess,
}: ExpenseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(
    expense?.receiptUrl || undefined
  );

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount?.toString() || "",
      description: expense?.description || "",
      date: expense?.date ? new Date(expense.date) : new Date(),
      payee: expense?.payee || "",
      categoryId: expense?.categoryId || "",
      labelIds: expense?.labels?.map((l) => l.label.id) || [],
      receiptUrl: expense?.receiptUrl || undefined,
    },
  });

  const selectedLabels = form.watch("labelIds");

  async function onSubmit(data: ExpenseFormValues) {
    setIsLoading(true);
    try {
      const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
      const method = expense ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          date: data.date.toISOString(),
          receiptUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save expense");
      }

      toast.success(expense ? "Expense updated" : "Expense created");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const toggleLabel = (labelId: string) => {
    const current = form.getValues("labelIds");
    if (current.includes(labelId)) {
      form.setValue(
        "labelIds",
        current.filter((id) => id !== labelId)
      );
    } else {
      form.setValue("labelIds", [...current, labelId]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
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
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What was this expense for?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee / Payer</FormLabel>
              <FormControl>
                <Input placeholder="Who received the payment?" {...field} />
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
                    <SelectValue placeholder="Select a category" />
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

        <div className="space-y-2">
          <FormLabel>Labels</FormLabel>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <Badge
                key={label.id}
                variant={selectedLabels.includes(label.id) ? "default" : "outline"}
                className="cursor-pointer"
                style={
                  selectedLabels.includes(label.id)
                    ? { backgroundColor: label.color }
                    : { borderColor: label.color, color: label.color }
                }
                onClick={() => toggleLabel(label.id)}
              >
                {label.name}
              </Badge>
            ))}
            {labels.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No labels available. Create labels in Settings.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel>Receipt</FormLabel>
          {receiptUrl ? (
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="flex-1 truncate text-sm">{receiptUrl}</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReceiptUrl(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <UploadButton onUploadComplete={(url) => setReceiptUrl(url)} />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : expense ? "Update Expense" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

