"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Maps each dashboard route to the API fetch that its page needs.
// Keys must match the queryKey arrays used by the corresponding hooks.
const ROUTE_PREFETCH: Record<string, { key: unknown[]; url: string }> = {
  "/":        { key: ["dashboard", "all", undefined, undefined], url: "/api/dashboard?range=all" },
  "/expenses":{ key: ["expenses", ""],                           url: "/api/expenses" },
  "/budgets": { key: ["budgets"],                                url: "/api/budgets" },
  "/incomes": { key: ["incomes", ""],                            url: "/api/incomes" },
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  const showActive = isActive || pending;

  // Warm both the Next.js router cache (RSC payload) and the React Query cache
  // the moment the pointer approaches, so by the time the user clicks the page
  // shell and its data are already in-flight or ready.
  const handlePointerEnter = useCallback(() => {
    if (isActive) return;
    router.prefetch(href);
    const entry = ROUTE_PREFETCH[href];
    if (entry) {
      queryClient.prefetchQuery({
        queryKey: entry.key,
        queryFn: () => fetch(entry.url).then((r) => r.json()),
        staleTime: 3 * 60 * 1000,
      });
    }
  }, [href, isActive, router, queryClient]);

  return (
    <Link
      href={href}
      onMouseEnter={handlePointerEnter}
      onTouchStart={handlePointerEnter}
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
