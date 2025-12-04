"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Client-side redirect to preserve hash fragment
export default function CategoriesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to settings with expense-categories tab
    router.replace("/settings#expense-categories");
  }, [router]);

  return null;
}
