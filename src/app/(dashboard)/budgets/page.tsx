import type { Metadata } from "next";
import { BudgetsContent } from "@/components/budgets-content";
import { getExpenseCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Budgets",
  description: "Set and track your spending limits",
};

export default async function BudgetsPage() {
  // Categories are reference data cached server-side — fast, no auth needed.
  // Budget data (with spending) is fetched client-side via React Query so this
  // page responds immediately and the loading.tsx skeleton shows at once.
  const categories = await getExpenseCategories();

  return <BudgetsContent categories={categories} />;
}
