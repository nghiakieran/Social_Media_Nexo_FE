import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Send, MessageCircle, X, MoreHorizontal } from 'lucide-react';
import { RootState } from '@/store';
import {
  closeCommentsDrawer,
  addComment,
  toggleCommentLike,
  incrementCommentsCount,
  toggleLike,
} from '../reelSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/utils/timeFormat';
import { formatNumber } from '@/utils/constants';
import { HLSVideoPlayer } from '@/components/common/HLSVideoPlayer';
import { cn } from '@/lib/utils';

const ReelCommentDialog = () => {
  const dispatch = useDispatch();
  const { isCommentsDrawerOpen, selectedReelId, comments, reels } = useSelector(
    (state: RootState) => state.reel
  );
  const [commentText, setCommentText] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentReel = reels.find((r) => r.id === selectedReelId);
  const reelComments = selectedReelId ? comments[selectedReelId] || [] : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        dispatch(closeCommentsDrawer());
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch(closeCommentsDrawer());
      }
    };

    if (isCommentsDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isCommentsDrawerOpen, dispatch]);

  const handleClose = () => {
    dispatch(closeCommentsDrawer());
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedReelId) return;

    const newComment = {
      id: Date.now().toString(),
      userId: 'current-user-id',
      userName: 'you',
      avatarUrl: 'https://via.placeholder.com/150',
      content: commentText,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
    };

    dispatch(addComment({ reelId: selectedReelId, comment: newComment }));
    dispatch(incrementCommentsCount(selectedReelId));
    setCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    if (!selectedReelId) return;
    dispatch(toggleCommentLike({ reelId: selectedReelId, commentId }));
  };

  const handleLikeReel = () => {
    if (!selectedReelId) return;
    dispatch(toggleLike(selectedReelId));
  };

  const handleProfileClick = (userName: string) => {
    window.location.href = `/${userName}`;
  };

  if (!isCommentsDrawerOpen || !currentReel) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      style={{ overscrollBehavior: 'contain' }}
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        style={{ 
          maxHeight: '682px', 
          maxWidth: '1023px',
          width: '100%',
          height: '90vh'
        }}
      >
        {/* Left side - Reel Video */}
        <div 
          className="flex items-center justify-center relative overflow-hidden" 
          style={{ 
            aspectRatio: '9 / 16',
            flexBasis: '50%',
            minWidth: '50%',
            maxWidth: '50%'
          }}
        >
          <HLSVideoPlayer
            src={currentReel.mediaUrl}
            autoPlay={true}
            loop={true}
            playsInline={true}
            controls={true}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Comments */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div 
                className="relative cursor-pointer" 
                onClick={() => handleProfileClick(currentReel.userName)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentReel.avatarUrl} alt={currentReel.userName} />
                  <AvatarFallback>{currentReel.userName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <h3 
                className="font-semibold text-sm cursor-pointer hover:underline"
                onClick={() => handleProfileClick(currentReel.userName)}
              >
                {currentReel.userName}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments section */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Owner Caption as first comment */}
            <div className="flex items-start gap-3 mb-6">
              <div 
                className="relative cursor-pointer" 
                onClick={() => handleProfileClick(currentReel.userName)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentReel.avatarUrl} alt={currentReel.userName} />
                  <AvatarFallback>{currentReel.userName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="font-semibold text-sm cursor-pointer hover:underline"
                        onClick={() => handleProfileClick(currentReel.userName)}
                      >
                        {currentReel.userName}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatTimeAgo(currentReel.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {currentReel.caption}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {reelComments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Chưa có bình luận</p>
                <p className="text-xs mt-1">Hãy là người đầu tiên bình luận</p>
              </div>
            ) : (
              <ul className="space-y-6">
                {reelComments.map((comment) => (
                  <li key={comment.id} className="flex items-start gap-3">
                    <div 
                      className="relative cursor-pointer" 
                      onClick={() => handleProfileClick(comment.userName)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.avatarUrl} alt={comment.userName} />
                        <AvatarFallback>{comment.userName[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="font-semibold text-sm cursor-pointer hover:underline"
                              onClick={() => handleProfileClick(comment.userName)}
                            >
                              {comment.userName}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed break-words mb-2">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-4">
                            {comment.likesCount > 0 && (
                              <span className="text-xs text-gray-500 font-medium">
                                {formatNumber(comment.likesCount)} lượt thích
                              </span>
                            )}
                            <button className="text-xs text-gray-500 font-semibold hover:text-gray-700">
                              Trả lời
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={cn(
                          'w-4 h-4',
                          comment.isLiked && 'fill-red-500 text-red-500'
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions & Comment Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {/* Actions */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleLikeReel}
                className={cn(
                  'transition-colors',
                  currentReel.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Heart className={cn('w-6 h-6', currentReel.isLiked && 'fill-current')} />
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <Send className="w-6 h-6" />
              </button>
            </div>

            {/* Likes summary */}
            <div className="mb-3 text-sm font-medium">
              {formatNumber(currentReel.likesCount)} lượt thích
            </div>

            {/* Post time */}
            <div className="mb-4 text-xs text-gray-500">
              <time>{formatTimeAgo(currentReel.createdAt)}</time>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Thêm bình luận..."
                className="flex-1 resize-none text-sm"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelCommentDialog;
