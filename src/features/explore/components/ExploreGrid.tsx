import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExplorePost } from '../exploreSlice';
import { Heart, MessageCircle, Play, Copy } from 'lucide-react';
import { LazyImage } from '@/components/common/LazyImage';

interface ExploreGridProps {
  posts: ExplorePost[];
  onPostClick?: (post: ExplorePost) => void;
  className?: string;
}

export const ExploreGrid: React.FC<ExploreGridProps> = ({
  posts,
  onPostClick,
  className,
}) => {
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  const handlePostClick = (post: ExplorePost) => {
    onPostClick?.(post);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-1 space-y-1">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="relative break-inside-avoid cursor-pointer group"
            onClick={() => handlePostClick(post)}
            onMouseEnter={() => setHoveredPost(post.id)}
            onMouseLeave={() => setHoveredPost(null)}
          >
            {/* Post Image/Video Container */}
            <div className="relative overflow-hidden rounded-sm bg-muted">
              <LazyImage
                src={post.imageUrl}
                alt={post.caption || `Post by ${post.author.username}`}
                className={cn(
                  'w-full h-auto',
                )}
                loading="lazy"
                decoding="async"
                enableProgressiveLoading
              />

              {/* Video/Carousel Indicators */}
              {post.type === 'video' && (
                <div className="absolute top-2 right-2">
                  <div className="bg-black/70 rounded-full p-1">
                    <Play className="h-3 w-3 text-white fill-white" />
                  </div>
                </div>
              )}

              {post.type === 'carousel' && (
                <div className="absolute top-2 right-2">
                  <div className="bg-black/70 rounded-full p-1">
                    <Copy className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}

              {/* Hover Overlay */}
              <div
                className={cn(
                  'absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300',
                  hoveredPost === post.id ? 'opacity-100' : 'opacity-0'
                )}
              >
                <div className="flex items-center space-x-4 text-white">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-5 w-5 fill-white" />
                    <span className="font-semibold">
                      {post.likesCount >= 1000 
                        ? `${(post.likesCount / 1000).toFixed(1)}k`
                        : post.likesCount
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-5 w-5 fill-white" />
                    <span className="font-semibold">
                      {post.commentsCount >= 1000 
                        ? `${(post.commentsCount / 1000).toFixed(1)}k`
                        : post.commentsCount
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Loaders for more posts */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-1 space-y-1 mt-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="break-inside-avoid"
          >
            <div 
              className="w-full bg-muted rounded-sm animate-pulse"
              style={{ 
                height: `${Math.floor(Math.random() * 200) + 200}px` 
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};