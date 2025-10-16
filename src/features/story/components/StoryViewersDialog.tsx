import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LazyImage } from "@/components/common/LazyImage";
import { Loader } from "@/components/common/Loader";
import { getStoryViewers } from "../api/storyApi";
import type { StoryViewer } from "../types";
import { formatTimeAgo } from "@/utils/timeFormat";
import { navigateToProfile } from "@/utils/navigation";
import { Heart } from "lucide-react";

interface StoryViewersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: number;
  totalViewers: number;
}

export const StoryViewersDialog = ({ isOpen, onClose, storyId, totalViewers }: StoryViewersDialogProps) => {
  const navigate = useNavigate();
  const [viewers, setViewers] = useState<StoryViewer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleViewerClick = (username: string) => {
    navigateToProfile(navigate, username);
    onClose(); // Close dialog after navigation
  };

  // Load initial viewers
  useEffect(() => {
    if (!isOpen || !storyId) return;

    const loadInitialViewers = async () => {
      setIsLoading(true);
      setViewers([]);
      setCurrentPage(0);
      setHasMore(true);
      
      try {
        const response = await getStoryViewers(storyId, 0, 20);
        setViewers(response.data.content);
        setHasMore(!response.data.last);
      } catch (error) {
        console.error("Failed to load viewers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialViewers();
  }, [isOpen, storyId]);

  // Load more viewers
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await getStoryViewers(storyId, nextPage, 20);
      setViewers((prev) => [...prev, ...response.data.content]);
      setHasMore(!response.data.last);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Failed to load more viewers:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [storyId, currentPage, hasMore, isLoadingMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!isOpen || !observerTarget.current || !hasMore) return;

    const currentTarget = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isOpen, hasMore, isLoadingMore, loadMore]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[400px] p-0 overflow-hidden max-h-[80vh]">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center">
            Người xem ({totalViewers})
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader />
            </div>
          ) : viewers.length === 0 ? (
            <div className="flex justify-center items-center py-8 text-muted-foreground">
              Chưa có người xem
            </div>
          ) : (
            <div className="divide-y divide-border">
              {viewers.map((viewer, index) => (
                <button
                  key={`${viewer.userName}-${index}`}
                  onClick={() => handleViewerClick(viewer.userName)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer text-left"
                >
                  <LazyImage
                    src={viewer.avatarUrl || "/placeholder.svg"}
                    alt={viewer.userName}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{viewer.userName}</p>
                      {viewer.isCloseFriend && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full flex-shrink-0">
                          Bạn thân
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(viewer.createdAt)}
                    </p>
                  </div>
                  {viewer.isLike && (
                    <Heart className="w-5 h-5 text-red-500 fill-red-500 flex-shrink-0" />
                  )}
                </button>
              ))}
              
              {/* Loading more indicator */}
              {hasMore && (
                <div ref={observerTarget} className="py-4 flex justify-center">
                  {isLoadingMore && <Loader />}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

