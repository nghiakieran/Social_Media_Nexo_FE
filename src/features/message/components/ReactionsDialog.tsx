import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ReactionDetailDTO } from "../types";

interface ReactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reactions: ReactionDetailDTO[];
  loading: boolean;
  onRemoveReaction: (messageId: string, reactionType: string) => void;
  userId?: number;
  messageId: string;
}

export const ReactionsDialog: React.FC<ReactionsDialogProps> = ({
  open,
  onOpenChange,
  reactions,
  loading,
  onRemoveReaction,
  userId,
  messageId,
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleRemoveReaction = (reactionType: string) => {
    handleClose();
    onRemoveReaction(messageId, reactionType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cảm xúc</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            </div>
          ) : reactions.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-sm text-muted-foreground">Chưa có cảm xúc</p>
            </div>
          ) : (
            reactions.map((reaction) => (
              <div
                key={`${reaction.userId}-${reaction.reactionType}`}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  reaction.userId === userId
                    ? "hover:bg-muted cursor-pointer"
                    : "cursor-default"
                )}
                onClick={() => {
                  if (reaction.userId === userId) {
                    handleRemoveReaction(reaction.reactionType);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={reaction.avatarUrl}
                      alt={reaction.fullName}
                    />
                    <AvatarFallback>
                      {reaction.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{reaction.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {reaction.userId === userId
                        ? "Chọn để gỡ"
                        : `@${reaction.username}`}
                    </p>
                  </div>
                </div>
                <span className="text-2xl">
                  {reaction.reactionType === "LIKE"
                    ? "👍"
                    : reaction.reactionType === "LOVE"
                    ? "❤️"
                    : reaction.reactionType === "HAHA"
                    ? "😂"
                    : reaction.reactionType === "WOW"
                    ? "😮"
                    : reaction.reactionType === "SAD"
                    ? "😢"
                    : reaction.reactionType === "ANGRY"
                    ? "😡"
                    : "🔥"}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
