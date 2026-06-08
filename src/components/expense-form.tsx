"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Upload, X } from "lucide-react";
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-expenses";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";
import type { Category, Label, Expense } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";
import { UploadButton } from "@/components/upload-button";
import { PARTNERS } from "@/lib/constants";
import { toast } from "sonner";

const expenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  date: z.date({ message: "Date is required" }),
  payee: z.enum(PARTNERS, {
    message: "Please select who paid for this expense",
  }),
  categoryId: z.string().min(1, "Category is required"),
  labelIds: z.array(z.string()),
  receiptUrl: z.string().optional(),
  receiptPublicId: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  categories: Category[];
  labels: Label[];
  expense?: Expense;
  onSuccess?: () => void;
  /** Called when the Delete button is clicked — triggers the confirmation dialog */
  onDelete?: () => void;
  /** Pass true while the delete mutation is in-flight */
  isDeleting?: boolean;
}

export function ExpenseForm({
  categories,
  labels,
  expense,
  onSuccess,
  onDelete,
  isDeleting,
}: ExpenseFormProps) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | undefined>(
    expense?.receiptUrl || undefined,
  );
  const [existingReceiptPublicId, setExistingReceiptPublicId] = useState<string | undefined>(
    expense?.receiptPublicId || undefined,
  );

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount?.toString() || "",
      description: expense?.description || undefined,
      date: expense?.date ? new Date(expense.date) : new Date(),
      payee: (expense?.payee as ExpenseFormValues["payee"]) || PARTNERS[0],
      categoryId: expense?.categoryId || "",
      labelIds: expense?.labels?.map((l) => l.label.id) || [],
      receiptUrl: expense?.receiptUrl || undefined,
      receiptPublicId: expense?.receiptPublicId || undefined,
    },
  });

  const selectedLabelIds = form.watch("labelIds");
  const isSubmitting = createExpense.isPending || updateExpense.isPending || isUploadingReceipt;

  async function onSubmit(data: ExpenseFormValues) {
    let receiptUrl = existingReceiptUrl;
    let receiptPublicId = existingReceiptPublicId;

    if (selectedFile) {
      setIsUploadingReceipt(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(errorData.error || "Upload failed");
        }

        const uploadData = await response.json();
        receiptUrl = uploadData.url;
        receiptPublicId = uploadData.publicId;
        toast.success("Receipt uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to upload receipt");
        setIsUploadingReceipt(false);
        return;
      } finally {
        setIsUploadingReceipt(false);
      }
    } else if (!existingReceiptUrl) {
      receiptUrl = undefined;
      receiptPublicId = undefined;
    }

    const expenseData = {
      ...data,
      amount: parseFloat(data.amount),
      date: data.date.toISOString(),
      description: data.description?.trim() || undefined,
      receiptUrl,
      receiptPublicId,
    };

    try {
      if (expense) {
        await updateExpense.mutateAsync({ ...expenseData, id: expense.id });
      } else {
        await createExpense.mutateAsync(expenseData);
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
                          !field.value && "text-muted-foreground",
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
                <Input placeholder="What was this expense for?" {...field} />
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

        {/* Labels — dropdown multiselect mirroring Category style */}
        <FormField
          control={form.control}
          name="labelIds"
          render={() => (
            <FormItem>
              <FormLabel>Labels</FormLabel>
              <Select
                onValueChange={(val) => {
                  const current = form.getValues("labelIds");
                  if (current.includes(val)) {
                    form.setValue("labelIds", current.filter((id) => id !== val));
                  } else {
                    form.setValue("labelIds", [...current, val]);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        selectedLabelIds.length === 0
                          ? "Select labels…"
                          : `${selectedLabelIds.length} label${selectedLabelIds.length > 1 ? "s" : ""} selected`
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {labels.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-3 py-2">
                      No labels — create some in Settings.
                    </p>
                  ) : (
                    labels.map((label) => {
                      const checked = selectedLabelIds.includes(label.id);
                      return (
                        <SelectItem key={label.id} value={label.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0 border",
                                checked ? "opacity-100" : "opacity-40",
                              )}
                              style={{ backgroundColor: label.color, borderColor: label.color }}
                            />
                            <span className={checked ? "font-medium" : ""}>{label.name}</span>
                            {checked && (
                              <span className="ml-auto text-xs text-muted-foreground">✓</span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Receipt */}
        <div className="space-y-2">
          <FormLabel>Receipt</FormLabel>
          {selectedFile ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-accent/30">
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0 text-sm">
                <span className="font-medium truncate block">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-sm shrink-0"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : existingReceiptUrl ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-accent/30">
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={existingReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-primary hover:underline truncate"
              >
                View Current Receipt
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => {
                  setExistingReceiptUrl(undefined);
                  setExistingReceiptPublicId(undefined);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <UploadButton onFileSelect={(file) => setSelectedFile(file)} />
          )}
        </div>

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
                  Delete Expense
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
              <LoadingSpinner
                size="sm"
                text={isUploadingReceipt ? "Uploading…" : "Saving…"}
              />
            ) : expense ? (
              "Update Expense"
            ) : (
              "Add Expense"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
