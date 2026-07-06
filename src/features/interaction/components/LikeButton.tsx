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
  onLikeSuccess?: (isLiked: boolean, newCount: number) => void;
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
  onLikeSuccess,
  children,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [localIsLiked, setLocalIsLiked] = React.useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = React.useState(likesCount);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);
  const processingRef = React.useRef(false);

  // Sync state from props ONLY when not interacting
  React.useEffect(() => {
    if (!processingRef.current && !debounceRef.current) {
      setLocalIsLiked(isLiked);
      setLocalLikesCount(likesCount);
    }
  }, [isLiked, likesCount]);

  const handleLike = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newIsLiked = !localIsLiked;
    const newCount = newIsLiked ? localLikesCount + 1 : localLikesCount - 1;

    // Update local state immediately (Optimistic UI)
    setLocalIsLiked(newIsLiked);
    setLocalLikesCount(newCount);

    // Call parent listener if any
    onLikeChange?.(newIsLiked, newCount);

    // Debounce the actual API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      // If the state returned to initial, don't call API
      if (newIsLiked === isLiked) {
        debounceRef.current = null;
        return;
      }

      processingRef.current = true;
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
        // Call success callback after the API succeeds
        onLikeSuccess?.(newIsLiked, newCount);
      } catch (error) {
        // Rollback on error
        setLocalIsLiked(isLiked);
        setLocalLikesCount(likesCount);
        onLikeChange?.(isLiked, likesCount);

        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error as string,
        });
      } finally {
        processingRef.current = false;
        debounceRef.current = null;
      }
    }, 500);
  };

  // Size configurations
  const sizeConfig = {
    sm: { button: "h-8 min-w-[32px]", icon: "w-4 h-4" },
    md: { button: "h-10 min-w-[40px]", icon: "w-5 h-5" },
    lg: { button: "h-12 min-w-[48px]", icon: "w-6 h-6" },
  };

  const currentSize = sizeConfig[size] || sizeConfig["md"];

  return (
    <button
      onClick={handleLike}
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "select-none touch-manipulation transition-all duration-200",
        "text-foreground hover:bg-muted/50 active:scale-95",
        !children && currentSize.button,
        !children && "rounded-full",
        className,
        localIsLiked && "text-red-500 hover:text-red-600 dark:text-red-500 dark:hover:text-red-600"
      )}
    >
      <Heart
        className={cn(
          currentSize.icon,
          "transition-transform",
          localIsLiked && "fill-current scale-110"
        )}
      />
      {showCount && localLikesCount > 0 && (
        <span className="text-sm font-medium">{formatNumber(localLikesCount)}</span>
      )}
      {children}
    </button>
  );
};
