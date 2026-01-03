"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-99999 lg:hidden pointer-events-none"
      style={{
        isolation: 'isolate',
        zIndex: 99999,
        position: 'fixed',
      }}
    >
      <div className="w-full pointer-events-none">
        <nav
          className="border-t border-white/20 shadow-2xl rounded-t-2xl px-2 py-3 flex items-center justify-around pointer-events-auto w-full ring-1 ring-white/10 backdrop-blur-2xl"
          style={{ 
            position: 'relative', 
            zIndex: 99999, 
            backgroundColor: 'rgba(28, 28, 28, 0.95)', 
            borderRadius: '20px 20px 0 0' 
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
                  "relative flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-300 min-w-0 flex-1",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className={cn("w-5 h-5")} />
                {/* Label */}
                <span className={cn(
                  "text-[10px] font-medium text-center leading-tight",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
