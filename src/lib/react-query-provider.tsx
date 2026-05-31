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
            staleTime: 30 * 1000, // 30 seconds — data is fresh across rapid navigations
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
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
