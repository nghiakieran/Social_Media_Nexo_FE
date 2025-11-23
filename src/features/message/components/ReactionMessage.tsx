import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { EReactionType } from "../types";
import { useAppSelector } from "@/store";

interface ReactionMessageProps {
  messageId: string;
  reactions?: { [userId: string]: string };
  onAddReaction: (reactionType: string) => void;
  onRemoveReaction: (reactionType: string) => void;
  className?: string;
  trigger?: React.ReactNode;
}

const REACTION_EMOJI_MAP: Record<EReactionType, string> = {
  [EReactionType.LIKE]: "👍",
  [EReactionType.LOVE]: "❤️",
  [EReactionType.HAHA]: "😂",
  [EReactionType.WOW]: "😮",
  [EReactionType.SAD]: "😢",
  [EReactionType.ANGRY]: "😡",
};

const REACTION_TYPES = [
  EReactionType.LIKE,
  EReactionType.LOVE,
  EReactionType.HAHA,
  EReactionType.WOW,
  EReactionType.SAD,
  EReactionType.ANGRY,
];

export const ReactionMessage: React.FC<ReactionMessageProps> = ({
  messageId,
  reactions = {},
  onAddReaction,
  onRemoveReaction,
  className,
  trigger,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  // Find current user's reaction
  const currentUserReaction = user?.id
    ? reactions[user.id.toString()]
    : reactions["currentUser"];
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <span className="text-sm">😊</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-1">
          {REACTION_TYPES.map((reactionType) => {
            const emoji = REACTION_EMOJI_MAP[reactionType];
            return (
              <Button
                key={reactionType}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 hover:bg-muted transition-all",
                  currentUserReaction === reactionType && 
                    "bg-primary/10 border-2 border-primary scale-110"
                )}
                onClick={() => {
                  if (currentUserReaction === reactionType) {
                    onRemoveReaction(reactionType);
                  } else {
                    onAddReaction(reactionType);
                  }
                  setOpen(false);
                }}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
