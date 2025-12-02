import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LabelsList } from "@/components/labels-list";
import { AddLabelButton } from "@/components/add-label-button";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const labels = await db.label.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your expense tracking preferences
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Labels</CardTitle>
            <CardDescription>
              Create custom labels to tag your expenses for better organization
            </CardDescription>
          </div>
          <AddLabelButton />
        </CardHeader>
        <CardContent>
          <LabelsList labels={labels} />
        </CardContent>
      </Card>
    </div>
  );
}

