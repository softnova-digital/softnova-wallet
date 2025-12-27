import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 
        className={cn(
          "animate-spin",
          sizeClasses[size]
        )} 
      />
      {text && (
        <span className="text-sm">{text}</span>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ 
  text = "Loading...", 
  fullScreen = false 
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen
          ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          : "min-h-[200px] w-full"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  text?: string;
  className?: string;
}

export function LoadingCard({ 
  text = "Loading...", 
  className 
}: LoadingCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-8", className)}>
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
