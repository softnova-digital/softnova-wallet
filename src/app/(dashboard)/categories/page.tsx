import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CategoriesList } from "@/components/categories-list";
import { AddCategoryButton } from "@/components/add-category-button";

export default async function CategoriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { expenses: true },
      },
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage expense categories for better organization
          </p>
        </div>
        <AddCategoryButton />
      </div>

      <CategoriesList categories={categories} />
    </div>
  );
}
