import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateIncomeSchema = z.object({
  amount: z.union([
    z.number().positive(),
    z.string().refine((val) => {
      const parsed = parseFloat(val);
      return !isNaN(parsed) && parsed > 0;
    }, { message: "Amount must be a positive number" }).transform((val) => parseFloat(val)),
  ]).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  source: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const income = await db.income.findFirst({
      where: { 
        id,
        userId, // Verify ownership
      },
      include: {
        category: true,
      },
    });

    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error("Error fetching income:", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateIncomeSchema.parse(body);

    // Verify ownership before updating
    const existingIncome = await db.income.findFirst({
      where: { id, userId },
    });

    if (!existingIncome) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    const income = await db.income.update({
      where: { id },
      data: {
        ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.date !== undefined && { date: new Date(validatedData.date) }),
        ...(validatedData.source !== undefined && { source: validatedData.source }),
        ...(validatedData.categoryId !== undefined && { categoryId: validatedData.categoryId }),
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.emailAddresses[0]?.emailAddress || "Unknown",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(income);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating income:", error);
    return NextResponse.json(
      { error: "Failed to update income" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership before deleting
    const income = await db.income.findFirst({
      where: { id, userId },
    });

    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }

    await db.income.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income:", error);
    return NextResponse.json(
      { error: "Failed to delete income" },
      { status: 500 }
    );
  }
}



