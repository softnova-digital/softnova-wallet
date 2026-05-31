"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin top-of-viewport progress bar that fires the instant a link is clicked
 * and completes the moment the new route is rendered.
 *
 * Works by listening to document-level click events for <a href> elements
 * (which covers every Next.js <Link>) and completing when usePathname changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);

  const prevPathname = useRef(pathname);
  const fillTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (fillTimer.current) clearInterval(fillTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  // Start: called on every internal link click
  const start = () => {
    clearTimers();
    setVisible(true);
    setWidth(5);

    let current = 5;
    fillTimer.current = setInterval(() => {
      // Asymptotically approach 85% — never reaches 100% until complete
      const remaining = 85 - current;
      const step = Math.max(remaining * 0.08, 0.5);
      current = Math.min(current + step, 85);
      setWidth(current);
    }, 150);
  };

  // Complete: called when pathname changes (navigation finished)
  const complete = () => {
    clearTimers();
    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300);
  };

  // Detect navigation completion
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      complete();
      prevPathname.current = pathname;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Intercept all internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      // Only intercept internal navigation; skip external, hash, and same-page
      if (!href.startsWith("/")) return;
      if (href === pathname || href === pathname + "/") return;
      // Skip download links
      if (anchor.hasAttribute("download")) return;

      start();
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => () => clearTimers(), []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] h-[2px] pointer-events-none"
    >
      <div
        className="h-full bg-primary"
        style={{
          width: `${width}%`,
          transition:
            width === 0
              ? "none"
              : width === 100
              ? "width 150ms ease-out"
              : "width 120ms ease-out",
          willChange: "width",
        }}
      />
    </div>
  );
}
