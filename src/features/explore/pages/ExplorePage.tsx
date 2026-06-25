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
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border/50 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Khám phá
                </h1>
                <p className="text-sm text-muted-foreground">
                  Khám phá những nội dung thú vị
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
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
