"use client";

import dynamic from "next/dynamic";

const MobileBottomNav = dynamic(
  () => import("@/components/mobile-bottom-nav").then((mod) => ({ default: mod.MobileBottomNav })),
  { ssr: false }
);

export function MobileBottomNavWrapper() {
  return <MobileBottomNav />;
}
