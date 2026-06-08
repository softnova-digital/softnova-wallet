"use client";

import React, { useState } from "react";
import { Users, UserCheck, UserX, Phone, Mail } from "lucide-react";
import { useEmployees, useDeleteEmployee } from "@/hooks/use-employees";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeForm } from "@/components/employee-form";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Employee } from "@/types";

export function EmployeesList() {
  const { data, isLoading, error } = useEmployees();
  const deleteEmployee = useDeleteEmployee();
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const employees = data?.employees || [];

  function handleDelete() {
    if (!deleteTarget) return;
    deleteEmployee.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setEditEmployee(null);
      },
    });
  }

  if (isLoading) return <LoadingCard text="Loading employees..." />;

  if (error) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium text-destructive">Failed to load employees</p>
          <p className="text-sm mt-1">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center animate-fade-in">
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No employees found</p>
          <p className="text-sm mt-1">Add your first employee to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* ── Desktop Table ── */}
      <Card className="hidden md:block animate-fade-in-up overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 pr-4">Name</TableHead>
              <TableHead className="px-4">Phone</TableHead>
              <TableHead className="px-4">Email</TableHead>
              <TableHead className="text-right px-4 pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => (
              <TableRow
                key={employee.id}
                className="table-row-animate animate-fade-in-up cursor-pointer hover:bg-accent/40 transition-colors"
                style={{ animationDelay: `${index * 25}ms` }}
                onClick={() => setEditEmployee(employee)}
              >
                <TableCell className="pl-6 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{employee.designation}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  {employee.phone ? (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="font-medium text-sm">{employee.phone}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4">
                  {employee.email ? (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="text-sm text-muted-foreground">{employee.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right px-4 pr-6">
                  <div className="inline-flex justify-end">
                    <Badge
                      variant={employee.isActive ? "default" : "outline"}
                      className={
                        employee.isActive
                          ? "bg-green-500/15 text-green-700 border-green-500/30"
                          : "text-muted-foreground"
                      }
                    >
                      {employee.isActive ? (
                        <><UserCheck className="h-3 w-3 mr-1" />Active</>
                      ) : (
                        <><UserX className="h-3 w-3 mr-1" />Inactive</>
                      )}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* ── Mobile List View ── */}
      <div className="md:hidden space-y-4">
        <Card className="animate-fade-in-up overflow-hidden gap-2 py-2">
          {employees.map((employee, idx) => (
            <div
              key={employee.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors ${
                idx !== employees.length - 1 ? "border-b border-border/30" : ""
              }`}
              onClick={() => setEditEmployee(employee)}
            >
              {/* Avatar Initial */}
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name + Designation */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate leading-tight">
                  {employee.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {employee.designation}
                </p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 text-right">
                <Badge
                  variant={employee.isActive ? "default" : "outline"}
                  className={
                    employee.isActive
                      ? "bg-green-500/15 text-green-700 border-green-500/30 text-[10px] px-2 py-0.5"
                      : "text-muted-foreground text-[10px] px-2 py-0.5"
                  }
                >
                  {employee.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editEmployee} onOpenChange={() => setEditEmployee(null)}>
        <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-border/80 p-5 sm:p-6">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-xl font-semibold">Edit Employee</DialogTitle>
          </DialogHeader>
          {editEmployee && (
            <EmployeeForm
              employee={editEmployee}
              onSuccess={() => setEditEmployee(null)}
              onDelete={() => setDeleteTarget(editEmployee)}
              isDeleting={deleteEmployee.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              This will also delete all their salary records and linked expense entries.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEmployee.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteEmployee.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm"
            >
              {deleteEmployee.isPending ? (
                <LoadingSpinner size="sm" text="Deleting…" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
