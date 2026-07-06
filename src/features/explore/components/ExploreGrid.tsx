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
      {/* Instagram-style Stable Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square cursor-pointer group overflow-hidden rounded-xl bg-muted shadow-sm hover:shadow-md transition-all duration-300 border border-border/10"
            onClick={() => handlePostClick(post)}
            onMouseEnter={() => setHoveredPost(post.id)}
            onMouseLeave={() => setHoveredPost(null)}
          >
            <div className="w-full h-full relative overflow-hidden">
              {post.media && post.media.length > 0 ? (
                <>
                  {post.media[0].type === "image" ? (
                    <LazyImage
                      src={post.media[0].url}
                      alt={post.caption || `Post`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <SimpleVideoPreview
                      videoUrl={post.media[0].url}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-background via-muted/50 to-muted flex flex-col justify-center p-4 relative border border-border/50">
                  <div className="absolute top-2.5 right-2.5 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm border border-border/50 z-10">
                    <AlignLeft className="h-3 w-3 text-foreground/70" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <Quote className="h-6 w-6 text-primary/20 mb-2" />
                    <p className="text-xs sm:text-sm font-medium text-foreground/80 line-clamp-4 leading-relaxed px-2">
                      {post.caption || "Bài viết này không có nội dung."}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                </div>
              )}

              {/* Video/Carousel Indicators */}
              {post.media.length > 0 && post.media[0].type === "video" && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <div className="bg-black/60 rounded-full p-1.5 backdrop-blur-sm">
                    <Play className="h-3 w-3 text-white fill-white" />
                  </div>
                </div>
              )}

              {post.media.length > 1 && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <div className="bg-black/60 rounded-full p-1.5 backdrop-blur-sm">
                    <Copy className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}

              {/* Hover Overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 z-25",
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
