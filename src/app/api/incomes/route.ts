import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Cache configuration for GET requests
export const revalidate = 10; // Revalidate every 10 seconds
export const dynamic = "force-dynamic"; // Force dynamic for user-specific data

const createIncomeSchema = z.object({
  amount: z.union([
    z.number().positive(),
    z.string().refine((val) => {
      const parsed = parseFloat(val);
      return !isNaN(parsed) && parsed > 0;
    }, { message: "Amount must be a positive number" }).transform((val) => parseFloat(val)),
  ]),
  description: z.string().optional(),
  date: z.string(),
  source: z.string().min(1),
  categoryId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      100 // Maximum limit to prevent very large queries
    );

    const where: Record<string, unknown> = {
      userId, // Critical: Filter by userId for security and performance
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { source: { contains: search, mode: "insensitive" } },
      ];
    }

    const [incomes, total] = await Promise.all([
      db.income.findMany({
        where,
        orderBy: { date: "desc" },
        include: {
          category: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.income.count({ where }),
    ]);

    return NextResponse.json(
      {
        incomes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching incomes:", error);
    return NextResponse.json(
      { error: "Failed to fetch incomes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createIncomeSchema.parse(body);

    // Only include description if it's provided and not empty
    // If omitted, Prisma will handle it according to schema (null for String?)
    const data: {
      amount: number;
      date: Date;
      source: string;
      categoryId: string;
      userId: string;
      userName: string;
      description?: string;
    } = {
      amount: validatedData.amount,
      date: new Date(validatedData.date),
      source: validatedData.source,
      categoryId: validatedData.categoryId,
      userId,
      userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress || "Unknown",
    };

    // Only add description if it's a non-empty string
    if (validatedData.description && validatedData.description.trim() !== "") {
      data.description = validatedData.description.trim();
    }

    const income = await db.income.create({
      data,
      include: {
        category: true,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating income:", error);
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}



