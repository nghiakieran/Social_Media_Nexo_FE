import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Heart, Send, MessageCircle } from 'lucide-react';
import { RootState } from '@/store';
import {
  closeCommentsDrawer,
  addComment,
  toggleCommentLike,
  incrementCommentsCount,
} from '../reelSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatTimeAgo } from '@/utils/timeFormat';
import { formatNumber } from '@/utils/constants';

const ReelCommentDrawer = () => {
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
      userId: 'current-user-id', // Replace with actual user ID
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

  if (!isCommentsDrawerOpen || !currentReel) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transition-transform duration-300"
        style={{
          maxHeight: '80vh',
          transform: isCommentsDrawerOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-semibold">
            Bình luận
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div
          className="overflow-y-auto px-4 py-3"
          style={{ maxHeight: 'calc(80vh - 180px)' }}
        >
          {/* Owner Comment */}
          <div className="flex gap-3 mb-4 pb-4 border-b">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage
                src={currentReel.avatarUrl}
                alt={currentReel.userName}
              />
              <AvatarFallback>
                {currentReel.userName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {currentReel.userName}
                </span>
                <span className="text-gray-500 text-xs">
                  {formatTimeAgo(currentReel.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-900 break-words">
                {currentReel.caption}
              </p>
            </div>
          </div>

          {/* Other Comments */}
          {reelComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có bình luận</p>
              <p className="text-xs mt-1">Hãy là người đầu tiên bình luận</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reelComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage
                      src={comment.avatarUrl}
                      alt={comment.userName}
                    />
                    <AvatarFallback>
                      {comment.userName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 break-words">
                          {comment.content}
                        </p>
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
                          className={`w-3 h-3 transition-all ${
                            comment.isLiked
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="border-t p-3 bg-white">
          <div className="flex items-end gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0 mb-1.5">
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
    </>
  );
};

export default ReelCommentDrawer;
