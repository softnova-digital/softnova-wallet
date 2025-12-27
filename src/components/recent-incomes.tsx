"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { ArrowRight, CircleArrowDown } from "lucide-react";

interface IncomeWithCategory {
  id: string;
  amount: number;
  description: string;
  date: Date;
  source: string;
  userName: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface RecentIncomesProps {
  incomes: IncomeWithCategory[];
}

export const RecentIncomes = memo(function RecentIncomes({ incomes }: RecentIncomesProps) {
  if (incomes.length === 0) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleArrowDown className="h-5 w-5 text-blue-500" />
            Recent Incomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No incomes yet.</p>
            <Link href="/incomes" className="text-blue-500 hover:underline inline-flex items-center gap-1 mt-2 group">
              Add your first income
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
        <CardTitle className="flex items-center gap-2">
          <CircleArrowDown className="h-5 w-5 text-blue-500" />
          Recent Incomes
        </CardTitle>
        <Link
          href="/incomes"
          className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1 group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incomes.map((income, index) => {
            const IconComponent = getCategoryIcon(income.category.icon);
            return (
              <div
                key={income.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-200 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${450 + index * 75}ms` }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className="p-2 sm:p-2.5 rounded-xl shrink-0 transition-transform duration-200 hover:scale-110"
                    style={{ backgroundColor: income.category.color + "20" }}
                  >
                    <IconComponent
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      style={{ color: income.category.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-sm sm:text-base">{income.description}</p>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="truncate max-w-[80px] sm:max-w-none">{income.source}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{format(new Date(income.date), "MMM d, yyyy")}</span>
                      <span className="sm:hidden">{format(new Date(income.date), "MMM d")}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-semibold text-sm sm:text-base text-green-600">
                    +₹{income.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: income.category.color + "20",
                      color: income.category.color,
                    }}
                    className="text-xs mt-1 hidden sm:inline-flex"
                  >
                    {income.category.name}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});



