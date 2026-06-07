import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const updateSalaryRecordSchema = z.object({
  amount: z.number().positive().optional(),
  paymentDate: z.string().optional(),
  remarks: z.string().optional().nullable(),
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

    const salaryRecord = await db.salaryRecord.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!salaryRecord) {
      return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
    }

    return NextResponse.json(salaryRecord);
  } catch (error) {
    logger.error("Error fetching salary record", error);
    return NextResponse.json(
      { error: "Failed to fetch salary record" },
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
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSalaryRecordSchema.parse(body);

    const existing = await db.salaryRecord.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
    }

    const newAmount = validatedData.amount ?? existing.amount;
    const newPaymentDate = validatedData.paymentDate
      ? new Date(validatedData.paymentDate)
      : existing.paymentDate;

    const salaryRecord = await db.$transaction(async (tx) => {
      // Sync the linked expense if it exists
      if (existing.expenseId) {
        const expense = await tx.expense.findUnique({ where: { id: existing.expenseId } });
        if (expense) {
          const description = `Salary – ${existing.employee.name} (${MONTH_NAMES[existing.month - 1]} ${existing.year})`;
          await tx.expense.update({
            where: { id: existing.expenseId },
            data: {
              amount: newAmount,
              date: newPaymentDate,
              description,
            },
          });
        }
      }

      return tx.salaryRecord.update({
        where: { id },
        data: {
          ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
          ...(validatedData.paymentDate !== undefined && {
            paymentDate: new Date(validatedData.paymentDate),
          }),
          ...(validatedData.remarks !== undefined && { remarks: validatedData.remarks }),
        },
        include: { employee: true },
      });
    });

    return NextResponse.json(salaryRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    logger.error("Error updating salary record", error);
    return NextResponse.json(
      { error: "Failed to update salary record" },
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

    const salaryRecord = await db.salaryRecord.findUnique({ where: { id } });
    if (!salaryRecord) {
      return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Delete the linked expense first to avoid orphans
      if (salaryRecord.expenseId) {
        await tx.expense.deleteMany({ where: { id: salaryRecord.expenseId } });
      }
      await tx.salaryRecord.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting salary record", error);
    return NextResponse.json(
      { error: "Failed to delete salary record" },
      { status: 500 }
    );
  }
}
