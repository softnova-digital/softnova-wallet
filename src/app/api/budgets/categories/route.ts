import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { CategoryType } from "@prisma/client";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["EXPENSE", "INCOME"]),
  icon: z.string().min(1),
  color: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get type filter from query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as CategoryType | null;

    const where = type ? { type } : {};

    const categories = await db.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            expenses: type === "EXPENSE" || !type,
            incomes: type === "INCOME" || !type,
          },
        },
      },
    });

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // 5 min cache for categories
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const validatedData = createCategorySchema.parse(body);

    const category = await db.category.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        icon: validatedData.icon,
        color: validatedData.color,
        isDefault: false,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

