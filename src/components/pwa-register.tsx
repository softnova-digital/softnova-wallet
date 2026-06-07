"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      // Register service worker
      registerServiceWorker();
    }
  }, []);

  return null;
}

async function registerServiceWorker() {
  try {
    // Include the build timestamp in the SW URL. A new URL on each deploy forces
    // the browser to install a fresh service worker, which then activates with a
    // new cache name and prunes all caches from previous deployments.
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || "dev";
    const registration = await navigator.serviceWorker.register(
      `/sw.js?v=${encodeURIComponent(buildTime)}`,
      { scope: "/" }
    );

    console.log(
      "[PWA] Service Worker registered successfully:",
      registration.scope
    );

    // Check for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New service worker available
            console.log("[PWA] New service worker available");
            // You can show a notification to the user here
          }
        });
      }
    });

    // Handle service worker updates
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        console.log("[PWA] New service worker activated, reloading...");
        window.location.reload();
      }
    });
  } catch (error) {
    console.error("[PWA] Service Worker registration failed:", error);
  }
}

