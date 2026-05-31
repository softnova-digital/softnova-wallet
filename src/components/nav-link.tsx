"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  // Track a pending click so the item turns active the instant it's tapped,
  // before the server responds. Cleared when the route actually changes.
  const [pending, setPending] = useState(false);

  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    // Navigation landed — clear the optimistic state
    setPending(false);
  }, [pathname]);

  const showActive = isActive || pending;

  return (
    <Link
      href={href}
      onClick={() => {
        if (!isActive) setPending(true);
      }}
      className={cn(
        "flex flex-row items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
        // Use a fast transition only for background — no duration on the active switch
        "transition-colors duration-100 group relative overflow-hidden",
        "touch-action-manipulation select-none",
        showActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent/70"
      )}
    >
      {/* Hover shimmer — desktop only, skip when active */}
      {!showActive && (
        <span className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
      )}

      {/* Active left indicator */}
      {showActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground/30 rounded-full" />
      )}

      {children}
    </Link>
  );
}
