"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { ArrowRight } from "lucide-react";

interface ExpenseWithCategory {
  id: string;
  amount: number;
  description: string | null; // Description is now optional
  date: Date;
  payee: string;
  userName: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  labels: {
    label: {
      name: string;
      color: string;
    };
  }[];
}

interface RecentExpensesProps {
  expenses: ExpenseWithCategory[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  if (expenses.length === 0) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses yet.</p>
            <Link href="/expenses" className="text-primary hover:underline inline-flex items-center gap-1 mt-2 group">
              Add your first expense
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up overflow-hidden" style={{ animationDelay: "400ms" }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Expenses</CardTitle>
        <Link
          href="/expenses"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense, index) => {
            const IconComponent = getCategoryIcon(expense.category.icon);
            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-accent/50 hover:bg-accent transition-all duration-200 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${450 + index * 75}ms` }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className="p-2 sm:p-2.5 rounded-xl shrink-0 transition-transform duration-200 hover:scale-110"
                    style={{ backgroundColor: expense.category.color + "20" }}
                  >
                    <IconComponent
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      style={{ color: expense.category.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-sm sm:text-base">
                      {expense.description || "No description"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="truncate max-w-[80px] sm:max-w-none">{expense.payee}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{format(new Date(expense.date), "MMM d, yyyy")}</span>
                      <span className="sm:hidden">{format(new Date(expense.date), "MMM d")}</span>
                    </div>
                    {expense.labels.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {expense.labels.slice(0, 2).map(({ label }) => (
                          <Badge
                            key={label.name}
                            variant="outline"
                            style={{
                              borderColor: label.color,
                              color: label.color,
                            }}
                            className="text-xs py-0"
                          >
                            {label.name}
                          </Badge>
                        ))}
                        {expense.labels.length > 2 && (
                          <Badge variant="outline" className="text-xs py-0">
                            +{expense.labels.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-semibold text-sm sm:text-base">
                    ₹{expense.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: expense.category.color + "20",
                      color: expense.category.color,
                    }}
                    className="text-xs mt-1 hidden sm:inline-flex"
                  >
                    {expense.category.name}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
