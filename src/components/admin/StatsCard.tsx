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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold mb-2">{value}</h3>
            <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {Number(change).toFixed(1)}%
                </span>
              <span className="text-xs text-muted-foreground">so với tháng trước</span>
            </div>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              gradient || "bg-gradient-to-br from-primary to-accent"
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
