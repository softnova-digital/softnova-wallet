import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { IncomesList } from "@/components/incomes-list";
import { IncomesPageClient } from "@/components/incomes-page-client";

export const metadata: Metadata = {
  title: "Incomes",
  description: "Track and manage all your income sources",
};

export default async function IncomesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if income categories exist and create defaults if needed - optimized
  const existingCategory = await db.category.findFirst({
    where: { type: "INCOME" },
    orderBy: { name: "asc" },
  });

  if (!existingCategory) {
    // Create default income categories in a single transaction
    const defaultCategories = [
      { name: "Salary", icon: "briefcase", color: "#3498DB", type: "INCOME" as const },
      { name: "Freelance", icon: "laptop", color: "#9B59B6", type: "INCOME" as const },
      { name: "Investments", icon: "trending-up", color: "#27AE60", type: "INCOME" as const },
      { name: "Sales", icon: "shopping-cart", color: "#E67E22", type: "INCOME" as const },
      { name: "Rental", icon: "home", color: "#1ABC9C", type: "INCOME" as const },
      { name: "Other", icon: "wallet", color: "#95A5A6", type: "INCOME" as const },
    ];

    await db.category.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        isDefault: true,
      })),
      skipDuplicates: true,
    });
  }

  // Fetch all INCOME type categories (now guaranteed to exist)
  const categories = await db.category.findMany({
    where: { type: "INCOME" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <IncomesPageClient categories={categories} />
      
      <IncomesList categories={categories} />
    </div>
  );
}
