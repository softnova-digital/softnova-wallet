import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNavWrapper } from "@/components/mobile-bottom-nav-wrapper";
import { Logo } from "@/components/logo";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger";

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
        {/* Mobile-only sticky header */}
        <header className="md:hidden fixed top-0 left-0 right-0 flex h-14 shrink-0 items-center justify-center border-b border-border/60 bg-background/90 backdrop-blur-xl z-20 px-4">
          <MobileMenuTrigger />
          <Logo variant="mobile" />
        </header>

        {/* Page content */}
        <div
          className="grid-background flex-1 min-h-0 pt-14 md:pt-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto animate-fade-in">
            {children}
          </div>
        </div>
      </SidebarInset>

      {/* Mobile bottom nav for quick thumb navigation */}
      <MobileBottomNavWrapper />
    </SidebarProvider>
  );
}
