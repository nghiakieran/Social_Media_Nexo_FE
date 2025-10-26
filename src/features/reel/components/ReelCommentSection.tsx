import { useState, useRef } from "react";
import { Heart, Send, MessageCircle, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/utils/timeFormat";
import { formatNumber } from "@/utils/constants";
import { cn } from "@/lib/utils";
import { Reel, ReelComment } from "../types";
import { navigateToProfile } from "@/utils/navigation";
import { useNavigate } from "react-router-dom";

interface ReelCommentSectionProps {
  reel: Reel;
  comments: ReelComment[];
  onAddComment: (content: string) => void;
  onToggleCommentLike: (commentId: string) => void;
  onToggleReelLike: () => void;
  onShare: () => void;
  onProfileClick: (userName: string) => void;
}

const ReelCommentSection = ({
  reel,
  comments,
  onAddComment,
  onToggleCommentLike,
  onToggleReelLike,
  onShare,
  onProfileClick,
}: ReelCommentSectionProps) => {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText("");
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
            Bình luận ({reel.commentsCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white"
          >
            Chia sẻ
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div
                onClick={() => onProfileClick(comment.userName)}
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
                    onClick={() => onProfileClick(comment.userName)}
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
                  <button
                    onClick={() => onToggleCommentLike(comment.id)}
                    className={cn(
                      "flex items-center gap-1 text-xs transition-colors",
                      comment.isLiked
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-500 hover:text-red-500"
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4",
                        comment.isLiked && "fill-current"
                      )}
                    />
                    {comment.likesCount > 0 && (
                      <span>{formatNumber(comment.likesCount)}</span>
                    )}
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    Trả lời
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={reel.avatarUrl} alt={reel.userName} />
            <AvatarFallback>
              {reel.userName?.[0]?.toUpperCase() || "U"}
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
            />
            <Button
              type="submit"
              size="sm"
              disabled={!commentText.trim()}
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReelCommentSection;
