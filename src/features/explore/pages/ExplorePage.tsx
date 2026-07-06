import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { ExploreGrid } from "../components/ExploreGrid";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Compass, Sparkles, RefreshCw } from "lucide-react";
import { getExplorePostsThunk, clearPosts, clearError } from "../exploreSlice";
import { ExplorePost } from "../types";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { posts, isLoading, error, hasMore, currentPage } = useAppSelector(
    (state) => state.explore,
  );
  console.log("ExplorePage render", {
    posts,
    isLoading,
    error,
    hasMore,
    currentPage,
  });
  const [searchParams] = useSearchParams();
  const hashtag = searchParams.get("hashtag") ?? null;
  // Load initial data
  useEffect(() => {
    dispatch(clearPosts());
    dispatch(clearError());
    dispatch(getExplorePostsThunk({ pageNo: 0, pageSize: 10, hashtag }));
  }, [dispatch, hashtag]);

  const handleRefresh = async () => {
    dispatch(clearPosts());
    dispatch(getExplorePostsThunk({ pageNo: 0, pageSize: 10, hashtag }));
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      dispatch(
        getExplorePostsThunk({
          pageNo: currentPage + 1,
          pageSize: 10,
          hashtag,
        }),
      );
    }
  };

  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore,
    isLoading,
    error,
    threshold: 200,
  });

  const handlePostClick = (post: ExplorePost) => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-16 lg:top-0 bg-background/80 backdrop-blur-xl border-b border-border/50 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md flex-shrink-0">
                <Compass className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-none">
                  Khám phá
                </h1>
                <p className="hidden sm:block text-sm text-muted-foreground mt-1">
                  Khám phá những nội dung thú vị
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-colors flex-shrink-0"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 text-primary",
                  isLoading && "animate-spin",
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl backdrop-blur-sm">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Posts Grid */}
        <div className="space-y-8">
          <ExploreGrid posts={posts} onPostClick={handlePostClick} />

          {/* Infinite Scroll Anchor & Loader */}
          {hasMore && (
            <div
              ref={lastElementRef as unknown as (node: HTMLDivElement | null) => void}
              className="flex justify-center pt-8 min-h-[40px]"
            >
              {isLoading && (
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Compass className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Không tìm thấy bài viết nào
              </h3>
              <p className="text-muted-foreground">
                Hãy thử làm mới để khám phá nội dung mới
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
