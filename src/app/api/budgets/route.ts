import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

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

    const budgets = await db.budget.findMany({
      where: {
        userId, // Filter by userId for security and performance
      },
      include: {
        category: true,
      },
      orderBy: [
        { category: { name: "asc" } },
        { period: "asc" },
      ],
    });

    return NextResponse.json(budgets);
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

