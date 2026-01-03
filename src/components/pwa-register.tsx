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
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

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

