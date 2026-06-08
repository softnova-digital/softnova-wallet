"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import {
  useCreateSalaryRecord,
  useUpdateSalaryRecord,
} from "@/hooks/use-salary-records";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SwipeToSubmit } from "@/components/ui/swipe-to-submit";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import type { Employee, SalaryRecord } from "@/types";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

const salaryRecordSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  amount: z.string().min(1, "Amount is required"),
  paymentDate: z.date({ message: "Payment date is required" }),
  remarks: z.string().optional(),
});

type SalaryRecordFormValues = z.infer<typeof salaryRecordSchema>;

interface SalaryRecordFormProps {
  employees: Employee[];
  salaryRecord?: SalaryRecord;
  defaultEmployeeId?: string;
  onSuccess?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function SalaryRecordForm({
  employees,
  salaryRecord,
  defaultEmployeeId,
  onSuccess,
  onDelete,
  isDeleting,
}: SalaryRecordFormProps) {
  const createSalaryRecord = useCreateSalaryRecord();
  const updateSalaryRecord = useUpdateSalaryRecord();

  const now = new Date();

  const form = useForm<SalaryRecordFormValues>({
    resolver: zodResolver(salaryRecordSchema),
    defaultValues: {
      employeeId: salaryRecord?.employeeId || defaultEmployeeId || "",
      month: salaryRecord?.month || now.getMonth() + 1,
      year: salaryRecord?.year || now.getFullYear(),
      amount: salaryRecord?.amount?.toString() || "",
      paymentDate: salaryRecord?.paymentDate
        ? new Date(salaryRecord.paymentDate)
        : now,
      remarks: salaryRecord?.remarks || "",
    },
  });

  const isEditing = !!salaryRecord;

  async function onSubmit(data: SalaryRecordFormValues) {
    try {
      if (isEditing) {
        await updateSalaryRecord.mutateAsync({
          id: salaryRecord.id,
          amount: parseFloat(data.amount),
          paymentDate: data.paymentDate.toISOString(),
          remarks: data.remarks || null,
        });
      } else {
        await createSalaryRecord.mutateAsync({
          employeeId: data.employeeId,
          month: data.month,
          year: data.year,
          amount: parseFloat(data.amount),
          paymentDate: data.paymentDate.toISOString(),
          remarks: data.remarks || undefined,
        });
      }
      onSuccess?.();
    } catch {
      // Error handled by mutation onError
    }
  }

  const isSubmitting = createSalaryRecord.isPending || updateSalaryRecord.isPending;
  const activeEmployees = employees.filter(
    (e) => e.isActive || e.id === salaryRecord?.employeeId,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Employee — locked in edit mode */}
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isEditing}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                  {activeEmployees.length === 0 && (
                    <SelectItem value="_" disabled>
                      No active employees
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Month + Year — locked in edit mode */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Month</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v))}
                  defaultValue={String(field.value)}
                  disabled={isEditing}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
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
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v))}
                  defaultValue={String(field.value)}
                  disabled={isEditing}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
          <p className="text-xs text-muted-foreground -mt-3">
            Employee, month, and year cannot be changed. Delete and recreate to change these.
          </p>
        )}

        {/* Amount + Payment Date */}
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
                    min="0"
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
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 pl-3 text-left font-normal",
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
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Remarks — single-line input matching Description */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Any notes about this salary payment..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Footer ── */}
        <div className="flex flex-col gap-3 pt-2 border-t border-border/40 mt-1">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              className="w-full rounded-sm"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" text="Deleting…" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Record
                </>
              )}
            </Button>
          )}
          <SwipeToSubmit
            onSubmit={() => form.handleSubmit(onSubmit)()}
            isLoading={isSubmitting}
            label={salaryRecord ? "Swipe to edit record" : "Swipe to record salary"}
            disabled={isDeleting}
          />
        </div>
      </form>
    </Form>
  );
}
