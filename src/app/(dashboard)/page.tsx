import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your company finances",
};

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <DashboardContent />;
}
