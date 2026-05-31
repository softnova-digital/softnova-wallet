import { unstable_cache } from "next/cache";
import { db } from "./db";

// Categories and labels are reference data that changes rarely.
// Cache them server-side for 60 seconds to avoid a DB round-trip on every
// page navigation. Mutation routes call revalidateTag() to bust the cache
// immediately when data changes.

export const getExpenseCategories = unstable_cache(
  () =>
    db.category.findMany({
      where: { type: "EXPENSE" },
      orderBy: { name: "asc" },
    }),
  ["expense-categories"],
  { revalidate: 60, tags: ["categories", "expense-categories"] }
);

export const getIncomeCategories = unstable_cache(
  () =>
    db.category.findMany({
      where: { type: "INCOME" },
      orderBy: { name: "asc" },
    }),
  ["income-categories"],
  { revalidate: 60, tags: ["categories", "income-categories"] }
);

export const getLabels = unstable_cache(
  () =>
    db.label.findMany({
      orderBy: { name: "asc" },
    }),
  ["labels"],
  { revalidate: 60, tags: ["labels"] }
);
