import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SalaryRecordsPageClient } from "@/components/salary-records-page-client";
import { SalaryRecordsList } from "@/components/salary-records-list";

export const metadata: Metadata = {
  title: "Salary Records",
  description: "Track and manage employee salary payments",
};

export default async function SalaryRecordsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const employees = await db.employee.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <SalaryRecordsPageClient employees={employees} />
      <SalaryRecordsList employees={employees} />
    </div>
  );
}
