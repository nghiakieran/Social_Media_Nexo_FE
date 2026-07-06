import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionsBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  activeFilter,
  onFilterChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "border-b border-primary/10 bg-background/95 px-3 py-2 backdrop-blur-sm md:px-2",
        className
      )}
    >
      <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Button
          variant={activeFilter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange("all")}
          className={cn(
            "h-8 shrink-0 rounded-full px-4 text-xs",
            activeFilter !== "all" && "hover:bg-primary/10 hover:text-primary"
          )}
        >
          Tất cả
        </Button>
        {/* <Button
          variant={activeFilter === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('unread')}
          className="rounded-full h-8 px-4 text-xs"
        >
          Chưa đọc
        </Button> */}
        {/* <Button
          variant={activeFilter === 'archived' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('archived')}
          className="rounded-full h-8 px-4 text-xs"
        >
          Kho lưu trữ
        </Button> */}
      </div>
    </div>
  );
};
