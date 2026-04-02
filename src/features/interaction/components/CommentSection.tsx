import { ActionMenu } from "@/components/common/ActionMenu";
import { EmojiPicker } from "@/components/common/EmojiPicker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { searchUsers } from "@/features/explore/api/exploreApi";
import type { SearchUserData } from "@/features/explore/types";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Smile,
  RefreshCw,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { formatTimeAgo } from "@/utils/timeFormat";
import { formatNumber } from "@/utils/constants";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getPostCommentsThunk,
  createCommentThunk,
  deleteCommentThunk,
  updateCommentThunk,
  likeCommentThunk,
  clearComments,
  clearCommentError,
} from "../interactionSlice";
import type { Comment } from "../types";
import { cn } from "@/lib/utils";
import { LikesDialog } from "@/features/post/components/LikesDialog";

interface CommentSectionProps {
  postId: number;
  className?: string;
}

export const CommentSection = ({ postId, className }: CommentSectionProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const { comments, isLoading, error, hasMore, currentPage, isCreating } =
    useAppSelector((state) => state.interaction.comments);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionCandidates, setMentionCandidates] = useState<SearchUserData[]>(
    [],
  );
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<SearchUserData[]>([]);
  const mentionDebounceTimer = useRef<NodeJS.Timeout | null>(null);
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

  // Load comments when component mounts
  useEffect(() => {
    dispatch(clearComments());
    dispatch(clearCommentError());
    dispatch(
      getPostCommentsThunk({
        postId,
        params: { pageNo: 0, pageSize: 10 },
      }),
    );

    return () => {
      if (mentionDebounceTimer.current) {
        clearTimeout(mentionDebounceTimer.current);
      }
    };
  }, [dispatch, postId]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      dispatch(
        getPostCommentsThunk({
          postId,
          params: { pageNo: currentPage + 1, pageSize: 10 },
        }),
      );
    }
  };

  const handleRefresh = () => {
    dispatch(clearComments());
    dispatch(
      getPostCommentsThunk({
        postId,
        params: { pageNo: 0, pageSize: 10 },
      }),
    );
  };

  const extractMentionQuery = (text: string, cursor: number) => {
    const beforeCursor = text.slice(0, cursor);
    const lastAt = beforeCursor.lastIndexOf("@");
    if (lastAt === -1) return null;
    if (lastAt > 0 && !/\s/.test(beforeCursor[lastAt - 1])) return null;

    const mentionText = beforeCursor.slice(lastAt + 1);
    // only allow if still typing mention token (no spaces)
    if (mentionText.includes(" ") || mentionText.includes("\n")) return null;

    return mentionText;
  };

  const fetchMentionCandidates = async (query: string) => {
    if (!query.trim()) {
      setMentionCandidates([]);
      setShowMentionMenu(false);
      return;
    }

    try {
      const data = await searchUsers({
        query: query.trim(),
        limit: 5,
        offset: 0,
      });
      setMentionCandidates(data.users || []);
      setShowMentionMenu(data.users.length > 0);
    } catch (error) {
      setMentionCandidates([]);
      setShowMentionMenu(false);
    }
  };

  const handleNewCommentChange = (
    newValue: string,
    cursorPosition: number | null = null,
  ) => {
    setNewComment(newValue);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    const cursor =
      cursorPosition ?? textareaRef.current?.selectionStart ?? newValue.length;
    const mentionText = extractMentionQuery(newValue, cursor);

    if (mentionDebounceTimer.current) {
      clearTimeout(mentionDebounceTimer.current);
    }

    if (mentionText !== null && mentionText.length >= 1) {
      setMentionQuery(mentionText);
      mentionDebounceTimer.current = setTimeout(() => {
        fetchMentionCandidates(mentionText);
      }, 300);
    } else {
      setMentionQuery("");
      setMentionCandidates([]);
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (user: SearchUserData) => {
    if (!textareaRef.current) return;

    const cursor = textareaRef.current.selectionStart;
    const value = newComment;
    const beforeCursor = value.slice(0, cursor);
    const lastAt = beforeCursor.lastIndexOf("@");
    if (lastAt === -1) return;

    const afterCursor = value.slice(cursor);
    const mentionText = `@${user.username} `;
    const nextValue = `${value.slice(0, lastAt)}${mentionText}${afterCursor}`;

    setNewComment(nextValue);
    setMentionedUsers((prev) => {
      const found = prev.some((item) => item.id === user.id);
      if (found) return prev;
      return [...prev, user];
    });
    setMentionQuery("");
    setMentionCandidates([]);
    setShowMentionMenu(false);

    setTimeout(() => {
      const pos = lastAt + mentionText.length;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleRemoveMention = (id: number) => {
    setMentionedUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const clearMentionState = () => {
    setMentionQuery("");
    setMentionCandidates([]);
    setShowMentionMenu(false);
    setMentionedUsers([]);
  };

  const handleLikeComment = async (
    commentId: string,
    isReply = false,
    parentId?: string,
  ) => {
    try {
      await dispatch(likeCommentThunk(parseInt(commentId))).unwrap();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error as string,
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId,
          reelId: 0,
          parentId: replyingTo ? parseInt(replyingTo) : 0,
          content: newComment.trim(),
          listMentionUserId: mentionedUsers.map((user) => user.id),
        }),
      ).unwrap();

      setNewComment("");
      setReplyingTo(null);
      clearMentionState();
      handleRefresh(); // Refresh to show new comment
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error as string,
      });
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editingContent.trim() || !user) return;

    // Find the comment to get its parentId
    const findComment = (comments: Comment[], id: string): Comment | null => {
      for (const comment of comments) {
        if (comment.id === id) return comment;
        if (comment.replies) {
          const found = findComment(comment.replies, id);
          if (found) return found;
        }
      }
      return null;
    };

    const commentToUpdate = findComment(comments, editingComment);

    try {
      await dispatch(
        updateCommentThunk({
          id: parseInt(editingComment),
          userId: user.id,
          postId,
          reelId: 0,
          parentId: commentToUpdate?.parentId
            ? parseInt(commentToUpdate.parentId)
            : 0,
          content: editingContent.trim(),
          listMentionUserId: mentionedUsers.map((user) => user.id),
        }),
      ).unwrap();

      setEditingComment(null);
      setEditingContent("");
      clearMentionState();
      handleRefresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error as string,
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await dispatch(deleteCommentThunk(parseInt(commentId))).unwrap();
      handleRefresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error as string,
      });
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleEdit = (commentId: string, content: string) => {
    setEditingComment(commentId);
    setEditingContent(content);
  };

  const handleOpenEmojiPicker = (
    commentId: string | null,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 768;

    let top = buttonRect.bottom + 8;
    let left = buttonRect.left;

    if (!isMobile) {
      left = buttonRect.left - 500;
      top = buttonRect.bottom + 100;
    }

    if (left + 320 > viewportWidth) {
      left = viewportWidth - 330;
    }

    if (top + 400 > viewportHeight) {
      top = buttonRect.top - 408;
    }

    if (left < 10) left = 10;
    if (top < 10) top = 10;

    const position = { top, left };
    setEmojiPickerPosition(position);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (editingComment) {
      setEditingContent((prev) => prev + emoji);
    } else {
      setNewComment((prev) => prev + emoji);
    }

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
      top: window.innerHeight / 2 - 150,
      left: window.innerWidth / 2 - 100,
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
      case "delete":
        handleDeleteComment(currentCommentForAction);
        break;
      case "edit": {
        const comment = findCommentById(currentCommentForAction);
        if (comment) {
          handleEdit(comment.id, comment.content);
        }
        break;
      }
      case "report":
        toast({
          title: "Đã báo cáo",
          description: "Bình luận đã được báo cáo.",
        });
        break;
      default:
        break;
    }
    handleCloseActionMenu();
  };

  const findCommentById = (commentId: string): Comment | null => {
    const searchInComments = (comments: Comment[]): Comment | null => {
      for (const comment of comments) {
        if (comment.id === commentId) return comment;
        if (comment.replies.length > 0) {
          const found = searchInComments(comment.replies);
          if (found) return found;
        }
      }
      return null;
    };
    return searchInComments(comments);
  };

  const handleOpenLikesDialog = (
    targetId: string,
    targetType: "post" | "comment" | "reply",
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
    parentId?: string,
  ) => {
    const isEditing = editingComment === comment.id;

    return (
      <div key={comment.id} className={cn("space-y-3", isReply && "ml-12")}>
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={comment.avatarUrl} alt={comment.userName} />
            <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="resize-none min-h-[60px] max-h-[120px] rounded-2xl"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingComment(null);
                      setEditingContent("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateComment}
                    disabled={!editingContent.trim() || isLoading}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-muted/50 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>

                <div className="flex items-center gap-4 mt-2 ml-3">
                  {comment.likesCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenLikesDialog(
                          comment.id,
                          isReply ? "reply" : "comment",
                        )
                      }
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      {formatNumber(comment.likesCount)} lượt thích
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleLikeComment(comment.id, isReply, parentId)
                    }
                    className={cn(
                      "flex items-center gap-1 text-xs transition-colors",
                      comment.isLiked
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-red-500",
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-3 h-3",
                        comment.isLiked && "fill-current",
                      )}
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
              </>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="ml-11 mt-3">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage
                  src={user?.avatar}
                  alt={user?.username || "User"}
                />
                <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  ref={textareaRef}
                  placeholder={`Trả lời ${comment.userName}...`}
                  value={newComment}
                  onChange={(e) =>
                    handleNewCommentChange(
                      e.target.value,
                      e.target.selectionStart,
                    )
                  }
                  className="resize-none min-h-[60px] max-h-[120px] rounded-2xl"
                />
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleOpenEmojiPicker(null, e)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setNewComment("");
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isCreating}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Trả lời
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    renderComment(reply, true, comment.id),
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
  };

  if (error) {
    return (
      <Card
        className={cn(
          "border-0 shadow-xl bg-card/80 backdrop-blur-sm",
          className,
        )}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-0 shadow-xl bg-card/80 backdrop-blur-sm",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Comment Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Bình luận ({comments.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isLoading && "animate-spin")}
                />
              </Button>
            </div>

            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage
                  src={user?.avatar}
                  alt={user?.username || "User"}
                />
                <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    replyingTo ? "Viết trả lời..." : "Viết bình luận..."
                  }
                  value={newComment}
                  onChange={(e) =>
                    handleNewCommentChange(
                      e.target.value,
                      e.target.selectionStart,
                    )
                  }
                  className="resize-none min-h-[80px] max-h-[120px] rounded-2xl border-border/50 focus:border-primary/50 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50"
                />

                {mentionedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mentionedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm border border-blue-200 dark:border-blue-800"
                      >
                        <Avatar className="w-4 h-4 flex-shrink-0">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-blue-700 dark:text-blue-300 font-medium">
                          @{user.username}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMention(user.id)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showMentionMenu && mentionCandidates.length > 0 && (
                  <div className="absolute z-50 bottom-full mb-1 w-full max-h-44 overflow-auto rounded-md border border-border bg-background shadow-lg">
                    {mentionCandidates.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-3"
                        onClick={() => handleSelectMention(candidate)}
                      >
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarImage
                            src={candidate.avatar}
                            alt={candidate.username}
                          />
                          <AvatarFallback className="text-xs">
                            {candidate.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            @{candidate.username}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {candidate.fullName}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

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
                      disabled={!newComment.trim() || isCreating}
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
            {isLoading && comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Đang tải bình luận...</p>
              </div>
            ) : comments.length === 0 ? (
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
          {hasMore && comments.length > 0 && (
            <div className="text-center pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-primary hover:text-primary/80"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  "Xem thêm bình luận"
                )}
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
          ...(currentCommentForAction &&
          user &&
          findCommentById(currentCommentForAction)?.userId ===
            user.id.toString()
            ? [
                {
                  label: "Chỉnh sửa",
                  action: () => handleCommentAction("edit"),
                },
                {
                  label: "Xóa",
                  action: () => handleCommentAction("delete"),
                  isDestructive: true,
                },
              ]
            : []),
          {
            label: "Báo cáo",
            action: () => handleCommentAction("report"),
            isDestructive: true,
          },
          { label: "Hủy", action: handleCloseActionMenu },
        ]}
      />

      {/* Likes Dialog */}
      <LikesDialog
        isOpen={!!showLikesDialog}
        onClose={handleCloseLikesDialog}
        targetType={
          showLikesDialog?.targetType === "comment"
            ? "comment"
            : showLikesDialog?.targetType === "reply"
              ? "comment"
              : showLikesDialog?.targetType === "post"
                ? "post"
                : undefined
        }
        targetId={
          showLikesDialog &&
          (showLikesDialog.targetType === "comment" ||
            showLikesDialog.targetType === "reply" ||
            showLikesDialog.targetType === "post")
            ? parseInt(showLikesDialog.targetId)
            : undefined
        }
        title={
          showLikesDialog?.targetType === "comment"
            ? "Lượt thích bình luận"
            : "Lượt thích trả lời"
        }
      />
    </Card>
  );
};
