import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/utils/timeFormat";
import { formatNumber } from "@/utils/constants";
import { cn } from "@/lib/utils";
import { Reel } from "../types";
import { navigateToProfile } from "@/utils/navigation";
import { useNavigate } from "react-router-dom";
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

interface ReelCommentSectionProps {
  reel: Reel;
  onShare?: () => void;
  onProfileClick?: (userName: string) => void;
}

const ReelCommentSection = ({
  reel,
  onShare,
  onProfileClick,
}: ReelCommentSectionProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const {
    comments,
    isLoading,
    error,
    hasMore,
    currentPage,
    isCreating,
  } = useAppSelector((state) => state.interaction.comments);

  const [commentText, setCommentText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus input on custom event
  useEffect(() => {
    const handleFocusInput = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };
    window.addEventListener("focus-reel-comment-input", handleFocusInput);
    return () => {
      window.removeEventListener("focus-reel-comment-input", handleFocusInput);
    };
  }, []);

  // Load comments when component mounts
  useEffect(() => {
    dispatch(clearComments());
    dispatch(clearCommentError());
    dispatch(
      getReelCommentsThunk({
        reelId: parseInt(reel.id),
        params: { pageNo: 0, pageSize: 20 },
      })
    );
  }, [dispatch, reel.id]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      dispatch(
        getReelCommentsThunk({
          reelId: parseInt(reel.id),
          params: { pageNo: currentPage + 1, pageSize: 20 },
        })
      );
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: 0,
          reelId: parseInt(reel.id),
          parentId: 0,
          content: commentText.trim(),
          listMentionUserId: [],
        })
      ).unwrap();

      setCommentText("");
      // Refresh comments
      dispatch(
        getReelCommentsThunk({
          reelId: parseInt(reel.id),
          params: { pageNo: 0, pageSize: 20 },
        })
      );
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await dispatch(likeCommentThunk(parseInt(commentId))).unwrap();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Reel Info - Only show on detail pages */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            className="w-10 h-10 cursor-pointer"
            onClick={() => navigateToProfile(navigate, reel.userName)}
          >
            <AvatarImage src={reel.avatarUrl} alt={reel.userName} />
            <AvatarFallback>
              {reel.userName?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <a
              href={`/${reel.userName}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline"
              onClick={(e) => {
                e.preventDefault();
                onProfileClick(reel.userName);
              }}
            >
              {reel.userName}
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatTimeAgo(reel.createdAt)}
            </p>
          </div>
        </div>

        {/* Caption */}
        {reel.caption && (
          <div className="mb-3">
            <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
              {reel.caption}
            </p>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Bình luận ({comments.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Temporarily hidden share button
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white"
            >
              Chia sẻ
            </Button>
          )}
          */}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div
                  onClick={() => onProfileClick?.(comment.userName)}
                  className="cursor-pointer"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.avatarUrl} alt={comment.userName} />
                    <AvatarFallback>
                      {comment.userName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      onClick={() => onProfileClick?.(comment.userName)}
                      className="font-semibold text-sm text-gray-900 dark:text-white cursor-pointer hover:underline"
                    >
                      {comment.userName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <LikeButton
                      targetId={parseInt(comment.id)}
                      targetType="comment"
                      isLiked={comment.isLiked}
                      likesCount={comment.likesCount}
                      size="sm"
                      variant="ghost"
                      showCount={true}
                      className="h-auto px-0 text-xs"
                    />
                    {comment.replies && comment.replies.length > 0 && (
                      <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        Trả lời ({comment.replies.length})
                      </button>
                    )}
                    <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
          </>
        )}
      </div>

      {/* Comment Input */}
      {user && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.username || "User"} />
              <AvatarFallback>
                {user.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Thêm bình luận..."
                className="min-h-[40px] max-h-[120px] resize-none"
                rows={1}
                disabled={isCreating}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!commentText.trim() || isCreating}
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReelCommentSection;
