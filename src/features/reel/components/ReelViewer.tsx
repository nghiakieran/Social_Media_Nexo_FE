import { useState, useRef, useEffect, memo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Heart,
  MessageCircle,
  Send,
  MoreVertical,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Reel } from '../types';
import { toggleLike, openCommentsDrawer } from '../reelSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ActionMenu } from '@/components/common/ActionMenu';
import { formatNumber } from '@/utils/constants';
import { HLSVideoPlayer } from '@/components/common/HLSVideoPlayer';

interface ReelViewerProps {
  reel: Reel;
  isActive: boolean;
  onShare?: (reelId: string) => void;
}

const ReelViewer = memo(({ reel, isActive, onShare }: ReelViewerProps) => {
  const dispatch = useDispatch();
  const [isMuted, setIsMuted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLike(reel.id));
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openCommentsDrawer(reel.id));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(reel.id);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMore(!showMore);
  };

  const MAX_CAPTION_LENGTH = 80;
  const shouldTruncate = reel.caption.length > MAX_CAPTION_LENGTH;
  const truncatedCaption = shouldTruncate
    ? reel.caption.slice(0, MAX_CAPTION_LENGTH) + '...'
    : reel.caption;

  return (
    <div 
      className="relative w-full bg-black transform-gpu" 
      style={{ 
        height: '100dvh',
        contain: 'layout style paint',
      }}
    >
      {/* Video Player */}
      <div className="absolute inset-0 transform-gpu">
        <HLSVideoPlayer
          src={reel.mediaUrl}
          autoPlay={isActive}
          loop
          muted={isMuted}
          playsInline
          hideControlsOnMobile={true}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="text-right">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Right Side Actions */}
      <div 
        className="absolute right-2 bottom-40 lg:bottom-32 flex flex-col gap-5 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <Heart
            className={`w-7 h-7 transition-all drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${
              reel.isLiked
                ? 'fill-red-500 text-red-500'
                : 'text-white fill-none'
            }`}
          />
          {reel.likesCount > 0 && (
            <span className="text-white text-[11px] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {formatNumber(reel.likesCount)}
            </span>
          )}
        </button>

        {/* Comment */}
        <button
          onClick={handleComment}
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <MessageCircle className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          {reel.commentsCount > 0 && (
            <span className="text-white text-[11px] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {formatNumber(reel.commentsCount)}
            </span>
          )}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <Send className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
        </button>

        {/* More */}
        <button
          onClick={handleMoreClick}
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
        >
          <MoreVertical className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
        </button>
      </div>

      {/* Bottom Info */}
      <div 
        className={`absolute left-0 right-16 lg:right-auto lg:max-w-md transition-all duration-300 ${
          showFullCaption 
            ? 'bottom-32 lg:bottom-16 max-h-[60vh] bg-black/95 rounded-tr-lg' 
            : 'bottom-32 lg:bottom-16'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`p-4 pb-4 lg:pb-6 ${
            showFullCaption 
              ? 'overflow-y-auto max-h-[60vh] scrollbar-thin' 
              : 'bg-gradient-to-t from-black/90 via-black/10 to-transparent'
          }`}
        >
          {/* User Info */}
          <a 
            href={`/${reel.userName}`}
            className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="w-8 h-8 border-2 border-white">
              <AvatarImage src={reel.avatarUrl} alt={reel.userName} />
              <AvatarFallback>{reel.userName[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-white font-semibold text-sm">
              {reel.userName}
            </span>
          </a>

          {/* Caption */}
          {reel.caption && (
            <div className="mb-2">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {showFullCaption ? reel.caption : truncatedCaption}
                {shouldTruncate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullCaption(!showFullCaption);
                    }}
                    className="text-gray-300 ml-2 font-medium hover:text-white transition-colors"
                  >
                    {showFullCaption ? 'thu gọn' : 'xem thêm'}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Tags */}
          {reel.tags && reel.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {reel.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-blue-400 text-xs font-medium hover:underline cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Tagged Users */}
          {reel.taggedUsers && reel.taggedUsers.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-white text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.334 23H2.666a1 1 0 0 1-1-1v-1.354a6.279 6.279 0 0 1 6.272-6.272h8.124a6.279 6.279 0 0 1 6.271 6.271V22a1 1 0 0 1-1 1ZM12 13.269a6 6 0 1 1 6-6 6.007 6.007 0 0 1-6 6Z" />
              </svg>
              <span>{reel.taggedUsers.length} người</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Menu */}
      <ActionMenu
        isOpen={showMore}
        onClose={() => setShowMore(false)}
        items={[
          { 
            label: 'Báo cáo', 
            action: () => console.log('Report'), 
            isDestructive: true 
          },
          { 
            label: 'Không quan tâm', 
            action: () => console.log('Not Interested') 
          },
          { 
            label: 'Sao chép liên kết', 
            action: () => {
              navigator.clipboard.writeText(`${window.location.origin}/reels/${reel.id}`);
              console.log('Copy Link');
            }
          },
          { 
            label: 'Chia sẻ đến...', 
            action: () => onShare?.(reel.id)
          },
          { 
            label: 'Về tài khoản này', 
            action: () => console.log('About') 
          },
        ]}
      />
    </div>
  );
});

ReelViewer.displayName = 'ReelViewer';

export default ReelViewer;
