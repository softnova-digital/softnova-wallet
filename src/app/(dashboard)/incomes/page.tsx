import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { IncomesList } from "@/components/incomes-list";
import { IncomesPageClient } from "@/components/incomes-page-client";
import { getIncomeCategories } from "@/lib/queries";
import { revalidateTag } from "next/cache";

export const metadata: Metadata = {
  title: "Incomes",
  description: "Track and manage all your income sources",
};

const defaultIncomeCategories = [
  { name: "Salary", icon: "briefcase", color: "#3498DB", type: "INCOME" as const },
  { name: "Freelance", icon: "laptop", color: "#9B59B6", type: "INCOME" as const },
  { name: "Investments", icon: "trending-up", color: "#27AE60", type: "INCOME" as const },
  { name: "Sales", icon: "shopping-cart", color: "#E67E22", type: "INCOME" as const },
  { name: "Rental", icon: "home", color: "#1ABC9C", type: "INCOME" as const },
  { name: "Other", icon: "wallet", color: "#95A5A6", type: "INCOME" as const },
];

export default async function IncomesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Single query in the normal case. Only runs seed + re-fetch on the very
  // first request when the DB has no income categories yet.
  let categories = await getIncomeCategories();

  if (categories.length === 0) {
    await db.category.createMany({
      data: defaultIncomeCategories.map((cat) => ({ ...cat, isDefault: true })),
      skipDuplicates: true,
    });
    // Bust the cache so the freshly seeded data is returned
    revalidateTag("income-categories");
    categories = await getIncomeCategories();
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <IncomesPageClient categories={categories} />

      <IncomesList categories={categories} />
    </div>
  );
}
