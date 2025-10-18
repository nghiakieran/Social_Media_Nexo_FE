import { ActionMenu } from "@/components/common/ActionMenu";
import { EmojiPicker } from "@/components/common/EmojiPicker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Smile,
} from "lucide-react";
import { useRef, useState } from "react";
import { LikesDialog } from "./LikesDialog";
import { formatTimeAgo } from "@/utils/timeFormat";

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  emojiReactions?: Array<{
    emoji: string;
    count: number;
    isReacted: boolean;
  }>;
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "1",
    author: {
      id: "2",
      name: "Trần Thị B",
      username: "tranthib",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    },
    content:
      "Chúc mừng bạn nhé! Môi trường làm việc rất quan trọng cho sự phát triển của mỗi người. Mình cũng đã từng trải qua giai đoạn này.",
    createdAt: "2024-01-15T11:00:00Z",
    likes: 8,
    isLiked: false,
    replies: [
      {
        id: "1-1",
        author: {
          id: "1",
          name: "Nguyễn Văn A",
          username: "nguyenvana",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        },
        content: "Cảm ơn bạn! Bạn có thể chia sẻ thêm kinh nghiệm không?",
        createdAt: "2024-01-15T11:15:00Z",
        likes: 2,
        isLiked: true,
      },
    ],
  },
  {
    id: "2",
    author: {
      id: "3",
      name: "Lê Văn C",
      username: "levanc",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    },
    content:
      "Startup sẽ cho bạn nhiều cơ hội phát triển và học hỏi hơn, nhưng công ty lớn sẽ ổn định hơn. Tùy vào mục tiêu của bạn thôi!",
    createdAt: "2024-01-15T12:30:00Z",
    likes: 15,
    isLiked: false,
  },
  {
    id: "3",
    author: {
      id: "4",
      name: "Phạm Thị D",
      username: "phamthid",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    },
    content:
      "View đẹp quá! 😍 Mình cũng đang tìm việc, có thể giới thiệu không?",
    createdAt: "2024-01-15T14:20:00Z",
    likes: 5,
    isLiked: false,
  },
];

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [currentCommentForAction, setCurrentCommentForAction] = useState<
    string | null
  >(null);
  const [showLikesDialog, setShowLikesDialog] = useState<null | {
    targetId: string;
    targetType: "post" | "comment" | "reply";
  }>(null);
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleLikeComment = (
    commentId: string,
    isReply = false,
    parentId?: string
  ) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (isReply && parentId) {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    }
                  : reply
              ),
            };
          }
        } else if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        return comment;
      })
    );
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    if (replyingTo) {
      // Submit reply
      const reply: Comment = {
        id: Date.now().toString(),
        author: {
          id: "1", // Current user
          name: "Bạn",
          username: "you",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === replyingTo
            ? { ...comment, replies: [...(comment.replies || []), reply] }
            : comment
        )
      );
    } else {
      // Submit new comment
      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          id: "1", // Current user
          name: "Bạn",
          username: "you",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      setComments((prev) => [comment, ...prev]);
    }

    setNewComment("");
    setReplyingTo(null);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleOpenEmojiPicker = (
    commentId: string | null,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 768; // Desktop breakpoint

    // Calculate position relative to button
    let top = buttonRect.bottom + 8;
    let left = buttonRect.left;

    // Desktop specific positioning - center it better
    if (!isMobile) {
      // For desktop, position it more centered relative to the button
      left = buttonRect.left - 500; // Center the 320px picker relative to button
      top = buttonRect.bottom + 100; // Move down more
    }

    // Adjust for viewport boundaries
    if (left + 320 > viewportWidth) {
      left = viewportWidth - 330; // 320px width + 10px margin
    }

    if (top + 400 > viewportHeight) {
      top = buttonRect.top - 408; // 400px height + 8px margin
    }

    // Ensure minimum margins
    if (left < 10) left = 10;
    if (top < 10) top = 10;

    const position = { top, left };

    setEmojiPickerPosition(position);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    // Add emoji to comment input
    setNewComment((prev) => prev + emoji);

    // Focus back to textarea after adding emoji
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 100);
    setShowEmojiPicker(false);
  };

  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const handleOpenActionMenu = (commentId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      top: window.innerHeight / 2 - 150, // Center vertically
      left: window.innerWidth / 2 - 100, // Center horizontally
    };

    setActionMenuPosition(position);
    setCurrentCommentForAction(commentId);
    setShowActionMenu(true);
  };

  const handleCloseActionMenu = () => {
    setShowActionMenu(false);
    setCurrentCommentForAction(null);
  };

  const handleCommentAction = (action: string) => {
    if (!currentCommentForAction) return;

    switch (action) {
      case "report":
        toast({
          title: "Đã báo cáo",
          description: "Bình luận đã được báo cáo.",
        });
        break;
      case "delete":
        toast({
          title: "Đã xóa",
          description: "Bình luận đã được xóa.",
        });
        break;
      case "edit":
        toast({
          title: "Chỉnh sửa",
          description: "Tính năng chỉnh sửa đang được phát triển.",
        });
        break;
      default:
        break;
    }
    handleCloseActionMenu();
  };

  const handleOpenLikesDialog = (
    targetId: string,
    targetType: "post" | "comment" | "reply"
  ) => {
    setShowLikesDialog({ targetId, targetType });
  };

  const handleCloseLikesDialog = () => {
    setShowLikesDialog(null);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderComment = (
    comment: Comment,
    isReply = false,
    parentId?: string
  ) => (
    <div key={comment.id} className={`space-y-3 ${isReply ? "ml-12" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {comment.author.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-foreground">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-2 ml-3">
            {comment.likes > 0 && (
              <button
                type="button"
                onClick={() =>
                  handleOpenLikesDialog(
                    comment.id,
                    isReply ? "reply" : "comment"
                  )
                }
                className="text-xs text-muted-foreground hover:underline"
              >
                {comment.likes} lượt thích
              </button>
            )}

            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.isLiked
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart
                className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`}
              />
              Thích
            </button>

            {!isReply && (
              <button
                onClick={() => handleReply(comment.id)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Trả lời
              </button>
            )}

            <button
              onClick={(e) => handleOpenActionMenu(comment.id, e)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {!expandedReplies[comment.id] ? (
            <button
              type="button"
              onClick={() => toggleReplies(comment.id)}
              className="text-xs text-muted-foreground hover:text-foreground ml-12"
            >
              Xem câu trả lời ({comment.replies.length})
            </button>
          ) : (
            <>
              <div className="mt-2 ml-12 border-l-2 border-border/50 pl-4 space-y-3">
                {comment.replies.map((reply) =>
                  renderComment(reply, true, comment.id)
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleReplies(comment.id)}
                className="text-xs text-muted-foreground hover:text-foreground ml-12 mt-2"
              >
                Ẩn câu trả lời
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Comment Input */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Bình luận ({comments.length})
            </h3>

            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    replyingTo ? "Viết trả lời..." : "Viết bình luận..."
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none min-h-[80px] max-h-[120px] rounded-2xl border-border/50 focus:border-primary/50 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenEmojiPicker(null, e)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-muted hover:text-gray-400"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {replyingTo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewComment("");
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Hủy
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="rounded-full px-6"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {replyingTo ? "Trả lời" : "Đăng"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chưa có bình luận nào</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Hãy là người đầu tiên bình luận!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => renderComment(comment))}
              </div>
            )}
          </div>

          {/* Load More Comments */}
          {comments.length > 0 && (
            <div className="text-center pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                Xem thêm bình luận
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={handleCloseEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />

      {/* Action Menu */}
      <ActionMenu
        isOpen={showActionMenu}
        onClose={handleCloseActionMenu}
        position={actionMenuPosition}
        items={[
          {
            label: "Báo cáo",
            action: () => handleCommentAction("report"),
            isDestructive: true,
          },
          {
            label: "Không quan tâm",
            action: () => handleCommentAction("notInterested"),
          },
          { label: "Hủy", action: handleCloseActionMenu },
        ]}
      />

      {/* Likes Dialog */}
      <LikesDialog
        isOpen={!!showLikesDialog}
        onClose={handleCloseLikesDialog}
        title={
          showLikesDialog?.targetType === "comment"
            ? "Lượt thích bình luận"
            : "Lượt thích trả lời"
        }
      />
    </Card>
  );
};
