import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Play } from 'lucide-react';
import { ExplorePost } from '../exploreSlice';

interface SuggestedPostCardProps {
  post: ExplorePost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  className?: string;
}

export const SuggestedPostCard: React.FC<SuggestedPostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onUserClick,
  className,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(post.id);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={cn('bg-background border border-border rounded-xl overflow-hidden', className)}>
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onUserClick?.(post.author.id)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.author.avatar} alt={post.author.username} />
            <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{post.author.username}</span>
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Media */}
      <div className="relative aspect-square">
        <img
          src={post.imageUrl}
          alt={post.caption || `Post by ${post.author.username}`}
          className="w-full h-full object-cover"
        />
        
        {/* Video/Carousel Indicators */}
        {post.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
        )}
        
        {post.type === 'carousel' && (
          <div className="absolute top-2 right-2">
            <div className="bg-black/70 rounded-full p-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 transition-colors',
                isLiked && 'text-red-500'
              )}
              onClick={handleLike}
            >
              <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onComment?.(post.id)}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onShare?.(post.id)}
            >
              <Share className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 transition-colors',
              isSaved && 'text-primary'
            )}
            onClick={handleSave}
          >
            <Bookmark className={cn('h-5 w-5', isSaved && 'fill-current')} />
          </Button>
        </div>

        {/* Like Count */}
        <p className="font-semibold text-sm mb-2">
          {formatCount(post.likesCount + (isLiked ? 1 : 0))} likes
        </p>

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold text-sm mr-2">{post.author.username}</span>
            <span className="text-sm">{post.caption}</span>
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.hashtags.slice(0, 3).map((hashtag, index) => (
              <span key={index} className="text-sm text-primary hover:underline cursor-pointer">
                {hashtag}
              </span>
            ))}
            {post.hashtags.length > 3 && (
              <span className="text-sm text-muted-foreground">
                +{post.hashtags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Comments */}
        {post.commentsCount > 0 && (
          <button 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onComment?.(post.id)}
          >
            View all {formatCount(post.commentsCount)} comments
          </button>
        )}
      </div>
    </div>
  );
};