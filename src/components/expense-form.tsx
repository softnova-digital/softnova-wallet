"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-expenses";

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
import { PARTNERS } from "@/lib/constants";
import { toast } from "sonner";

const expenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(), // Description is now optional
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
}

export function ExpenseForm({
  categories,
  labels,
  expense,
  onSuccess,
}: ExpenseFormProps) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  // For existing receipts when editing
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | undefined>(
    expense?.receiptUrl || undefined
  );
  const [existingReceiptPublicId, setExistingReceiptPublicId] = useState<string | undefined>(
    expense?.receiptPublicId || undefined
  );

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount?.toString() || "",
      description: expense?.description || undefined, // Handle null/undefined from database
      date: expense?.date ? new Date(expense.date) : new Date(),
      payee: (expense?.payee as ExpenseFormValues["payee"]) || PARTNERS[0],
      categoryId: expense?.categoryId || "",
      labelIds: expense?.labels?.map((l) => l.label.id) || [],
      receiptUrl: expense?.receiptUrl || undefined,
      receiptPublicId: expense?.receiptPublicId || undefined,
    },
  });

  const selectedLabels = form.watch("labelIds");

  async function onSubmit(data: ExpenseFormValues) {
    let receiptUrl = existingReceiptUrl;
    let receiptPublicId = existingReceiptPublicId;

    // Upload new file to Cloudinary if a file was selected
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
        return; // Prevent form submission if upload fails
      } finally {
        setIsUploadingReceipt(false);
      }
    } else if (!existingReceiptUrl) {
      // If no file selected and no existing receipt, clear receipt fields
      receiptUrl = undefined;
      receiptPublicId = undefined;
    }

    const expenseData = {
      ...data,
      amount: parseFloat(data.amount),
      date: data.date.toISOString(),
      description: data.description?.trim() || undefined, // Convert empty strings to undefined
      receiptUrl,
      receiptPublicId,
    };

    if (expense) {
      updateExpense.mutate(
        { ...expenseData, id: expense.id },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      createExpense.mutate(expenseData, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
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
              <FormLabel>Paid By</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who paid for this expense" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PARTNERS.map((partner) => (
                    <SelectItem key={partner} value={partner}>
                      {partner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                className="cursor-pointer min-h-[36px] px-3 py-1.5 text-sm touch-manipulation"
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
          {selectedFile ? (
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="flex-1 truncate text-sm">
                <span className="text-muted-foreground">Selected: </span>
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-muted-foreground text-xs ml-2">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : existingReceiptUrl ? (
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="flex-1 truncate text-sm">
                <a
                  href={existingReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Current Receipt
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExistingReceiptUrl(undefined);
                  setExistingReceiptPublicId(undefined);
                  // Allow user to select a new file after removing existing one
                }}
                title="Remove receipt"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <UploadButton onFileSelect={(file) => setSelectedFile(file)} />
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={createExpense.isPending || updateExpense.isPending || isUploadingReceipt}
            className="w-full sm:w-auto min-h-[44px]"
          >
            {isUploadingReceipt
              ? "Uploading Receipt..."
              : createExpense.isPending || updateExpense.isPending
              ? "Saving..."
              : expense
              ? "Update Expense"
              : "Add Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

