"use client";

import { useState } from "react";
import { Edit, Trash2, MoreHorizontal, Users, UserCheck, UserX } from "lucide-react";
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
      onSuccess: () => setDeleteTarget(null),
    });
  }

  if (isLoading) return <LoadingCard text="Loading employees..." />;

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-lg font-medium text-destructive">Failed to load employees</p>
          <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center">
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
      {/* Desktop Table */}
      <Card className="hidden md:block animate-fade-in-up overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Salary Records</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => (
              <TableRow
                key={employee.id}
                className="table-row-animate animate-fade-in-up"
                style={{ animationDelay: `${index * 25}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{employee.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.designation}
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-0.5">
                    {employee.email && (
                      <p className="text-muted-foreground">{employee.email}</p>
                    )}
                    {employee.phone && (
                      <p className="text-muted-foreground">{employee.phone}</p>
                    )}
                    {!employee.email && !employee.phone && (
                      <span className="text-muted-foreground/50 text-xs">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {employee._count?.salaryRecords ?? 0} records
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="animate-scale-in">
                      <DropdownMenuItem onClick={() => setEditEmployee(employee)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(employee)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {employees.map((employee, index) => (
          <Card
            key={employee.id}
            className="animate-fade-in-up hover-lift"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{employee.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {employee.designation}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        variant={employee.isActive ? "default" : "outline"}
                        className={
                          employee.isActive
                            ? "bg-green-500/15 text-green-700 border-green-500/30 text-xs"
                            : "text-muted-foreground text-xs"
                        }
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {employee._count?.salaryRecords ?? 0} salary records
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditEmployee(employee)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteTarget(employee)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editEmployee} onOpenChange={() => setEditEmployee(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editEmployee && (
            <EmployeeForm
              employee={editEmployee}
              onSuccess={() => setEditEmployee(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployee.isPending ? (
                <LoadingSpinner size="sm" text="Deleting..." />
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
