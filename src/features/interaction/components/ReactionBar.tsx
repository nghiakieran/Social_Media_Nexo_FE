import { useState } from 'react';
import { Smile, Heart, ThumbsUp, Laugh, Angry, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

const reactions = [
  { emoji: '❤️', label: 'Thích', icon: Heart, color: 'text-red-500' },
  { emoji: '👍', label: 'Tuyệt', icon: ThumbsUp, color: 'text-blue-500' },
  { emoji: '😂', label: 'Haha', icon: Laugh, color: 'text-yellow-500' },
  { emoji: '😮', label: 'Wow', icon: Smile, color: 'text-orange-500' },
  { emoji: '😢', label: 'Buồn', icon: Frown, color: 'text-gray-500' },
  { emoji: '😡', label: 'Phẫn nộ', icon: Angry, color: 'text-red-600' },
];

interface ReactionBarProps {
  targetId: string; // postId or commentId
  currentReaction?: string;
  reactions: { [emoji: string]: number };
  onReactionToggle: (emoji: string) => void;
  size?: 'sm' | 'md';
}

export const ReactionBar = ({ 
  targetId, 
  currentReaction, 
  reactions: reactionCounts, 
  onReactionToggle,
  size = 'md' 
}: ReactionBarProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isAnimating, setIsAnimating] = useState<string | null>(null);
  const { toast } = useToast();

  const handleReaction = (emoji: string) => {
    setIsAnimating(emoji);
    onReactionToggle(emoji);
    setShowPicker(false);
    
    // Reset animation
    setTimeout(() => setIsAnimating(null), 600);
    
    const reaction = reactions.find(r => r.emoji === emoji);
    toast({
      title: `${emoji} ${reaction?.label}!`,
      duration: 1500,
    });
  };

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  const topReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0';

  return (
    <div className="flex items-center gap-2">
      {/* Reaction Picker */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`${buttonSize} ${currentReaction ? 'text-primary' : ''}`}
          >
            {currentReaction ? (
              <span className={`text-lg ${isAnimating === currentReaction ? 'animate-bounce' : ''}`}>
                {currentReaction}
              </span>
            ) : (
              <Smile className={sizeClasses} />
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={`
                  p-2 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-110
                  ${currentReaction === reaction.emoji ? 'bg-primary/10 ring-2 ring-primary/20' : ''}
                `}
                title={reaction.label}
              >
                <span className="text-xl">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Reaction Count Summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1">
          {/* Top Reaction Emojis */}
          <div className="flex -space-x-1">
            {topReactions.map(([emoji], index) => (
              <div
                key={emoji}
                className={`
                  relative z-${10 + index} w-5 h-5 rounded-full bg-background border border-border 
                  flex items-center justify-center text-xs
                `}
              >
                {emoji}
              </div>
            ))}
          </div>
          
          {/* Total Count */}
          <span className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            {totalReactions}
          </span>
        </div>
      )}
    </div>
  );
};