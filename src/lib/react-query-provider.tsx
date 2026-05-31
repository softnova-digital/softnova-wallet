"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { UnauthorizedError } from "@/lib/errors";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Global error handler — catches UnauthorizedError from any query and
        // dispatches a browser event that AuthGuard listens for.
        // This is the backup path: Clerk's SDK polling (~60s) is the primary
        // mechanism; this fires immediately when the first API call returns 401.
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof UnauthorizedError) {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("clerk:unauthorized"));
              }
            }
          },
        }),
        defaultOptions: {
          queries: {
            // 3 minutes: navigating between pages within a session never
            // triggers a re-fetch unless the user has been away long enough
            // that the data is genuinely likely to have changed.
            staleTime: 3 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            // Only re-fetch on mount when data is actually stale (respects
            // staleTime). Prevents the 2-5 s API call on every page visit.
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: (failureCount, error) => {
              // Never retry unauthorized errors — they won't succeed until re-auth
              if (error instanceof UnauthorizedError) return false;
              return failureCount < 1;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 0,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
