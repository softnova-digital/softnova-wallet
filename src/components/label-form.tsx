"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

const labelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
});

type LabelFormValues = z.infer<typeof labelSchema>;

interface LabelFormProps {
  label?: {
    id: string;
    name: string;
    color: string;
  };
  onSuccess?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const colorOptions = [
  { name: "Emerald", value: "#2ECC71" },
  { name: "Blue", value: "#3498DB" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Red", value: "#E74C3C" },
  { name: "Orange", value: "#F39C12" },
  { name: "Teal", value: "#1ABC9C" },
  { name: "Pink", value: "#E91E63" },
  { name: "Indigo", value: "#3F51B5" },
  { name: "Cyan", value: "#00BCD4" },
  { name: "Amber", value: "#FFC107" },
];

export function LabelForm({
  label,
  onSuccess,
  onDelete,
  isDeleting,
}: LabelFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LabelFormValues>({
    resolver: zodResolver(labelSchema),
    defaultValues: {
      name: label?.name || "",
      color: label?.color || "#2ECC71",
    },
  });

  async function onSubmit(data: LabelFormValues) {
    setIsLoading(true);
    try {
      const url = label ? `/api/labels/${label.id}` : "/api/labels";
      const method = label ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save label");
      }

      toast.success(label ? "Label updated" : "Label created");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedColor = form.watch("color");
  const selectedName = form.watch("name");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Label name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preview */}
        <div className="p-4 bg-accent/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-2">Preview</p>
          <Badge
            style={{
              backgroundColor: selectedColor + "20",
              color: selectedColor,
              borderColor: selectedColor,
            }}
            variant="outline"
          >
            {selectedName || "Label Name"}
          </Badge>
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
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" text="Deleting…" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Label
                </>
              )}
            </Button>
          )}

          {/* Update / Add */}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 w-full bg-primary rounded-sm hover:bg-primary/90"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" text="Saving…" />
            ) : label ? (
              "Update Label"
            ) : (
              "Create Label"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
