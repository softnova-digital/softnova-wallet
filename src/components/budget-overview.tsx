"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, TrendingUp } from "lucide-react";

interface Budget {
  id: string;
  amount: number;
  period: string;
  spent?: number;
  category?: {
    name: string;
    color: string;
  } | null;
}

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  if (budgets.length === 0) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No budgets set.</p>
            <Link href="/budgets" className="text-primary hover:underline inline-flex items-center gap-1 mt-2 group">
              Create your first budget
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Budget Overview
        </CardTitle>
        <Link href="/budgets" className="text-sm text-primary hover:underline inline-flex items-center gap-1 group">
          Manage
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.slice(0, 4).map((budget, index) => {
          const spent = budget.spent || 0;
          const percentage = (spent / budget.amount) * 100;
          const isOverBudget = percentage >= 100;
          const isWarning = percentage >= 80 && percentage < 100;

          return (
            <div 
              key={budget.id} 
              className="space-y-2.5 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors animate-fade-in-up"
              style={{ animationDelay: `${350 + index * 75}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: budget.category?.color || "#2ECC71" }}
                  />
                  <span className="font-medium text-sm sm:text-base">
                    {budget.category?.name || "Overall"}
                  </span>
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                    {budget.period}
                  </Badge>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">₹{spent.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</span>
                  <span className="hidden sm:inline"> / ₹{budget.amount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</span>
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={Math.min(percentage, 100)}
                  className={cn(
                    "h-2 animate-progress-fill",
                    isOverBudget
                      ? "[&>div]:bg-destructive"
                      : isWarning
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-primary"
                  )}
                />
                {(isOverBudget || isWarning) && (
                  <span 
                    className={cn(
                      "absolute right-0 -top-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
                      isOverBudget ? "text-destructive bg-destructive/10" : "text-yellow-600 bg-yellow-500/10"
                    )}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
