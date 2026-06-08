"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { LabelForm } from "@/components/label-form";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelsListProps {
  labels: Label[];
}

export function LabelsList({ labels }: LabelsListProps) {
  const router = useRouter();
  const [editLabel, setEditLabel] = useState<Label | null>(null);
  const [deleteLabel, setDeleteLabel] = useState<Label | null>(null);

  async function handleDelete() {
    if (!deleteLabel) return;

    try {
      const response = await fetch(`/api/labels/${deleteLabel.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Label deleted");
      setDeleteLabel(null);
      setEditLabel(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete label");
    }
  }

  if (labels.length === 0) {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center animate-fade-in">
            <Tag className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No labels created yet</p>
          <p className="text-sm mt-1">Labels help you organize and filter expenses</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {labels.map((label, index) => (
          <Card
            key={label.id}
            className="relative card-interactive hover-lift animate-fade-in-up overflow-hidden group cursor-pointer"
            style={{ animationDelay: `${index * 25}ms` }}
            onClick={() => setEditLabel(label)}
          >
            {/* Color accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1 transition-all duration-150 group-hover:h-1.5"
              style={{ backgroundColor: label.color }}
            />
            
            <CardContent className="p-3 sm:p-4 sm:pt-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 sm:p-3 rounded-full transition-all duration-200 group-hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: label.color + "20" }}
                  >
                    <div
                      className="h-4 w-4 sm:h-5 sm:w-5 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">
                      {label.name}
                    </h3>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editLabel} onOpenChange={() => setEditLabel(null)}>
        <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-border/80 p-5 sm:p-6">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-xl font-semibold">Edit Label</DialogTitle>
          </DialogHeader>
          {editLabel && (
            <LabelForm
              label={editLabel}
              onSuccess={() => {
                setEditLabel(null);
                router.refresh();
              }}
              onDelete={() => setDeleteLabel(editLabel)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteLabel}
        onOpenChange={() => setDeleteLabel(null)}
      >
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Label</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteLabel?.name}&quot;? This will
              remove the label from all expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

