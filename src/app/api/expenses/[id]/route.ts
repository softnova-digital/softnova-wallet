import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { PARTNERS } from "@/lib/constants";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "@/lib/logger";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional(), // Description is optional, can be empty
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
    // Safely try to get id for logging, but don't fail if params itself failed
    try {
      const { id } = await params;
      logger.error("Error fetching expense", error, { expenseId: id });
    } catch {
      logger.error("Error fetching expense", error);
    }
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
      const oldReceiptPublicId = existingExpense.receiptPublicId;
      try {
        // Validate Cloudinary configuration
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          // Delete the old image from Cloudinary
          await new Promise<void>((resolve) => {
            cloudinary.uploader.destroy(
              oldReceiptPublicId,
              { resource_type: "auto" }, // Handle both images and PDFs
              (error) => {
                if (error) {
                  logger.error("Error deleting old image from Cloudinary", error, { publicId: oldReceiptPublicId });
                  // Don't fail the update if Cloudinary deletion fails
                  resolve(); // Continue with database update
                } else {
                  logger.debug("Successfully deleted old image from Cloudinary", { publicId: oldReceiptPublicId });
                  resolve();
                }
              }
            );
          });
        }
      } catch (cloudinaryError) {
        // Log error but continue with database update
        logger.error("Error during Cloudinary deletion during update", cloudinaryError, { expenseId: id, publicId: oldReceiptPublicId });
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
    // Safely try to get id for logging, but don't fail if params itself failed
    try {
      const { id } = await params;
      logger.error("Error updating expense", error, { expenseId: id });
    } catch {
      logger.error("Error updating expense", error);
    }
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
        logger.warn("Cloudinary configuration missing - cannot delete image. Expense will still be deleted from database.", {
          hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
          hasApiKey: !!process.env.CLOUDINARY_API_KEY,
          hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
        });
      } else {
        try {
          logger.debug("Attempting to delete Cloudinary image", { publicId: expense.receiptPublicId });
          
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
            logger.debug("Successfully deleted Cloudinary image", { publicId: expense.receiptPublicId, result: deleteResult.result });
          } else {
            logger.warn("Cloudinary deletion returned unexpected result", { publicId: expense.receiptPublicId, result: deleteResult.result });
          }
        } catch (cloudinaryError) {
          // Log detailed error information
          logger.error("Error deleting image from Cloudinary", cloudinaryError, {
            publicId: expense.receiptPublicId,
          });
          // Continue with database deletion even if Cloudinary deletion fails
          // The image might have already been deleted or the public_id might be invalid
        }
      }
    } else {
      logger.debug("No receiptPublicId found for expense, skipping Cloudinary deletion", { expenseId: id });
    }

    // Delete the expense from the database
    await db.expense.delete({
      where: { id },
    });

    logger.debug("Successfully deleted expense from database", { expenseId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    // Safely try to get id for logging, but don't fail if params itself failed
    try {
      const { id } = await params;
      logger.error("Error deleting expense", error, { expenseId: id });
    } catch {
      logger.error("Error deleting expense", error);
    }
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

