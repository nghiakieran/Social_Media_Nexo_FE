import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  trend: "up" | "down";
  gradient?: string;
}

export function StatsCard({ title, value, change, icon: Icon, trend, gradient }: StatsCardProps) {
  const isPositive = trend === "up";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground truncate mb-0.5">{title}</p>
            <h3 className="text-xl sm:text-3xl font-black tracking-tight text-foreground my-1 truncate">
              {value}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 mt-1.5">
              <span
                className={cn(
                  "text-xs sm:text-sm font-bold",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {isPositive ? "+" : ""}
                {Number(change).toFixed(1)}%
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                so với tháng trước
              </span>
            </div>
          </div>
          <div
            className={cn(
              "w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0",
              gradient || "bg-gradient-to-br from-primary to-accent"
            )}
          >
            <Icon className="w-5 h-5 sm:w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
