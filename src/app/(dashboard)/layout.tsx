import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNavWrapper } from "@/components/mobile-bottom-nav-wrapper";
import { Logo } from "@/components/logo";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || "",
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar userData={userData} />

      <SidebarInset>
        {/* Sticky top bar — contains the collapse/expand toggle on all breakpoints */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 px-4">
          <SidebarTrigger className="shrink-0" />
          <Separator orientation="vertical" className="h-4 mx-1" />
          {/* Logo shown on mobile where the sidebar is hidden behind a drawer */}
          <div className="md:hidden flex flex-1 justify-center">
            <Logo variant="mobile" />
          </div>
        </header>

        {/* Page content */}
        <div
          className="grid-background flex-1"
          style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
            {children}
          </div>
        </div>
      </SidebarInset>

      {/* Mobile bottom nav for quick thumb navigation */}
      <MobileBottomNavWrapper />
    </SidebarProvider>
  );
}
