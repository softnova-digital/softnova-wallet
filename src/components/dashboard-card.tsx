import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
        "card-interactive hover-lift animate-fade-in-up overflow-hidden relative",
        className
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-full text-xs transition-all",
                  trend.isPositive 
                    ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-400/10" 
                    : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-400/10"
                )}
              >
                <svg 
                  className={cn("w-3 h-3", !trend.isPositive && "rotate-180")} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {Math.abs(trend.value)}%
              </span>
            )}
            <span className="text-muted-foreground">{description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
