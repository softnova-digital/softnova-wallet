"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",               label: "Home",     icon: LayoutDashboard },
  { href: "/expenses",       label: "Expenses", icon: BanknoteArrowUp },
  { href: "/incomes",        label: "Incomes",  icon: BanknoteArrowDown },
  { href: "/employees",      label: "Staff",    icon: Users },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 lg:hidden"
      style={{
        zIndex: 99999,
        isolation: "isolate",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <nav
        className="flex items-end justify-around px-1 pt-2 pb-2 border-t"
        style={{
          backgroundColor: "rgba(21, 21, 24, 0.92)",
          borderTopColor: "oklch(1 0 0 / 8%)",
          borderRadius: "20px 20px 0 0",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
        }}
      >
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const isPending  = pendingHref === item.href;
          const showActive = isActive || isPending;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { if (!isActive) setPendingHref(item.href); }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-1.5",
                "min-w-12 min-h-11 rounded-2xl select-none",
                "transition-colors duration-100",
                "active:scale-90",
                showActive ? "text-primary" : "text-muted-foreground"
              )}
              style={{ touchAction: "manipulation" }}
            >


              <Icon
                className={cn(
                  "relative w-4.75 h-4.75 transition-transform duration-100",
                  showActive && "scale-105"
                )}
                strokeWidth={showActive ? 2.2 : 1.8}
              />
              <span
                className={cn(
                  "relative text-[10px] font-medium leading-none tracking-tight",
                  showActive ? "text-primary" : "text-muted-foreground/70"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
