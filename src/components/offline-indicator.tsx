"use client";

import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  // Track previous online state to show a "back online" flash
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isOnline) {
      setShowBackOnline(true);
      const t = setTimeout(() => setShowBackOnline(false), 2500);
      return () => clearTimeout(t);
    }
  }, [isOnline, mounted]);

  // Don't render on server or when fully online with no flash
  if (!mounted) return null;
  if (isOnline && !showBackOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Pill anchored above bottom nav on mobile, bottom-right on desktop
        "fixed z-[99998] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-medium",
        "bottom-[88px] left-1/2 -translate-x-1/2",
        "lg:bottom-5 lg:right-5 lg:left-auto lg:translate-x-0",
        // Animate in
        "animate-fade-in-up",
        isOnline
          ? "bg-green-600 text-white"
          : "bg-destructive text-destructive-foreground"
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 shrink-0" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>No internet — offline mode</span>
        </>
      )}
    </div>
  );
}
