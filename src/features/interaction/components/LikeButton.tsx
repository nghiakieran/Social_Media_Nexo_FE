import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const LikeButton = ({ 
  isLiked, 
  likesCount, 
  onToggle, 
  size = 'md',
  showCount = true 
}: LikeButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizes = {
    sm: 'h-6 w-6 p-0',
    md: 'h-8 w-8 p-0',
    lg: 'h-10 w-10 p-0',
  };

  const handleClick = () => {
    onToggle();
    setIsAnimating(true);
    
    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 600);

    // Show toast for like action
    if (!isLiked) {
      toast({
        title: "❤️ Đã thích!",
        duration: 1500,
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`${buttonSizes[size]} relative overflow-hidden ${
          isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
        }`}
        onClick={handleClick}
      >
        <Heart 
          className={`
            ${sizeClasses[size]} 
            ${isLiked ? 'fill-current' : ''} 
            transition-all duration-200
            ${isAnimating ? 'animate-bounce scale-125' : ''}
          `} 
        />
        
        {/* Heart explosion effect */}
        {isAnimating && isLiked && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart 
                  className={`
                    w-3 h-3 fill-red-500 text-red-500 absolute
                    animate-ping opacity-75
                  `}
                  style={{
                    transform: `rotate(${i * 60}deg) translateY(-20px)`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '600ms',
                  }}
                />
              </div>
            ))}
          </>
        )}
      </Button>
      
      {showCount && likesCount > 0 && (
        <span className={`
          font-medium transition-all duration-200
          ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
          ${isAnimating ? 'scale-110' : ''}
        `}>
          {likesCount.toLocaleString()}
        </span>
      )}
    </div>
  );
};