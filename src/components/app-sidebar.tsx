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
  "/":         { key: ["dashboard", "all", undefined, undefined], url: "/api/dashboard?range=all" },
  "/expenses": { key: ["expenses", ""],                           url: "/api/expenses" },
  "/budgets":  { key: ["budgets"],                                url: "/api/budgets" },
  "/incomes":  { key: ["incomes", ""],                            url: "/api/incomes" },
};

const navItems = [
  { href: "/",         label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses",  icon: TrendingDown },
  { href: "/incomes",  label: "Incomes",   icon: TrendingUp },
  { href: "/budgets",  label: "Budgets",   icon: PiggyBank },
  { href: "/settings", label: "Settings",  icon: Settings },
];

interface AppSidebarProps {
  userData: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// Inner component — must be inside SidebarProvider to use useSidebar()
function SidebarInner({ userData }: AppSidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
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

  return (
    <>
      {/* ── Header: logo + optional mobile close ─────────────────────── */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-3">
          <Link href="/" className="flex items-center min-w-0">
            {isCollapsed ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <span className="text-primary font-bold text-sm">S</span>
              </span>
            ) : (
              <Logo variant="sidebar" />
            )}
          </Link>

          {/* Mobile-only close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setOpenMobile(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </SidebarHeader>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <SidebarContent className="py-2 overflow-y-auto">
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
                    "h-10 rounded-lg",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "hover:bg-sidebar-accent"
                  )}
                  onMouseEnter={handlePointerEnter(item.href, isActive)}
                  onTouchStart={handlePointerEnter(item.href, isActive)}
                >
                  <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ── User footer ───────────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 px-3 py-3",
          isCollapsed && "justify-center px-1"
        )}>
          <UserButton />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userData.firstName} {userData.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
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
