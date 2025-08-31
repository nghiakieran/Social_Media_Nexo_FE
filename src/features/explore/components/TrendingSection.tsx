import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TrendingUp, Hash, ArrowRight, Sparkles } from 'lucide-react';
import { Hashtag } from '../exploreSlice';
import { HashtagChip } from './HashtagChip';

interface TrendingSectionProps {
  hashtags: Hashtag[];
  onHashtagClick?: (hashtag: Hashtag) => void;
  onFollowHashtag?: (hashtagId: string) => void;
  onViewAll?: () => void;
  title?: string;
  className?: string;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  hashtags,
  onHashtagClick,
  onFollowHashtag,
  onViewAll,
  title = "Trending",
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

  const trendingHashtags = hashtags
    .filter(h => h.category === 'trending')
    .slice(0, 6);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg instagram-gradient flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold">{title}</h2>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-primary hover:text-primary/80"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Trending Grid */}
      <div className="space-y-3">
        {trendingHashtags.map((hashtag, index) => (
          <div
            key={hashtag.id}
            className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group"
            onClick={() => onHashtagClick?.(hashtag)}
          >
            <div className="flex items-center space-x-3">
              {/* Ranking Number */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {index + 1}
                </span>
              </div>
              
              {/* Hashtag Info */}
              <div>
                <div className="flex items-center space-x-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold group-hover:text-primary transition-colors">
                    {hashtag.name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCount(hashtag.postsCount)} posts
                </p>
              </div>
            </div>

            {/* Follow Button */}
            <Button
              variant={hashtag.isFollowing ? "secondary" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFollowHashtag?.(hashtag.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {hashtag.isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        ))}
      </div>

      {/* Quick Hashtag Chips */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Popular categories</h3>
        <div className="flex flex-wrap gap-2">
          {['fashion', 'food', 'sports', 'entertainment'].map((category) => {
            const categoryHashtags = hashtags.filter(h => h.category === category);
            if (categoryHashtags.length === 0) return null;
            
            const representativeHashtag = categoryHashtags[0];
            
            return (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => onHashtagClick?.(representativeHashtag)}
                className="rounded-full text-xs h-8 px-3 capitalize"
              >
                <Hash className="h-3 w-3 mr-1" />
                {category}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};