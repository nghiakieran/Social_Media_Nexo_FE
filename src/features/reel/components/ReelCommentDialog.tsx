import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Send, MessageCircle } from 'lucide-react';
import { RootState } from '@/store';
import {
  closeCommentsDrawer,
  addComment,
  toggleCommentLike,
  incrementCommentsCount,
} from '../reelSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { formatTimeAgo } from '@/utils/timeFormat';
import { formatNumber } from '@/utils/constants';
import { HLSVideoPlayer } from '@/components/common/HLSVideoPlayer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ReelCommentDialog = () => {
  const dispatch = useDispatch();
  const { isCommentsDrawerOpen, selectedReelId, comments, reels } = useSelector(
    (state: RootState) => state.reel
  );
  const [commentText, setCommentText] = useState('');

  const currentReel = reels.find((r) => r.id === selectedReelId);
  const reelComments = selectedReelId ? comments[selectedReelId] || [] : [];

  const handleClose = () => {
    dispatch(closeCommentsDrawer());
  };

  const handleSubmitComment = () => {
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

  if (!currentReel) return null;

  return (
    <Dialog open={isCommentsDrawerOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
        <div className="grid grid-cols-2 h-full">
          {/* Left: Video preview */}
          <div className="bg-black flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
            <div className="relative w-full h-full">
              <HLSVideoPlayer
                src={currentReel.mediaUrl}
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                controls={false}
                className="w-full h-full object-contain"
              />
              {/* User overlay */}
              <div className="absolute bottom-6 left-4 right-4 z-10">
                <a 
                  href={`/${currentReel.userName}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
                >
                  <Avatar className="w-8 h-8 border-2 border-white">
                    <AvatarImage src={currentReel.avatarUrl} alt={currentReel.userName} />
                    <AvatarFallback>{currentReel.userName[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-white font-semibold text-sm">
                    {currentReel.userName}
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Comments */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Bình luận</DialogTitle>
            </DialogHeader>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Owner Caption */}
              <div className="flex gap-3 pb-4 border-b">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={currentReel.avatarUrl} alt={currentReel.userName} />
                  <AvatarFallback>{currentReel.userName[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{currentReel.userName}</span>
                    <span className="text-gray-500 text-xs">
                      {formatTimeAgo(currentReel.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 break-words">{currentReel.caption}</p>
                </div>
              </div>

              {/* Comments */}
              {reelComments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có bình luận</p>
                  <p className="text-xs mt-1">Hãy là người đầu tiên bình luận</p>
                </div>
              ) : (
                reelComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.avatarUrl} alt={comment.userName} />
                      <AvatarFallback>{comment.userName[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{comment.userName}</span>
                            <span className="text-gray-500 text-xs">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 break-words">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2">
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
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="flex-shrink-0 p-1"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 transition-all ${
                              comment.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="border-t p-4">
              <div className="flex items-end gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="https://via.placeholder.com/150" alt="You" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Thêm bình luận..."
                    className="min-h-[40px] max-h-[120px] resize-none pr-10 text-sm"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    className="absolute right-2 bottom-2 p-1.5 text-primary disabled:text-gray-300 hover:opacity-80 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReelCommentDialog;
