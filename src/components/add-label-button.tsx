"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LabelForm } from "@/components/label-form";

export function AddLabelButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Label
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-border/80 p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>New Label</DialogTitle>
        </DialogHeader>
        <LabelForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

