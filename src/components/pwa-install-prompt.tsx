"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, X, Share, MoreHorizontal, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPad on iOS 13+ reports as MacIntel
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Already installed — nothing to show
    if (isInStandaloneMode()) return;

    const hasSeenPrompt = localStorage.getItem("pwa-install-prompt-seen");
    if (hasSeenPrompt) return;

    if (isIOS()) {
      // iOS Safari doesn't fire beforeinstallprompt — show manual instructions
      const t = setTimeout(() => setShowIOSPrompt(true), 4000);
      return () => clearTimeout(t);
    }

    // Chrome / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const t = setTimeout(() => setShowAndroidPrompt(true), 3000);
      return () => clearTimeout(t);
    };

    const handleAppInstalled = () => {
      setShowAndroidPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem("pwa-install-prompt-seen", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("pwa-install-prompt-seen", "true");
    }
    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  const handleDismiss = () => {
    setShowAndroidPrompt(false);
    setShowIOSPrompt(false);
    localStorage.setItem("pwa-install-prompt-seen", "true");
  };

  // ── Android / Chrome prompt ─────────────────────────────────────────────
  if (showAndroidPrompt && deferredPrompt) {
    return (
      <Dialog open onOpenChange={handleDismiss}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Install Softnova Wallet
            </DialogTitle>
            <DialogDescription>
              Add to your home screen for quick access, offline support, and a
              full-screen native experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3">
            {[
              ["Quick access", "Launch directly from your home screen"],
              ["Offline support", "View your data even without internet"],
              ["Better performance", "Faster loading, smoother experience"],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Not Now
            </Button>
            <Button onClick={handleAndroidInstall} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── iOS Safari prompt ───────────────────────────────────────────────────
  if (showIOSPrompt) {
    return (
      <Dialog open onOpenChange={handleDismiss}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Add to Home Screen
            </DialogTitle>
            <DialogDescription>
              Install Softnova Wallet for a full-screen native experience on your iPhone or iPad.
            </DialogDescription>
          </DialogHeader>

          <ol className="space-y-4 py-3">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">Tap the Share button</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  Find the <Share className="h-3.5 w-3.5 inline" /> icon in the Safari toolbar
                  {" "}at the bottom of your screen
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">Scroll down and tap</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Plus className="h-3.5 w-3.5 inline" />{" "}
                  <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <div>
                <p className="text-sm font-medium">Tap &ldquo;Add&rdquo;</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The app icon will appear on your home screen
                </p>
              </div>
            </li>
          </ol>

          <DialogFooter>
            <Button variant="outline" onClick={handleDismiss} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Got it, maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
