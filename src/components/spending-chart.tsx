"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface SpendingChartProps {
  data: ChartData[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <Card className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center">
                <PieChartIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p>No spending data yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Add expenses to see your spending breakdown
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="animate-fade-in-up overflow-hidden"
      style={{ animationDelay: "50ms" }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col min-w-0">
          {/* Chart — fixed height so it never competes with the legend */}
          <div className="h-[200px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={300}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="transition-opacity duration-150 hover:opacity-80"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const chartData = payload[0].payload as ChartData;
                      return (
                        <div className="bg-popover border border-border rounded-xl p-3 shadow-xl animate-scale-in">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: chartData.color }}
                            />
                            <p className="font-medium">{chartData.name}</p>
                          </div>
                          <p className="text-primary font-semibold text-lg mt-1">
                            ₹
                            {chartData.value.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legend — lives outside the fixed-height chart box */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 pt-1 pb-1">
            {data.map((entry, index) => (
              <div
                key={`legend-${index}`}
                className="flex items-center gap-1.5 min-w-0"
              >
                <span
                  className="shrink-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-foreground text-xs sm:text-sm leading-tight truncate max-w-[120px] sm:max-w-none">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
