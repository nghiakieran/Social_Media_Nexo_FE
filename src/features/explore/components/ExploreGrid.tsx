import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ExplorePost } from "../types";
import {
  Heart,
  MessageCircle,
  Play,
  Copy,
  AlignLeft,
  Quote,
} from "lucide-react";
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
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="relative break-inside-avoid mb-4 cursor-pointer group"
            onClick={() => handlePostClick(post)}
            onMouseEnter={() => setHoveredPost(post.id)}
            onMouseLeave={() => setHoveredPost(null)}
          >
            <div className="relative overflow-hidden rounded-lg bg-muted shadow-sm hover:shadow-md transition-shadow duration-300">
              {post.media && post.media.length > 0 ? (
                <>
                  {post.media[0].type === "image" ? (
                    <LazyImage
                      src={post.media[0].url}
                      alt={post.caption || `Post`}
                      className="w-full h-auto min-h-[100px] object-cover"
                    />
                  ) : (
                    <SimpleVideoPreview
                      videoUrl={post.media[0].url}
                      className="w-full h-auto min-h-[100px]"
                    />
                  )}
                </>
              ) : (
                <div className="w-full aspect-[4/5] sm:aspect-square bg-gradient-to-br from-background via-muted/50 to-muted flex flex-col justify-center p-6 relative border border-border/50">
                  <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm border border-border/50">
                    <AlignLeft className="h-3 w-3 text-foreground/70" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <Quote className="h-8 w-8 text-primary/20 mb-4" />
                    <p className="text-base sm:text-lg font-medium text-foreground/80 line-clamp-6 leading-relaxed">
                      {post.caption || "Bài viết này không có nội dung."}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                </div>
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
                  hoveredPost === post.id ? "opacity-100" : "opacity-0",
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
