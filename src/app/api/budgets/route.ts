import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

const createBudgetSchema = z.object({
  amount: z.number().positive(),
  period: z.enum(["weekly", "monthly", "yearly"]),
  categoryId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const periodRanges = {
      weekly:  { start: startOfWeek(now),  end: endOfWeek(now) },
      monthly: { start: startOfMonth(now), end: endOfMonth(now) },
      yearly:  { start: startOfYear(now),  end: endOfYear(now) },
    };

    const budgets = await db.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: [{ category: { name: "asc" } }, { period: "asc" }],
    });

    if (budgets.length === 0) return NextResponse.json([]);

    // One groupBy query per unique period type (max 3) instead of N aggregate
    // queries. Derive the "overall" total by summing all category groups.
    const uniquePeriods = [...new Set(budgets.map((b) => b.period))] as Array<
      keyof typeof periodRanges
    >;

    const spendingByPeriod = Object.fromEntries(
      await Promise.all(
        uniquePeriods.map(async (period) => {
          const { start, end } = periodRanges[period];
          const rows = await db.expense.groupBy({
            by: ["categoryId"],
            where: { userId, date: { gte: start, lte: end } },
            _sum: { amount: true },
          });
          const byCategory = Object.fromEntries(
            rows.map((r) => [r.categoryId ?? "__null__", r._sum.amount ?? 0])
          );
          const total = rows.reduce((s, r) => s + (r._sum.amount ?? 0), 0);
          return [period, { byCategory, total }] as const;
        })
      )
    );

    const budgetsWithSpent = budgets.map((budget) => {
      const pd = spendingByPeriod[budget.period];
      const spent = pd
        ? budget.categoryId
          ? (pd.byCategory[budget.categoryId] ?? 0)
          : pd.total
        : 0;
      return { ...budget, spent };
    });

    return NextResponse.json(budgetsWithSpent);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBudgetSchema.parse(body);

    // Check for existing budget with same period and category
    const existing = await db.budget.findFirst({
      where: {
        userId,
        period: validatedData.period,
        categoryId: validatedData.categoryId || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A budget for this category and period already exists" },
        { status: 400 }
      );
    }

    const budget = await db.budget.create({
      data: {
        amount: validatedData.amount,
        period: validatedData.period,
        categoryId: validatedData.categoryId || null,
        userId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}

