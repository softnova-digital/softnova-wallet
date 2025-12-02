import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  Tags,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/nav-link";
import { MobileNav } from "@/components/mobile-nav";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/incomes", label: "Incomes", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Extract only serializable user data for client components
  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || "",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden lg:block animate-slide-in-left">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">Soft</span>
              <span className="text-xl font-bold text-primary">noVa</span>
            </Link>
            <span className="ml-2 text-xs text-muted-foreground">Expenses</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item, index) => (
              <div 
                key={item.href} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <NavLink href={item.href}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              </div>
            ))}
          </nav>

          {/* User */}
          <div className="border-t border-border p-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/sign-in" />
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-foreground truncate">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userData.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:hidden">
        <MobileNav user={userData} />
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-foreground">Soft</span>
          <span className="text-xl font-bold text-primary">noVa</span>
        </Link>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
