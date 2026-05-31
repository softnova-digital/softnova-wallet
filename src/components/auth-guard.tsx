"use client";

/**
 * AuthGuard — client-side session watchdog.
 *
 * Responsibility: bridge the gap between Clerk's server-side middleware
 * (which handles auth on every navigation) and the live client-side session.
 *
 * Two scenarios this covers:
 *
 * 1. EXPLICIT SIGN-OUT  — User taps "Sign Out" in the UserButton.
 *    Clerk fires routerPush("/sign-in") internally. AuthGuard also detects
 *    the isSignedIn → false transition and clears React Query cache so no
 *    stale financial data leaks to the next session.
 *
 * 2. TOKEN EXPIRY / PWA RESUME — The Clerk JWT expires while the app is in
 *    the background (e.g. phone locked). When the PWA resumes, Clerk's SDK
 *    reloads and detects the expired session. It fires router.refresh(), which
 *    causes middleware to redirect. AuthGuard is a belt-and-suspenders layer:
 *    it detects isSignedIn=false while still on a protected page and performs
 *    its own router.replace("/sign-in"), ensuring the transition is covered even
 *    before the SW-cached page is refreshed.
 *
 * During any auth transition AuthGuard renders a full-screen overlay so the
 * user never sees a blank screen or flash of old authenticated content.
 *
 * Also listens for the "clerk:unauthorized" custom event dispatched by the
 * React Query error handler when an API returns 401. This closes the gap
 * between Clerk's ~60s polling interval and an immediate 401 response.
 */

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AuthGuard() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showOverlay, setShowOverlay] = useState(false);
  // Tracks whether we have started a redirect to prevent duplicate navigations
  const redirectingRef = useRef(false);

  const handleAuthLost = () => {
    if (redirectingRef.current) return;
    if (pathname.startsWith("/sign-in")) return;

    redirectingRef.current = true;
    // Wipe all cached user data immediately so a future session can't see it
    queryClient.clear();
    setShowOverlay(true);
    router.replace("/sign-in");
  };

  // ── Primary watcher: Clerk auth state ──────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    // If Clerk says not signed in and we are on a protected route → redirect
    if (!isSignedIn && !pathname.startsWith("/sign-in")) {
      handleAuthLost();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, pathname]);

  // ── Secondary watcher: API 401 events ──────────────────────────────────
  // Dispatched by the React Query error handler when any API returns 401.
  // This bridges the gap between Clerk's ~60s polling interval and an
  // immediate 401 from a fresh API call.
  useEffect(() => {
    const handleUnauthorized = () => handleAuthLost();
    window.addEventListener("clerk:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("clerk:unauthorized", handleUnauthorized);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Clear overlay once the sign-in page is rendered ───────────────────
  useEffect(() => {
    if (pathname.startsWith("/sign-in")) {
      setShowOverlay(false);
      redirectingRef.current = false;
    }
  }, [pathname]);

  if (!showOverlay) return null;

  return (
    <div
      role="status"
      aria-label="Signing out"
      // Full-screen, above everything — prevents blank screen during navigation
      className="fixed inset-0 z-[999999] bg-background flex flex-col items-center justify-center gap-4"
    >
      {/* Minimal spinner — no animation libraries needed */}
      <div
        className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-muted-foreground">
        Signing out…
      </p>
    </div>
  );
}
