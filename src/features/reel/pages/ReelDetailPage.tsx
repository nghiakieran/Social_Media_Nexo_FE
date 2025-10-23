import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { setReels, setCurrentReelIndex, openCommentsDrawer } from '../reelSlice';
import ReelViewer from '../components/ReelViewer';
import ReelCommentDrawer from '../components/ReelCommentDrawer';
import ReelCommentSection from '../components/ReelCommentSection';
import { mockReels } from '../__mocks__/reels';
import { ShareDialog } from '@/features/post/components/ShareDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Loader } from '@/components/common/Loader';

const ReelDetailPage = () => {
  const { reelId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const { reels, currentReelIndex, isCommentsDrawerOpen, comments } = useSelector(
    (state: RootState) => state.reel
  );
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareReelId, setShareReelId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the specific reel
  const currentReel = reels.find(reel => reel.id === reelId);

  useEffect(() => {
    // Load reels if not already loaded
    if (reels.length === 0) {
      dispatch(setReels(mockReels));
    }
    
    // Find the index of the current reel
    if (reelId && reels.length > 0) {
      const reelIndex = reels.findIndex(reel => reel.id === reelId);
      if (reelIndex !== -1) {
        dispatch(setCurrentReelIndex(reelIndex));
        setIsLoading(false);
      } else {
        setError('Reel không tồn tại');
        setIsLoading(false);
      }
    }
  }, [dispatch, reelId, reels]);

  const handleShare = (reelId: string) => {
    setShareReelId(reelId);
    setIsShareDialogOpen(true);
  };

  const handleShareAction = (postId: string, userIds: string[], message: string) => {
    // TODO: Implement actual share logic
    setIsShareDialogOpen(false);
  };

  const handleAddComment = (content: string) => {
    // TODO: Implement add comment logic
  };

  const handleToggleCommentLike = (commentId: string) => {
    // TODO: Implement toggle comment like logic
  };

  const handleToggleReelLike = () => {
    // TODO: Implement toggle reel like logic
  };

  const handleProfileClick = (userName: string) => {
    navigate(`/${userName}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Show loading state
  if (isLoading) {
    return <Loader overlay />;
  }

  // Show error state
  if (error || !currentReel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">{error || 'Reel không tồn tại'}</p>
          <Button
            variant="outline"
            onClick={handleBack}
            className="bg-white text-black hover:bg-gray-100"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // Convert Reel to Post format for ShareDialog
  const reelAsPost = {
    id: currentReel.id,
    content: currentReel.caption,
    media: [{
      url: currentReel.mediaUrl,
      type: 'video' as const,
    }],
    userName: currentReel.userName,
    avatarUrl: currentReel.avatarUrl,
    createdAt: currentReel.createdAt,
  };

  if (isMobile) {
    // Mobile: Full screen reel with comment drawer
    return (
      <div className="relative w-full overflow-hidden" style={{ height: '100dvh' }}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-30">
          <div className="flex items-center justify-center relative">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="absolute left-0 h-10 w-10 p-0 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Title - Centered */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg font-semibold text-white">
                Chi tiết Reel
              </h1>
            </div>

            {/* Spacer for balance */}
            <div className="absolute right-0 w-10"></div>
          </div>
        </div>

        {/* Reel Viewer */}
        <ReelViewer
          reel={currentReel}
          isActive={true}
          onShare={handleShare}
          isDetail={true}
        />

        {/* Comment Drawer */}
        <ReelCommentDrawer />

        {/* Share Dialog */}
        {isShareDialogOpen && (
          <ShareDialog
            isOpen={isShareDialogOpen}
            onClose={() => setIsShareDialogOpen(false)}
            post={reelAsPost}
            onShare={handleShareAction}
          />
        )}
      </div>
    );
  }

  // Desktop: Split view with video on left, comments on right
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header - Mobile & Desktop */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-0 py-4">
          <div className="flex items-center justify-center relative">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="absolute left-0 h-10 w-10 p-0 rounded-full hover:bg-muted/80 hover:text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Title - Centered */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                Chi tiết Reel
              </h1>
            </div>

            {/* Spacer for balance */}
            <div className="absolute right-0 w-10"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex h-[calc(100vh-140px)]">
          {/* Left side - Reel Video */}
          <div 
            className="flex items-center justify-center relative rounded-lg overflow-hidden" 
            style={{ 
              aspectRatio: '9 / 16',
              flexBasis: '50%',
              minWidth: '50%',
              maxWidth: '50%'
            }}
          >
            <ReelViewer
              reel={currentReel}
              isActive={true}
              onShare={handleShare}
              isDetail={true}
            />
          </div>

          {/* Right side - Comments */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
            <ReelCommentSection
              reel={currentReel}
              comments={comments[currentReel.id] || []}
              onAddComment={handleAddComment}
              onToggleCommentLike={handleToggleCommentLike}
              onToggleReelLike={handleToggleReelLike}
              onShare={() => handleShare(currentReel.id)}
              onProfileClick={handleProfileClick}
            />
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {isShareDialogOpen && (
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

export default ReelDetailPage;
