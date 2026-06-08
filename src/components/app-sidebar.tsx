"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Settings,
  X,
  Users,
  Banknote,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROUTE_PREFETCH: Record<string, { key: unknown[]; url: string }> = {
  "/":               { key: ["dashboard", "all", undefined, undefined], url: "/api/dashboard?range=all" },
  "/expenses":       { key: ["expenses", ""],                           url: "/api/expenses" },
  "/budgets":        { key: ["budgets"],                                url: "/api/budgets" },
  "/incomes":        { key: ["incomes", ""],                            url: "/api/incomes" },
  "/employees":      { key: ["employees", "", undefined],               url: "/api/employees" },
  "/salary-records": { key: ["salary-records", ""],                     url: "/api/salary-records" },
};

const navItems = [
  { href: "/",               label: "Dashboard",      icon: LayoutDashboard },
  { href: "/expenses",       label: "Expenses",       icon: TrendingDown },
  { href: "/incomes",        label: "Incomes",        icon: TrendingUp },
  { href: "/budgets",        label: "Budgets",        icon: PiggyBank },
  { href: "/employees",      label: "Employees",      icon: Users },
  { href: "/salary-records", label: "Salary Records", icon: Banknote },
  { href: "/settings",       label: "Settings",       icon: Settings },
];

interface AppSidebarProps {
  userData: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

function SidebarInner({ userData }: AppSidebarProps) {
  const pathname    = usePathname();
  const router      = useRouter();
  const queryClient = useQueryClient();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const isCollapsed = state === "collapsed" && !isMobile;

  const handlePointerEnter = useCallback(
    (href: string, active: boolean) => () => {
      if (active) return;
      router.prefetch(href);
      const entry = ROUTE_PREFETCH[href];
      if (entry) {
        queryClient.prefetchQuery({
          queryKey: entry.key,
          queryFn: () => fetch(entry.url).then((r) => r.json()),
          staleTime: 3 * 60 * 1000,
        });
      }
    },
    [router, queryClient]
  );

  const displayName = [userData.firstName, userData.lastName]
    .filter(Boolean)
    .join(" ") || userData.email.split("@")[0];

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-sidebar-border/60">
        <div className="flex items-center justify-between px-3 py-3.5">
          <Link
            href="/"
            className={cn(
              "flex items-center min-w-0 rounded-lg transition-opacity duration-150 hover:opacity-80",
              isCollapsed && "justify-center w-full"
            )}
          >
            {isCollapsed ? (
              /* Collapsed: brand monogram */
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
                <span className="text-primary font-bold text-xs tracking-tight">S</span>
              </span>
            ) : (
              <Logo variant="sidebar" />
            )}
          </Link>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setOpenMobile(false)}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </SidebarHeader>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <SidebarContent className="py-3 overflow-y-auto">
        <SidebarMenu className="px-2 gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  size="default"
                  className={cn(
                    "h-9 rounded-lg text-[13px] font-medium",
                    "transition-all duration-150",
                    isActive
                      ? [
                          "bg-primary text-primary-foreground",
                          "shadow-[0_1px_3px_rgba(72,225,124,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]",
                          "hover:bg-primary/95 hover:text-primary-foreground",
                        ].join(" ")
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  onMouseEnter={handlePointerEnter(item.href, isActive)}
                  onTouchStart={handlePointerEnter(item.href, isActive)}
                >
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary-foreground" : "text-sidebar-foreground/50"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ── User footer ──────────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border/60">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-3",
            isCollapsed && "justify-center px-1"
          )}
        >
          <div className="shrink-0">
            <UserButton />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate mt-0.5">
                {userData.email}
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </>
  );
}

export function AppSidebar({ userData }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarInner userData={userData} />
    </Sidebar>
  );
}
