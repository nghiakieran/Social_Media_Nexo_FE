import React from "react";
import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  if (!isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-full border-2 border-background bg-success",
        sizeClasses[size],
        className
      )}
    />
  );
};
