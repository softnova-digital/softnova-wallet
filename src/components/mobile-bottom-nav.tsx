"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: TrendingDown },
  { href: "/incomes", label: "Incomes", icon: TrendingUp },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-99999 lg:hidden pointer-events-none"
      style={{
        isolation: 'isolate',
        zIndex: 99999,
        position: 'fixed',
      }}
    >
      <div className="px-4 pb-1 pointer-events-none">
        <nav
          className="border-t border-white/20 shadow-2xl rounded-t-2xl px-6 py-4 flex items-center justify-between pointer-events-auto w-full max-w-md mx-auto ring-1 ring-white/10 backdrop-blur-2xl"
          style={{ 
            position: 'relative', 
            zIndex: 99999, 
            backgroundColor: 'rgba(28, 28, 28, 0.95)', 
            borderRadius: '20px' 
          }}
        >
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-110"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10 hover:scale-105"
                )}
              >
                <Icon className={cn(" w-10 h-10 sm:w-12 sm:h-12", isActive && "fill-current")} />
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-current rounded-full" />
                )}
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
