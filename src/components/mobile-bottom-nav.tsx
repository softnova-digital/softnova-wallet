"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, BanknoteArrowDown, BanknoteArrowUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: BanknoteArrowUp },
  { href: "/incomes", label: "Incomes", icon: BanknoteArrowDown },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  // Tracks which item the user just tapped so it turns active instantly
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    // Clear optimistic state once navigation actually lands
    setPendingHref(null);
  }, [pathname]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 lg:hidden"
      style={{
        zIndex: 99999,
        isolation: "isolate",
        // Push content above iOS home indicator
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <nav
        className="flex items-center justify-around px-2 pt-2 pb-2 border-t border-white/20 shadow-2xl"
        style={{
          backgroundColor: "rgba(28, 28, 28, 0.97)",
          borderRadius: "20px 20px 0 0",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const isPending = pendingHref === item.href;
          const showActive = isActive || isPending;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (!isActive) setPendingHref(item.href);
              }}
              className={cn(
                // Minimum 44×44 touch target, no 300ms tap delay
                "relative flex flex-col items-center justify-center gap-0.5 px-4 py-2",
                "min-w-11 min-h-11 rounded-xl select-none",
                // Instant color change, press scale feedback
                "transition-colors duration-75",
                "active:scale-90",
                showActive ? "text-primary" : "text-muted-foreground"
              )}
              style={{ touchAction: "manipulation" }}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-75",
                  showActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight",
                  showActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>

              {/* Active pill indicator */}
              {showActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
