import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Hash, Plus, Check } from 'lucide-react';
import { Hashtag } from '../exploreSlice';

interface HashtagChipProps {
  hashtag: Hashtag;
  onFollow?: (hashtagId: string) => void;
  onClick?: (hashtag: Hashtag) => void;
  showFollowButton?: boolean;
  variant?: 'default' | 'minimal' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HashtagChip: React.FC<HashtagChipProps> = ({
  hashtag,
  onFollow,
  onClick,
  showFollowButton = true,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'trending':
        return 'bg-gradient-instagram text-white';
      case 'entertainment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'sports':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'news':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fashion':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'food':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onClick?.(hashtag)}
        className={cn(
          'h-auto p-2 justify-start text-left font-normal',
          className
        )}
      >
        <Hash className="h-4 w-4 mr-1 text-muted-foreground" />
        <span className="font-medium">#{hashtag.name}</span>
      </Button>
    );
  }

  if (variant === 'outlined') {
    return (
      <div
        className={cn(
          'border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors',
          className
        )}
        onClick={() => onClick?.(hashtag)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">#{hashtag.name}</span>
          </div>
          {showFollowButton && (
            <Button
              variant={hashtag.isFollowing ? "secondary" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFollow?.(hashtag.id);
              }}
              className="h-7 px-3"
            >
              {hashtag.isFollowing ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {formatCount(hashtag.postsCount)} posts
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:scale-105',
        className
      )}
      onClick={() => onClick?.(hashtag)}
    >
      <div className="bg-background border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-instagram flex items-center justify-center">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">#{hashtag.name}</h3>
              <Badge 
                variant="secondary" 
                className={cn('text-xs mt-1', getCategoryColor(hashtag.category))}
              >
                {hashtag.category}
              </Badge>
            </div>
          </div>
          
          {showFollowButton && (
            <Button
              variant={hashtag.isFollowing ? "secondary" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFollow?.(hashtag.id);
              }}
              className={cn(
                'h-7 px-3 transition-all duration-200',
                size === 'sm' && 'h-6 px-2 text-xs',
                size === 'lg' && 'h-8 px-4'
              )}
            >
              {hashtag.isFollowing ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground">
          {formatCount(hashtag.postsCount)} posts
        </p>
      </div>
    </div>
  );
};