import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setReels, setCurrentReelIndex, addReels } from '../reelSlice';
import ReelViewer from '../components/ReelViewer';
import ReelCommentDrawer from '../components/ReelCommentDrawer';
import ReelCommentDialog from '../components/ReelCommentDialog';
import { mockReels } from '../__mocks__/reels';
import { ShareDialog } from '@/features/post/components/ShareDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const ReelsPage = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const { reels, currentReelIndex, isCommentsDrawerOpen } = useSelector(
    (state: RootState) => state.reel
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareReelId, setShareReelId] = useState<string>('');
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    // Load initial reels
    dispatch(setReels(mockReels));
  }, [dispatch]);

  useEffect(() => {
    // Scroll to current reel (chỉ khi comment drawer đóng)
    if (containerRef.current && !isCommentsDrawerOpen) {
      isScrollingRef.current = true;
      const containerHeight = containerRef.current.clientHeight;
      const scrollTop = currentReelIndex * containerHeight;
      
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
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
      containerRef.current.style.overflow = 'hidden';
    } else if (containerRef.current) {
      containerRef.current.style.overflow = 'auto';
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
      if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < reels.length) {
        dispatch(setCurrentReelIndex(newIndex));
      }

      // Load more reels when near the end
      if (
        newIndex >= reels.length - 2 &&
        reels.length < 50 // Prevent infinite loading
      ) {
        const moreReels = mockReels.map((reel) => ({
          ...reel,
          id: `${reel.id}-${Date.now()}`,
        }));
        dispatch(addReels(moreReels));
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
        dispatch(setCurrentReelIndex(currentReelIndex + 1));
      } else if (diff < 0 && currentReelIndex > 0) {
        // Swipe down - previous reel
        dispatch(setCurrentReelIndex(currentReelIndex - 1));
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

  const handleShareAction = (postId: string, userIds: string[], message: string) => {
    // TODO: Implement actual share logic
    setIsShareDialogOpen(false);
  };

  const currentReel = reels[currentReelIndex];
  
  // Convert Reel to Post format for ShareDialog
  const reelAsPost = currentReel ? {
    id: currentReel.id,
    content: currentReel.caption,
    media: [{
      url: currentReel.mediaUrl,
      type: 'video' as const,
    }],
    userName: currentReel.userName,
    avatarUrl: currentReel.avatarUrl,
    createdAt: currentReel.createdAt,
  } : null;

  return (
    <div className="relative w-full overflow-hidden flex items-center justify-center" style={{ height: isMobile ? 'calc(100dvh - 65px)' : '100dvh' }}>
      {/* Reels Container */}
      <div
        ref={containerRef}
        className="w-full lg:max-w-sm xl:max-w-md h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide will-change-scroll reels-container lg:py-4"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: isCommentsDrawerOpen ? 'none' : 'pan-y',
          scrollSnapType: 'y mandatory',
        }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="w-full snap-start snap-always will-change-transform"
            style={{ 
              height: isMobile ? 'calc(100dvh - 65px)' : '100dvh',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
            }}
          >
            <ReelViewer
              reel={reel}
              isActive={index === currentReelIndex}
              onShare={handleShare}
              isDetail={false}
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
