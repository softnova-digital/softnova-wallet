import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  index?: number;
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  index = 0,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "card-interactive rounded-xl relative overflow-hidden gap-0 py-0",
        "animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Subtle top-edge glow for primary brand feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

      <CardContent className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 leading-none mt-0.5">
            {title}
          </p>
          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
          </div>
        </div>

        {/* Primary value */}
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-none mb-2.5">
          {value}
        </p>

        {/* Trend + description */}
        {(trend || description) && (
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                  trend.isPositive
                    ? "bg-success/12 text-success"
                    : "bg-destructive/12 text-destructive"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" strokeWidth={2} />
                ) : (
                  <TrendingDown className="w-3 h-3" strokeWidth={2} />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-[11px] text-muted-foreground truncate">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
