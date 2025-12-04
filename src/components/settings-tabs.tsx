"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesList } from "@/components/categories-list";
import { AddCategoryButton } from "@/components/add-category-button";
import { LabelsList } from "@/components/labels-list";
import { AddLabelButton } from "@/components/add-label-button";
import type { Category, Label } from "@/types";

interface SettingsTabsProps {
  expenseCategories: Category[];
  incomeCategories: Category[];
  labels: Label[];
}

export function SettingsTabs({ expenseCategories, incomeCategories, labels }: SettingsTabsProps) {
  // Get initial tab from URL hash, default to expense-categories
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "expense-categories" || hash === "income-categories" || hash === "labels") {
        return hash;
      }
    }
    return "expense-categories";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    // Handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "expense-categories" || hash === "income-categories" || hash === "labels") {
        setActiveTab(hash);
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL hash without scrolling
    window.history.replaceState(null, "", `#${value}`);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="expense-categories">Expense Categories</TabsTrigger>
        <TabsTrigger value="income-categories">Income Categories</TabsTrigger>
        <TabsTrigger value="labels">Labels</TabsTrigger>
      </TabsList>

      <TabsContent value="expense-categories" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Manage categories for your expenses
              </CardDescription>
            </div>
            <AddCategoryButton defaultType="EXPENSE" />
          </CardHeader>
          <CardContent>
            <CategoriesList categories={expenseCategories} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="income-categories" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Income Categories</CardTitle>
              <CardDescription>
                Manage categories for your income sources
              </CardDescription>
            </div>
            <AddCategoryButton defaultType="INCOME" />
          </CardHeader>
          <CardContent>
            <CategoriesList categories={incomeCategories} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="labels" className="space-y-4">
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
      </TabsContent>
    </Tabs>
  );
}

