import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { PARTNERS } from "@/lib/constants";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Delete old receipt from Cloudinary if receipt is being removed or replaced
    const isRemovingReceipt = validatedData.receiptUrl === null || validatedData.receiptPublicId === null;
    const isReplacingReceipt = validatedData.receiptPublicId !== undefined && 
                                validatedData.receiptPublicId !== null && 
                                existingExpense.receiptPublicId &&
                                validatedData.receiptPublicId !== existingExpense.receiptPublicId;

    if ((isRemovingReceipt || isReplacingReceipt) && existingExpense.receiptPublicId) {
      try {
        // Validate Cloudinary configuration
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          // Delete the old image from Cloudinary
          await new Promise<void>((resolve) => {
            cloudinary.uploader.destroy(
              existingExpense.receiptPublicId!,
              { resource_type: "auto" }, // Handle both images and PDFs
              (error, result) => {
                if (error) {
                  console.error("Error deleting old image from Cloudinary:", error);
                  // Don't fail the update if Cloudinary deletion fails
                  resolve(); // Continue with database update
                } else {
                  console.log("Successfully deleted old image from Cloudinary:", result);
                  resolve();
                }
              }
            );
          });
        }
      } catch (cloudinaryError) {
        // Log error but continue with database update
        console.error("Error during Cloudinary deletion during update:", cloudinaryError);
      }
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

    // Delete associated receipt from Cloudinary if it exists
    if (expense.receiptPublicId) {
      // Validate Cloudinary configuration
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("❌ Cloudinary configuration missing - cannot delete image. Expense will still be deleted from database.");
        console.error("Missing env vars:", {
          hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
          hasApiKey: !!process.env.CLOUDINARY_API_KEY,
          hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
        });
      } else {
        try {
          console.log(`🗑️  Attempting to delete Cloudinary image with public_id: ${expense.receiptPublicId}`);
          
          // Delete the image from Cloudinary using the stored public_id
          // The public_id includes the folder path (e.g., "expense-receipts/expense-userId-timestamp")
          const deleteResult = await new Promise<{ result: string }>((resolve, reject) => {
            cloudinary.uploader.destroy(
              expense.receiptPublicId!,
              { resource_type: "auto" }, // Handle both images and PDFs
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result as { result: string });
                }
              }
            );
          });

          if (deleteResult.result === "ok" || deleteResult.result === "not found") {
            console.log(`✅ Successfully deleted Cloudinary image: ${expense.receiptPublicId} (result: ${deleteResult.result})`);
          } else {
            console.warn(`⚠️  Cloudinary deletion returned unexpected result: ${deleteResult.result} for public_id: ${expense.receiptPublicId}`);
          }
        } catch (cloudinaryError) {
          // Log detailed error information
          console.error("❌ Error deleting image from Cloudinary:", {
            publicId: expense.receiptPublicId,
            error: cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError),
            stack: cloudinaryError instanceof Error ? cloudinaryError.stack : undefined,
          });
          // Continue with database deletion even if Cloudinary deletion fails
          // The image might have already been deleted or the public_id might be invalid
        }
      }
    } else {
      console.log("ℹ️  No receiptPublicId found for expense, skipping Cloudinary deletion");
    }

    // Delete the expense from the database
    await db.expense.delete({
      where: { id },
    });

    console.log(`✅ Successfully deleted expense ${id} from database`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting expense:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

