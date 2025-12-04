import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { PARTNERS } from "@/lib/constants";

const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  date: z.string().optional(),
  payee: z.enum(PARTNERS).optional(),
  categoryId: z.string().min(1).optional(),
  labelIds: z.array(z.string()).optional(),
  receiptUrl: z.string().optional().nullable(),
  receiptPublicId: z.string().optional().nullable(),
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

    const expense = await db.expense.findFirst({
      where: { 
        id,
        userId, // Verify ownership
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

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const validatedData = updateExpenseSchema.parse(body);

    // Verify ownership before updating
    const existingExpense = await db.expense.findFirst({
      where: { id, userId },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Delete existing labels if new ones are provided
    if (validatedData.labelIds !== undefined) {
      await db.expenseLabel.deleteMany({
        where: { expenseId: id },
      });
    }

    const expense = await db.expense.update({
      where: { id },
      data: {
        ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.date !== undefined && { date: new Date(validatedData.date) }),
        ...(validatedData.payee !== undefined && { payee: validatedData.payee }),
        ...(validatedData.categoryId !== undefined && { categoryId: validatedData.categoryId }),
        ...(validatedData.receiptUrl !== undefined && { receiptUrl: validatedData.receiptUrl }),
        ...(validatedData.receiptPublicId !== undefined && { receiptPublicId: validatedData.receiptPublicId }),
        ...(validatedData.labelIds?.length && {
          labels: {
            create: validatedData.labelIds.map((labelId) => ({
              labelId,
            })),
          },
        }),
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

    return NextResponse.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
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
    const expense = await db.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await db.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

