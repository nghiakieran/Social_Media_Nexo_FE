import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface InstagramStoryRingProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  hasStory?: boolean;
  hasUnread?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const InstagramStoryRing: React.FC<InstagramStoryRingProps> = ({
  src,
  alt,
  size = "md",
  hasStory = false,
  hasUnread = false,
  className,
  children,
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const ringPadding = {
    sm: "p-0.5",
    md: "p-0.5",
    lg: "p-1",
  };

  if (!hasStory) {
    return (
      <div className={cn("relative", className)}>
        <Avatar className={cn(sizeClasses[size])}>
          <AvatarImage src={src} alt={alt} />
          <AvatarFallback>{(alt ?? "").charAt(0)}</AvatarFallback>
        </Avatar>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "rounded-full",
          ringPadding[size],
          
        )}
      >
        <div className={cn("rounded-full bg-background", ringPadding[size])}>
          <Avatar className={cn(sizeClasses[size])}>
            <AvatarImage src={src} alt={alt} />
            <AvatarFallback>{(alt ?? "").charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      {children}
    </div>
  );
};
