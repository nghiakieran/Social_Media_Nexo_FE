import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Send, MessageCircle } from "lucide-react";
import { RootState } from "@/store";
import {
  closeCommentsDrawer,
} from "../reelSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTimeAgo } from "@/utils/timeFormat";
import { formatNumber } from "@/utils/constants";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getReelCommentsThunk,
  createCommentThunk,
  likeCommentThunk,
  clearComments,
  clearCommentError,
} from "@/features/interaction/interactionSlice";
import { LikeButton } from "@/features/interaction/components/LikeButton";
import { Loader } from "@/components/common/Loader";

const ReelCommentDrawer = () => {
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { isCommentsDrawerOpen, selectedReelId, reels } = useSelector(
    (state: RootState) => state.reel
  );
  const {
    comments,
    isLoading,
    error,
    hasMore,
    currentPage,
    isCreating,
  } = useAppSelector((state) => state.interaction.comments);
  const [commentText, setCommentText] = useState("");

  const currentReel = reels.find((r) => r.id === selectedReelId);

  // Load comments when reel is selected
  useEffect(() => {
    if (selectedReelId) {
      appDispatch(clearComments());
      appDispatch(clearCommentError());
      appDispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId),
          params: { pageNo: 0, pageSize: 20 },
        })
      );
    }
  }, [appDispatch, selectedReelId]);

  const handleClose = () => {
    dispatch(closeCommentsDrawer());
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading && selectedReelId) {
      appDispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId),
          params: { pageNo: currentPage + 1, pageSize: 20 },
        })
      );
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedReelId || !user) return;

    try {
      await appDispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: 0,
          reelId: parseInt(selectedReelId),
          parentId: 0,
          content: commentText.trim(),
          listMentionUserId: [],
        })
      ).unwrap();

      setCommentText("");
      // Refresh comments
      appDispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId),
          params: { pageNo: 0, pageSize: 20 },
        })
      );
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await appDispatch(likeCommentThunk(parseInt(commentId))).unwrap();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  if (!isCommentsDrawerOpen || !currentReel) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transition-transform duration-300"
        style={{
          maxHeight: "80vh",
          transform: isCommentsDrawerOpen
            ? "translateY(0)"
            : "translateY(100%)",
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-semibold">Bình luận</h2>
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
          style={{ maxHeight: "calc(80vh - 180px)" }}
        >
          {/* Owner Comment */}
          <div className="flex gap-3 mb-4 pb-4 border-b">
            <a
              href={`/${currentReel.userName}`}
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={currentReel.avatarUrl}
                  alt={currentReel.userName}
                />
                <AvatarFallback>
                  {currentReel.userName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </a>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={`/${currentReel.userName}`}
                  className="font-semibold text-sm hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentReel.userName}
                </a>
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
          {isLoading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có bình luận</p>
              <p className="text-xs mt-1">Hãy là người đầu tiên bình luận</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <a
                    href={`/${comment.userName}`}
                    className="flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={comment.avatarUrl}
                        alt={comment.userName}
                      />
                      <AvatarFallback>
                        {comment.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </a>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <a
                            href={`/${comment.userName}`}
                            className="font-semibold text-sm hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {comment.userName}
                          </a>
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

                      <LikeButton
                        targetId={parseInt(comment.id)}
                        targetType="comment"
                        isLiked={comment.isLiked}
                        likesCount={comment.likesCount}
                        size="sm"
                        variant="ghost"
                        showCount={false}
                        onLikeChange={() => handleLikeComment(comment.id)}
                        className="h-auto p-1 text-gray-400 hover:text-red-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Đang tải..." : "Xem thêm bình luận"}
              </Button>
            </div>
          )}
        </div>

        {/* Comment Input */}
        {user && (
          <div className="border-t p-3 bg-white">
            <div className="flex items-end gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0 mb-1.5">
                <AvatarImage src={user.avatar} alt={user.username || "User"} />
                <AvatarFallback>
                  {user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Thêm bình luận..."
                  className="min-h-[40px] max-h-[120px] resize-none pr-10 text-sm"
                  rows={1}
                  disabled={isCreating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isCreating}
                  className="absolute right-2 bottom-2 p-1.5 text-primary disabled:text-gray-300 hover:opacity-80 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReelCommentDrawer;
