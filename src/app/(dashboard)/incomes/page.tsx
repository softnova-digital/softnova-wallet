import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { IncomesList } from "@/components/incomes-list";
import { IncomeFilters } from "@/components/income-filters";
import { AddIncomeButton } from "@/components/add-income-button";

export default async function IncomesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const categories = await db.incomeCategory.findMany({
    orderBy: { name: "asc" },
  });

  // If no income categories exist, create default ones
  if (categories.length === 0) {
    const defaultCategories = [
      { name: "Salary", icon: "briefcase", color: "#3498DB" },
      { name: "Freelance", icon: "laptop", color: "#9B59B6" },
      { name: "Investments", icon: "trending-up", color: "#27AE60" },
      { name: "Sales", icon: "shopping-cart", color: "#E67E22" },
      { name: "Rental", icon: "home", color: "#1ABC9C" },
      { name: "Other", icon: "wallet", color: "#95A5A6" },
    ];

    await db.incomeCategory.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        isDefault: true,
      })),
    });

    // Refetch after creating
    const newCategories = await db.incomeCategory.findMany({
      orderBy: { name: "asc" },
    });

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Incomes</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track and manage all your income sources
            </p>
          </div>
          <AddIncomeButton categories={newCategories} />
        </div>

        <IncomeFilters categories={newCategories} />
        
        <IncomesList categories={newCategories} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Incomes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and manage all your income sources
          </p>
        </div>
        <AddIncomeButton categories={categories} />
      </div>

      <IncomeFilters categories={categories} />
      
      <IncomesList categories={categories} />
    </div>
  );
}

