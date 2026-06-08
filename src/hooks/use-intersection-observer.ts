"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((el: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!el || typeof IntersectionObserver === "undefined") return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0, rootMargin: "200px", ...options }
    );
    observerRef.current.observe(el);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { ref, isIntersecting };
}
