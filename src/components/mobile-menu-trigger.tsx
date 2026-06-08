"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function MobileMenuTrigger() {
  const { setOpenMobile } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute left-4 h-9 w-9 text-muted-foreground hover:text-foreground md:hidden"
      onClick={() => setOpenMobile(true)}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open Menu</span>
    </Button>
  );
}
