import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { PARTNERS } from "@/lib/constants";

const createExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string(),
  payee: z.enum(PARTNERS),
  categoryId: z.string().min(1),
  labelIds: z.array(z.string()).optional(),
  receiptUrl: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const payee = searchParams.get("payee");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {
      userId, // Critical: Filter by userId for security and performance
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (payee && payee !== "all") {
      where.payee = payee;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { payee: { contains: search, mode: "insensitive" } },
      ];
    }

    const [expenses, total] = await Promise.all([
      db.expense.findMany({
        where,
        include: {
          category: true,
          labels: {
            include: {
              label: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.expense.count({ where }),
    ]);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
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
    const validatedData = createExpenseSchema.parse(body);

    const expense = await db.expense.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        date: new Date(validatedData.date),
        payee: validatedData.payee,
        categoryId: validatedData.categoryId,
        receiptUrl: validatedData.receiptUrl,
        userId,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress || "Unknown",
        labels: validatedData.labelIds?.length
          ? {
              create: validatedData.labelIds.map((labelId) => ({
                labelId,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        labels: {
          include: {
            label: true,
          },
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

