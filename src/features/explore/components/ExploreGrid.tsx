import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ExplorePost } from "../types";
import { Heart, MessageCircle, Play, Copy } from "lucide-react";
import { LazyImage } from "@/components/common/LazyImage";
import { SimpleVideoPreview } from "@/components/common/SimpleVideoPreview";

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
    <div className={cn("w-full", className)}>
      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-2 space-y-2">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="relative break-inside-avoid cursor-pointer group"
            onClick={() => handlePostClick(post)}
            onMouseEnter={() => setHoveredPost(post.id)}
            onMouseLeave={() => setHoveredPost(null)}
          >
            {/* Post Image/Video Container */}
            <div className="relative overflow-hidden rounded-lg bg-muted shadow-sm hover:shadow-md transition-shadow duration-300">
              {post.media.length > 0 && (
                <>
                  {post.media[0].type === "image" ? (
                    <LazyImage
                      src={post.media[0].url}
                      alt={post.caption || `Post by ${post.userName}`}
                      className="w-full h-auto"
                      loading="lazy"
                      decoding="async"
                      enableProgressiveLoading
                    />
                  ) : (
                    <SimpleVideoPreview
                      videoUrl={post.media[0].url}
                      className="w-full h-auto"
                    />
                  )}
                </>
              )}

              {/* Video/Carousel Indicators */}
              {post.media.length > 0 && post.media[0].type === "video" && (
                <div className="absolute top-3 right-3">
                  <div className="bg-black/80 rounded-full p-1.5 backdrop-blur-sm">
                    <Play className="h-3 w-3 text-white fill-white" />
                  </div>
                </div>
              )}

              {post.media.length > 1 && (
                <div className="absolute top-3 right-3">
                  <div className="bg-black/80 rounded-full p-1.5 backdrop-blur-sm">
                    <Copy className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}

              {/* Hover Overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center transition-opacity duration-300",
                  hoveredPost === post.id ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="flex items-center space-x-6 text-white p-4">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 fill-white" />
                    <span className="text-sm font-medium">
                      {post.likesCount >= 1000
                        ? `${(post.likesCount / 1000).toFixed(1)}k`
                        : post.likesCount}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4 fill-white" />
                    <span className="text-sm font-medium">
                      {post.commentsCount >= 1000
                        ? `${(post.commentsCount / 1000).toFixed(1)}k`
                        : post.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
