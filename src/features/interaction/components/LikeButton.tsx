import React from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useAppDispatch } from "@/store";
import {
  likePostThunk,
  likeCommentThunk,
  likeReelThunk,
} from "../interactionSlice";
import { formatNumber } from "@/utils/constants";

interface LikeButtonProps {
  targetId: number;
  targetType: "post" | "comment" | "reel";
  isLiked: boolean;
  likesCount: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onLikeChange?: (isLiked: boolean, newCount: number) => void;
  children?: React.ReactNode;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  targetId,
  targetType,
  isLiked,
  likesCount,
  showCount = true,
  size = "md",
  className,
  onLikeChange,
  children,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      let thunk;

      switch (targetType) {
        case "post":
          thunk = likePostThunk(targetId);
          break;
        case "comment":
          thunk = likeCommentThunk(targetId);
          break;
        case "reel":
          thunk = likeReelThunk(targetId);
          break;
        default:
          throw new Error("Invalid target type");
      }

      await dispatch(thunk).unwrap();

      // Callback for optimistic updates
      onLikeChange?.(!isLiked, isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error as string,
      });
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: { button: "h-6 w-6", icon: "w-4 h-4" },
    md: { button: "h-9 w-9", icon: "w-6 h-6" },
    lg: { button: "h-12 w-12", icon: "w-8 h-8" },
  };

const currentSize = sizeConfig[size] || sizeConfig["md"];

  return (
  <button
    onClick={handleLike}
    type="button"
    className={cn(
        currentSize.button,
        "inline-flex items-center justify-center gap-1",
      "select-none touch-manipulation",
      "text-foreground hover:opacity-80 active:opacity-60",
      "transition-opacity",
      isLiked && "text-red-500 hover:text-red-600",
      className
    )}
  >
    <Heart className={cn(currentSize.icon, isLiked && "fill-current")} />
    {showCount && likesCount > 0 && (
      <span className="text-sm mt-1">{formatNumber(likesCount)}</span>
    )}
    {children}
  </button>
  );
};
