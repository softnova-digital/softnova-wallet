"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Banknote } from "lucide-react";
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
import { TablePagination } from "@/components/table-pagination";
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
  const pagination = data?.pagination;

  function handleDelete() {
    if (!deleteTarget) return;
    deleteRecord.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setEditRecord(null);
      },
    });
  }

  if (isLoading) return <LoadingCard text="Loading salary records..." />;

  if (error) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium text-destructive">Failed to load salary records</p>
          <p className="text-sm mt-1">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  if (pagination ? pagination.total === 0 : records.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center animate-fade-in">
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
      {/* ── Desktop Table ── */}
      <Card className="hidden md:block animate-fade-in-up overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 pr-4">Employee</TableHead>
              <TableHead className="px-4">Salary Period</TableHead>
              <TableHead className="px-4">Payment Date</TableHead>
              <TableHead className="px-4">Remarks</TableHead>
              <TableHead className="text-right px-4 pr-6">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow
                key={record.id}
                className="table-row-animate animate-fade-in-up cursor-pointer hover:bg-accent/40 transition-colors"
                style={{ animationDelay: `${index * 25}ms` }}
                onClick={() => setEditRecord(record)}
              >
                <TableCell className="pl-6 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {record.employee?.name?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{record.employee?.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {record.employee?.designation}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <Badge variant="secondary">
                    {MONTH_NAMES[record.month - 1]} {record.year}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground px-4">
                  {format(new Date(record.paymentDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate px-4">
                  {record.remarks || <span className="text-muted-foreground/30">—</span>}
                </TableCell>
                <TableCell className="text-right font-semibold px-4 pr-6">
                  ₹{record.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* ── Mobile List View ── */}
      <div className="md:hidden space-y-4">
        <Card className="animate-fade-in-up overflow-hidden gap-2 py-2">
          {records.map((record, idx) => (
            <div
              key={record.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors ${
                idx !== records.length - 1 ? "border-b border-border/30" : ""
              }`}
              onClick={() => setEditRecord(record)}
            >
              {/* Avatar Initial */}
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {record.employee?.name?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>

              {/* Employee + Designation + Remarks */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate leading-tight">
                  {record.employee?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {record.employee?.designation}
                </p>
                {record.remarks && (
                  <p className="text-[10px] text-muted-foreground/80 mt-1 truncate">
                    {record.remarks}
                  </p>
                )}
              </div>

              {/* Amount + Date + Period */}
              <div className="shrink-0 text-right">
                <p className="font-semibold text-sm tabular-nums">
                  ₹{record.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(record.paymentDate), "MMM d")}
                </p>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                  {MONTH_NAMES[record.month - 1].substring(0, 3)} {record.year}
                </Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* ── Pagination ── */}
      {pagination && (
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          path="/salary"
        />
      )}

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
        <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-border/80 p-5 sm:p-6">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-xl font-semibold">Edit Salary Record</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <SalaryRecordForm
              employees={employees}
              salaryRecord={editRecord}
              onSuccess={() => setEditRecord(null)}
              onDelete={() => setDeleteTarget(editRecord)}
              isDeleting={deleteRecord.isPending}
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
            <AlertDialogCancel disabled={deleteRecord.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm"
            >
              {deleteRecord.isPending ? (
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
