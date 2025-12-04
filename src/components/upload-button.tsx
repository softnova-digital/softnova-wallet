"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadButtonProps {
  onFileSelect: (file: File) => void;
}

export function UploadButton({ onFileSelect }: UploadButtonProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload an image or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Store the file locally - will be uploaded on form submission
    onFileSelect(file);
    
    // Reset the input so the same file can be selected again if needed
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        id="receipt-upload"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById("receipt-upload")?.click()}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        Select Receipt
      </Button>
    </div>
  );
}

