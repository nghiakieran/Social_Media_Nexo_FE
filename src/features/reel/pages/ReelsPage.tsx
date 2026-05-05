import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setCurrentReel,
  getReelsFeedThunk,
  likeReelThunk,
  deleteReelThunk,
} from "../reelSlice";
import ReelViewer from "../components/ReelViewer";
import ReelCommentDrawer from "../components/ReelCommentDrawer";
import ReelCommentDialog from "../components/ReelCommentDialog";
import { ShareDialog } from "@/features/post/components/ShareDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const ReelsPage = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const {
    reels,
    currentReel,
    isCommentsDrawerOpen,
    isLoading,
    hasMore,
    currentPage,
  } = useAppSelector((state) => state.reel);
  const user = useAppSelector((state) => state.auth.user);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareReelId, setShareReelId] = useState<string>("");
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    // Load initial reels
    if (user?.id) {
      dispatch(getReelsFeedThunk({ userId: user.id, page: 0, limit: 10 }));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    // Scroll to current reel (chỉ khi comment drawer đóng)
    if (containerRef.current && !isCommentsDrawerOpen) {
      isScrollingRef.current = true;
      const containerHeight = containerRef.current.clientHeight;
      const scrollTop = currentReelIndex * containerHeight;

      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  }, [currentReelIndex, isCommentsDrawerOpen]);

  // Block scroll khi comment drawer mở
  useEffect(() => {
    if (isCommentsDrawerOpen && containerRef.current) {
      containerRef.current.style.overflow = "hidden";
    } else if (containerRef.current) {
      containerRef.current.style.overflow = "auto";
    }
  }, [isCommentsDrawerOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingRef.current) return;

    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / containerHeight);

    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce index update
    scrollTimeoutRef.current = setTimeout(() => {
      if (
        newIndex !== currentReelIndex &&
        newIndex >= 0 &&
        newIndex < reels.length
      ) {
        setCurrentReelIndex(newIndex);
        dispatch(setCurrentReel(reels[newIndex]));
      }

      // Load more reels when near the end
      if (newIndex >= reels.length - 2 && hasMore && !isLoading) {
        if (user?.id) {
          dispatch(
            getReelsFeedThunk({
              userId: user.id,
              page: currentPage + 1,
              limit: 10,
            })
          );
        }
      }
    }, 50); // 50ms debounce
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCommentsDrawerOpen) return;
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isCommentsDrawerOpen) return;

    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;

    // Increased threshold for better control
    if (Math.abs(diff) > 80) {
      if (diff > 0 && currentReelIndex < reels.length - 1) {
        // Swipe up - next reel
        const newIndex = currentReelIndex + 1;
        setCurrentReelIndex(newIndex);
        dispatch(setCurrentReel(reels[newIndex]));
      } else if (diff < 0 && currentReelIndex > 0) {
        // Swipe down - previous reel
        const newIndex = currentReelIndex - 1;
        setCurrentReelIndex(newIndex);
        dispatch(setCurrentReel(reels[newIndex]));
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleShare = (reelId: string) => {
    setShareReelId(reelId);
    setIsShareDialogOpen(true);
  };

  const handleShareAction = (
    postId: string,
    userIds: string[],
    message: string
  ) => {
    // TODO: Implement actual share logic
    setIsShareDialogOpen(false);
  };

  const handleEdit = (reelId: string) => {
    // Navigate to edit page
    window.location.href = `/reels/${reelId}/edit`;
  };

  const handleDelete = (reelId: string) => {
    // Delete is handled in ReelViewer component
    console.log("Reel deleted:", reelId);
  };

  const currentReelData = reels[currentReelIndex];

  if (isLoading && reels.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center"
        style={{ height: isMobile ? "calc(100dvh - 65px)" : "100dvh" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Đang tải reels...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && reels.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center"
        style={{ height: isMobile ? "calc(100dvh - 65px)" : "100dvh" }}
      >
        <p className="text-sm text-muted-foreground">Chưa có reel nào để hiển thị.</p>
      </div>
    );
  }

  // Convert Reel to Post format for ShareDialog
  const reelAsPost = currentReelData
    ? {
        id: currentReelData.id,
        content: currentReelData.caption,
        media: [
          {
            url: currentReelData.mediaUrl,
            type: "video" as const,
          },
        ],
        userName: currentReelData.userName,
        avatarUrl: currentReelData.avatarUrl,
        createdAt: currentReelData.createdAt,
      }
    : null;

  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ height: isMobile ? "calc(100dvh - 65px)" : "100dvh" }}
    >
      {/* Reels Container */}
      <div
        ref={containerRef}
        className="w-full lg:max-w-sm xl:max-w-md h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide will-change-scroll reels-container lg:py-4"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: isCommentsDrawerOpen ? "none" : "pan-y",
          scrollSnapType: "y mandatory",
        }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="w-full snap-start snap-always will-change-transform"
            style={{
              height: isMobile ? "calc(100dvh - 65px)" : "100dvh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <ReelViewer
              reel={reel}
              isActive={index === currentReelIndex && !isCommentsDrawerOpen}
              onShare={handleShare}
              isDetail={false}
              showEditButton={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {/* Comment - Mobile: Drawer, Desktop: Dialog */}
      {isMobile ? <ReelCommentDrawer /> : <ReelCommentDialog />}

      {/* Share Dialog */}
      {isShareDialogOpen && reelAsPost && (
        <ShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          post={reelAsPost}
          onShare={handleShareAction}
        />
      )}
    </div>
  );
};

export default ReelsPage;
