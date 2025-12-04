import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optimized Prisma Client configuration for production and Vercel
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Optimize connection pool for serverless environments
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Graceful shutdown for production
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await db.$disconnect();
  });
}

