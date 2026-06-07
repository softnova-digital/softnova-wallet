"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Edit, Trash2, MoreHorizontal, Banknote } from "lucide-react";
import { useSalaryRecords, useDeleteSalaryRecord } from "@/hooks/use-salary-records";

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
import { SalaryRecordForm } from "@/components/salary-record-form";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Employee, SalaryRecord } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface SalaryRecordsListProps {
  employees: Employee[];
}

export function SalaryRecordsList({ employees }: SalaryRecordsListProps) {
  const { data, isLoading, error } = useSalaryRecords();
  const deleteRecord = useDeleteSalaryRecord();
  const [editRecord, setEditRecord] = useState<SalaryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalaryRecord | null>(null);

  const records = data?.salaryRecords || [];

  function handleDelete() {
    if (!deleteTarget) return;
    deleteRecord.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  if (isLoading) return <LoadingCard text="Loading salary records..." />;

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-lg font-medium text-destructive">Failed to load salary records</p>
          <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center">
            <Banknote className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No salary records found</p>
          <p className="text-sm mt-1">Record the first salary payment to get started</p>
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
              <TableHead>Employee</TableHead>
              <TableHead>Salary Period</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow
                key={record.id}
                className="table-row-animate animate-fade-in-up"
                style={{ animationDelay: `${index * 25}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {record.employee?.name?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{record.employee?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.employee?.designation}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {MONTH_NAMES[record.month - 1]} {record.year}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(record.paymentDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                  {record.remarks || <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {record.userName}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{record.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="animate-scale-in">
                      <DropdownMenuItem onClick={() => setEditRecord(record)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(record)}
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
        {records.map((record, index) => (
          <Card
            key={record.id}
            className="animate-fade-in-up hover-lift"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {record.employee?.name?.charAt(0).toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{record.employee?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.employee?.designation}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {MONTH_NAMES[record.month - 1]} {record.year}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Paid {format(new Date(record.paymentDate), "MMM d")}
                      </span>
                    </div>
                    {record.remarks && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {record.remarks}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">
                    ₹{record.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2 mt-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditRecord(record)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteTarget(record)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Salary Record</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <SalaryRecordForm
              employees={employees}
              salaryRecord={editRecord}
              onSuccess={() => setEditRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Salary Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <strong>
                {deleteTarget
                  ? `${MONTH_NAMES[deleteTarget.month - 1]} ${deleteTarget.year}`
                  : ""}{" "}
                salary record
              </strong>{" "}
              for <strong>{deleteTarget?.employee?.name}</strong>? The linked
              expense entry will also be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRecord.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecord.isPending ? (
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
