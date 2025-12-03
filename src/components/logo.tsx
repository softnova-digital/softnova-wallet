"use client";

import Image from "next/image";
import { useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  variant?: "desktop" | "mobile" | "sidebar";
}

export function Logo({ width, height, className, variant = "desktop" }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  // Default dimensions based on variant - optimized for better proportions
  const defaultWidth = variant === "sidebar" ? 180 : variant === "mobile" ? 160 : 150;
  const defaultHeight = variant === "sidebar" ? 60 : variant === "mobile" ? 56 : 50;
  const defaultClassName = 
    variant === "sidebar" ? "h-12 w-auto object-contain max-w-[180px]" :
    variant === "mobile" ? "h-12 md:h-14 w-auto object-contain max-w-[160px]" :
    "h-10 md:h-12 w-auto object-contain max-w-[150px]";

  if (imageError) {
    // Fallback to text logo
    return (
      <div className={`flex items-center gap-1 ${className || ""}`}>
        <span className="text-base md:text-lg font-bold text-foreground">Soft</span>
        <span className="text-base md:text-lg font-bold text-primary">noVa</span>
      </div>
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="Softnova Digital"
      width={width || defaultWidth}
      height={height || defaultHeight}
      className={className || defaultClassName}
      priority
      onError={() => setImageError(true)}
    />
  );
}

