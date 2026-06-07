import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { EmployeesPageClient } from "@/components/employees-page-client";
import { EmployeesList } from "@/components/employees-list";

export const metadata: Metadata = {
  title: "Employees",
  description: "Manage your team members and employee records",
};

export default async function EmployeesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <EmployeesPageClient />
      <EmployeesList />
    </div>
  );
}
