"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/use-employees";

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
import type { Employee } from "@/types";

const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  designation: z.string().min(1, "Designation is required"),
  isActive: z.boolean(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function EmployeeForm({
  employee,
  onSuccess,
  onDelete,
  isDeleting,
}: EmployeeFormProps) {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || "",
      phone: employee?.phone || "",
      email: employee?.email || "",
      designation: employee?.designation || "",
      isActive: employee?.isActive ?? true,
    },
  });

  async function onSubmit(data: EmployeeFormValues) {
    try {
      if (employee) {
        await updateEmployee.mutateAsync({
          id: employee.id,
          name: data.name,
          phone: data.phone || undefined,
          email: data.email || undefined,
          designation: data.designation,
          isActive: data.isActive,
        });
      } else {
        await createEmployee.mutateAsync({
          name: data.name,
          phone: data.phone || undefined,
          email: data.email || undefined,
          designation: data.designation,
          isActive: data.isActive,
        });
      }
      onSuccess?.();
    } catch {
      // Error handled by mutation onError
    }
  }

  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="employee@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === "true")}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  Delete Employee
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
            ) : employee ? (
              "Update Employee"
            ) : (
              "Add Employee"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
