"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

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
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete label");
    }
  }

  if (labels.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No labels created yet</p>
        <p className="text-sm">Labels help you organize and filter expenses</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {labels.map((label) => (
          <div
            key={label.id}
            className="flex items-center gap-2 p-2 rounded-lg border bg-accent/50"
          >
            <Badge
              style={{
                backgroundColor: label.color + "20",
                color: label.color,
                borderColor: label.color,
              }}
              variant="outline"
            >
              {label.name}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setEditLabel(label)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => setDeleteLabel(label)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editLabel} onOpenChange={() => setEditLabel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
          </DialogHeader>
          {editLabel && (
            <LabelForm
              label={editLabel}
              onSuccess={() => {
                setEditLabel(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteLabel}
        onOpenChange={() => setDeleteLabel(null)}
      >
        <AlertDialogContent>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

