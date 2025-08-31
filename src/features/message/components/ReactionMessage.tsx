import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ReactionMessageProps {
  messageId: string;
  reactions?: { [userId: string]: string };
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: () => void;
  className?: string;
  trigger?: React.ReactNode;
}

export const ReactionMessage: React.FC<ReactionMessageProps> = ({
  messageId,
  reactions = {},
  onAddReaction,
  onRemoveReaction,
  className,
  trigger,
}) => {
  const reactionEmojis = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '💯', '🎉'];
  const currentUserReaction = reactions['currentUser'];
  
  // Group reactions by emoji
  const groupedReactions = Object.values(reactions).reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {} as { [emoji: string]: number });

  const hasReactions = Object.keys(groupedReactions).length > 0;

  return (
    <div className={cn('relative', className)}>
      {/* Reaction picker */}
      <Popover>
        <PopoverTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <span className="text-sm">😊</span>
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2">
          <div className="grid grid-cols-5 gap-1">
            {reactionEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-10 w-10 p-0 hover:bg-muted',
                  currentUserReaction === emoji && 'bg-muted'
                )}
                onClick={() => {
                  if (currentUserReaction === emoji) {
                    onRemoveReaction();
                  } else {
                    onAddReaction(emoji);
                  }
                }}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Display reactions */}
      {hasReactions && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(groupedReactions).map(([emoji, count]) => (
            <Button
              key={emoji}
              variant="outline"
              size="sm"
              className={cn(
                'h-6 px-2 text-xs rounded-full',
                currentUserReaction === emoji && 'bg-primary/10 border-primary'
              )}
              onClick={() => {
                if (currentUserReaction === emoji) {
                  onRemoveReaction();
                } else {
                  onAddReaction(emoji);
                }
              }}
            >
              <span>{emoji}</span>
              {count > 1 && <span className="ml-1">{count}</span>}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};