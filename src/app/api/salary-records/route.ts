import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { PARTNERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SALARY_CATEGORY_ID = "salary";

const createSalaryRecordSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string(),
  remarks: z.string().optional(),
});

async function ensureSalaryCategory() {
  return db.category.upsert({
    where: { id: SALARY_CATEGORY_ID },
    update: {},
    create: {
      id: SALARY_CATEGORY_ID,
      name: "Salary",
      type: "EXPENSE",
      icon: "users",
      color: "#8E44AD",
      isDefault: true,
    },
  });
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const where: Record<string, unknown> = {};

    if (employeeId) where.employeeId = employeeId;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const [salaryRecords, total] = await Promise.all([
      db.salaryRecord.findMany({
        where,
        include: {
          employee: true,
        },
        orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.salaryRecord.count({ where }),
    ]);

    return NextResponse.json(
      {
        salaryRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Error fetching salary records:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary records" },
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
    const validatedData = createSalaryRecordSchema.parse(body);

    // Verify employee exists and is active
    const employee = await db.employee.findUnique({
      where: { id: validatedData.employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (!employee.isActive) {
      return NextResponse.json(
        { error: "Cannot add salary for an inactive employee" },
        { status: 400 }
      );
    }

    // Enforce: one salary record per employee per month
    const existing = await db.salaryRecord.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: validatedData.employeeId,
          month: validatedData.month,
          year: validatedData.year,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: `A salary record for ${employee.name} in ${MONTH_NAMES[validatedData.month - 1]} ${validatedData.year} already exists. Edit or delete the existing record.`,
          existingId: existing.id,
        },
        { status: 409 }
      );
    }

    const userName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.emailAddresses[0]?.emailAddress ||
      "Unknown";

    // Ensure the Salary category exists
    await ensureSalaryCategory();

    // Determine payee — use first PARTNER as the default company payee
    const companyPayee = PARTNERS[2]; // "Softnova Digital"

    const description = `Salary – ${employee.name} (${MONTH_NAMES[validatedData.month - 1]} ${validatedData.year})`;

    // Create expense and salary record in a transaction
    const salaryRecord = await db.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          amount: validatedData.amount,
          description,
          date: new Date(validatedData.paymentDate),
          payee: companyPayee,
          categoryId: SALARY_CATEGORY_ID,
          userId,
          userName,
        },
      });

      return tx.salaryRecord.create({
        data: {
          employeeId: validatedData.employeeId,
          month: validatedData.month,
          year: validatedData.year,
          amount: validatedData.amount,
          paymentDate: new Date(validatedData.paymentDate),
          remarks: validatedData.remarks || null,
          expenseId: expense.id,
          userId,
          userName,
        },
        include: { employee: true },
      });
    });

    return NextResponse.json(salaryRecord, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating salary record:", error);
    return NextResponse.json(
      { error: "Failed to create salary record" },
      { status: 500 }
    );
  }
}
