import { useState, useRef, useEffect, useMemo } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import {
  X,
  MoreHorizontal,
  Smile,
  MessageCircle,
  Send,
  Bookmark,
  ArrowLeft,
  ImageOff,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "@/components/common/EmojiPicker";
import { ActionMenu, ActionMenuItem } from "@/components/common/ActionMenu";
import { LikesDialog } from "./LikesDialog";
import { useBookmark } from "@/features/saved/hooks/useBookmark";
import { MediaSlider } from "./MediaSlider";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import { formatTimeAgo } from "@/utils/timeFormat";
import { LikeButton } from "@/features/interaction/components/LikeButton";
import { parseMentions } from "@/utils/mentions";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getPostCommentsThunk,
  getCommentRepliesThunk,
  createCommentThunk,
  likeCommentThunk,
  deleteCommentThunk,
  updateCommentThunk,
  clearComments,
  clearCommentError,
} from "@/features/interaction/interactionSlice";
import { Loader } from "@/components/common/Loader";
import { useToast } from "@/hooks/use-toast";
import { getPostLikeDetailThunk } from "@/features/interaction";
import { navigateToProfile, navigateToPost } from "@/utils/navigation";
import { useNavigate } from "react-router-dom";
import { ReportPostDialog } from "@/features/post/components/ReportPostDialog";
import { reportComment } from "../api/postApi";
import { searchUsers } from "@/features/explore/api/exploreApi";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchUserData } from "@/features/explore/types";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
  hasMoreReplies?: boolean;
  emojiReactions?: Array<{
    emoji: string;
    count: number;
    isReacted: boolean;
  }>;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  caption: string;
  media: Array<{
    id: string;
    type: "image" | "video";
    url: string;
    alt?: string;
  }>;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  visibility?: "PUBLIC" | "PRIVATE" | "public" | "private";
  emojiReactions?: Array<{
    emoji: string;
    count: number;
    isReacted: boolean;
  }>;
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onLikeComment: (commentId: string) => void;
  onReplyComment: (commentId: string, content: string, postId?: string) => void;
  onLikePost: (postId: string) => void;
  onShare?: (postId: string, userIds: string[], message: string) => void;
  onOpenShareDialog?: () => void;
  isShareDialogOpen?: boolean;
  isPostLiked: boolean;
  onPostLikeChange?: (isLiked: boolean, newCount: number) => void;
  onPostLikeSuccess?: () => void;
  onAddEmojiReaction?: (commentId: string, emoji: string) => void;
  onAddPostEmojiReaction?: (postId: string, emoji: string) => void;
  isAuthorFollowed?: boolean;
  onToggleFollowAuthor?: (userId: string, nextIsFollowing: boolean) => void;
  actionMenuItems?: ActionMenuItem[];
  onNavigateToProfile?: (userName: string) => void;
  onNavigateToPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => Promise<void>;
}

export const CommentDialog = ({
  isOpen,
  onClose,
  post,
  comments,
  onAddComment,
  onLikeComment,
  onReplyComment,
  onLikePost,
  onShare,
  onOpenShareDialog,
  isShareDialogOpen = false,
  isPostLiked,
  onPostLikeChange,
  onPostLikeSuccess,
  onAddEmojiReaction,
  onAddPostEmojiReaction,
  isAuthorFollowed,
  onToggleFollowAuthor,
  actionMenuItems,
  onNavigateToProfile,
  onNavigateToPost,
  onDeletePost,
}: CommentDialogProps) => {
  // Use bookmark hook
  const { isBookmarked, toggleBookmark } = useBookmark();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const {
    comments: reduxComments,
    isLoading: commentsLoading,
    error: commentsError,
    hasMore: hasMoreComments,
    currentPage: commentsCurrentPage,
  } = useAppSelector((state) => state.interaction.comments);
  const [isMobile, setIsMobile] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [currentCommentForEmoji, setCurrentCommentForEmoji] = useState<
    string | null
  >(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [currentCommentForAction, setCurrentCommentForAction] = useState<
    string | null
  >(null);
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  // Track pagination state for replies of each comment
  const [repliesPageNo, setRepliesPageNo] = useState<Record<string, number>>(
    {},
  );
  const [repliesHasMore, setRepliesHasMore] = useState<Record<string, boolean>>(
    {},
  );
  const [repliesLoading, setRepliesLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [repliesTotalElements, setRepliesTotalElements] = useState<
    Record<string, number>
  >({});
  const [likedById, setLikedById] = useState<Record<string, boolean>>({});
  const [likesCountById, setLikesCountById] = useState<Record<string, number>>(
    {},
  );
  const [isPostLikedLocal, setIsPostLikedLocal] = useState(isPostLiked);
  const normalizedVisibility = (post.visibility ?? "").trim().toUpperCase();
  const hasValidVisibility =
    normalizedVisibility === "PUBLIC" || normalizedVisibility === "PRIVATE";
  const isPrivatePost = normalizedVisibility === "PRIVATE";
  const privacyLabel = isPrivatePost ? "Chỉ mình tôi" : "Công khai";
  const PrivacyIcon = isPrivatePost ? Lock : Globe;
  const privacyClassName = isPrivatePost
    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    : "bg-primary/10 text-primary";
  const [postLikesCount, setPostLikesCount] = useState(post.likesCount || 0);
  const [latestLikeName, setLatestLikeName] = useState<string | null>(null);
  const [hasFetchedLikePreview, setHasFetchedLikePreview] = useState(false);
  const [isLoadingLikePreview, setIsLoadingLikePreview] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionCandidates, setMentionCandidates] = useState<SearchUserData[]>(
    [],
  );
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<SearchUserData[]>([]);
  const mentionDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [showLikesDialog, setShowLikesDialog] = useState<null | {
    targetId: string;
    targetType: "post" | "comment" | "reply";
  }>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(
    null,
  );
  const isPostLikeInteracting = useRef(false);
  const interactingCommentIds = useRef<Set<string>>(new Set());

  // Sync post like state when prop changes or dialog opens - ensure it's always in sync with API data per user
  useEffect(() => {
    if (!isPostLikeInteracting.current) {
      setIsPostLikedLocal(isPostLiked);
      setPostLikesCount(post.likesCount || 0);
    }
  }, [post.id, isPostLiked, post.likesCount, isOpen]);

  // Fetch comments when dialog opens
  useEffect(() => {
    if (isOpen && post.id) {
      dispatch(clearComments());
      dispatch(clearCommentError());
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 6 },
        }),
      );
    }
  }, [dispatch, isOpen, post.id]);

  // Fetch like preview for the post when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    const run = async () => {
      try {
        setIsLoadingLikePreview(true);
        setHasFetchedLikePreview(true);
        const data = await dispatch(
          getPostLikeDetailThunk({
            postId: parseInt(post.id),
            params: { pageNo: 0, pageSize: 1 },
          }),
        ).unwrap();
        const total = data.totalElements ?? 0;
        setPostLikesCount(total);

        if (data.content && data.content.length > 0) {
          // Lấy user đầu tiên (người like mới nhất)
          // Nếu là chính mình (isFollowing === null) và có user khác, lấy user tiếp theo
          const firstUser = data.content[0];
          if (firstUser.isFollowing === null && data.content.length > 1) {
            // Là chính mình, lấy user tiếp theo
            setLatestLikeName(data.content[1].userName);
          } else {
            // Lấy user đầu tiên
            setLatestLikeName(firstUser.userName);
          }
        } else {
          setLatestLikeName(null);
        }
      } catch (_) {
        // Keep flag as true to prevent infinite retry
      } finally {
        setIsLoadingLikePreview(false);
      }
    };
    run();
  }, [dispatch, isOpen, post.id]);

  // Load more comments function
  const handleLoadMoreComments = () => {
    if (hasMoreComments && !commentsLoading && post.id) {
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(post.id),
          params: { pageNo: commentsCurrentPage + 1, pageSize: 6 },
        }),
      );
    }
  };

  // Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll(handleLoadMoreComments, {
    hasMore: hasMoreComments,
    isLoading: commentsLoading,
    error: commentsError,
    threshold: 200, // Load when 200px from bottom
  });

  // Transform Redux comments to Comment format for backward compatibility
  const displayComments: Comment[] = useMemo(() => {
    return reduxComments.map((comment) => ({
      id: comment.id,
      userId: comment.userId.toString(),
      userName: comment.userName,
      avatarUrl: comment.avatarUrl,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: comment.isLiked,
      createdAt: comment.createdAt,
      hasMoreReplies: comment.hasMoreReplies,
      replies: comment.replies?.map((reply) => ({
        id: reply.id,
        userId: reply.userId.toString(),
        userName: reply.userName,
        avatarUrl: reply.avatarUrl,
        content: reply.content,
        likesCount: reply.likesCount,
        isLiked: reply.isLiked,
        createdAt: reply.createdAt,
      })),
    }));
  }, [reduxComments]);

  // Create index map: commentId -> rootCommentId for O(1) lookup
  // This optimizes finding root comment when replying to a reply
  const rootCommentIdMap = useMemo(() => {
    const map = new Map<string, string>();

    // Index root comments (they are their own root)
    for (const comment of reduxComments) {
      map.set(comment.id, comment.id);

      // Index replies (their root is the parent comment)
      if (comment.replies) {
        for (const reply of comment.replies) {
          // All replies have the same root parent (the root comment)
          map.set(reply.id, comment.id);
        }
      }
    }

    return map;
  }, [reduxComments]);

  // Auto-add @username when replying to a comment
  useEffect(() => {
    if (replyingTo) {
      // Find the comment being replied to (could be in root comments or replies)
      let targetComment: Comment | null = null;

      // Search in root comments
      for (const comment of displayComments) {
        if (comment.id === replyingTo) {
          targetComment = comment;
          break;
        }
        // Search in replies
        if (comment.replies) {
          for (const reply of comment.replies) {
            if (reply.id === replyingTo) {
              targetComment = reply;
              break;
            }
          }
        }
        if (targetComment) break;
      }

      if (targetComment) {
        // Always set @username when replying to a comment
        const mentionText = `@${targetComment.userName} `;
        // Only set if replyContent is empty or doesn't already start with this mention
        const currentContent = replyContent.trim();
        if (
          !currentContent ||
          !currentContent.startsWith(`@${targetComment.userName}`)
        ) {
          setReplyContent(mentionText);
          // Focus the textarea after setting value
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              // Move cursor to end
              const length = textareaRef.current.value.length;
              textareaRef.current.setSelectionRange(length, length);
            }
          }, 0);
        }
      }
    } else {
      // Clear reply content when not replying
      setReplyContent("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyingTo, displayComments]);

  // Get total replies count for a comment (from state or fallback to replies length)
  const getTotalRepliesCount = (commentId: string): number => {
    if (repliesTotalElements[commentId] !== undefined) {
      return repliesTotalElements[commentId];
    }
    // Fallback: if we have hasMoreReplies but no totalElements yet, use comment.replies.length
    const comment = displayComments.find((c) => c.id === commentId);
    if (comment?.hasMoreReplies || comment?.replies) {
      return comment.replies?.length || 0;
    }
    return 0;
  };

  const renderReplyItem = (reply: Comment, parentCommentId: string) => {
    return (
      <div
        key={reply.id}
        className="group/reply flex items-start gap-3"
        onMouseEnter={() => setHoveredItemId(reply.id)}
        onMouseLeave={() => setHoveredItemId(null)}
      >
        <div className="relative">
          <Avatar 
            className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => handleProfileClick(reply.userName, e)}
          >
            <AvatarImage
              src={getAvatarUrl(reply.avatarUrl)}
              alt={reply.userName}
            />
            <AvatarFallback>{getAvatarInitials(reply.userName)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          {editingComment === reply.id ? (
            <div className="space-y-2">
              <Textarea
                autoFocus
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="resize-none min-h-[60px] max-h-[120px] rounded-xl text-sm"
                onFocus={(e) => {
                  const temp = e.target.value;
                  e.target.value = '';
                  e.target.value = temp;
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setEditingComment(null);
                    setEditingContent("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleUpdateComment}
                  disabled={!editingContent.trim()}
                >
                  Lưu
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="font-semibold text-sm cursor-pointer hover:underline"
                  onClick={(e) => handleProfileClick(reply.userName, e)}
                >
                  {reply.userName}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-2">
                {parseMentions(reply.content, (username) => {
                  handleProfileClick(username);
                })}
              </p>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                <span 
                  className="text-xs text-gray-500"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {formatTimeAgo(reply.createdAt)}
                </span>
                {getLikesCount(reply.id, reply.likesCount) > 0 && (
                  <button
                    type="button"
                    onClick={() => openLikesDialog(reply.id, "reply")}
                    className="text-xs text-gray-500 hover:underline"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {getLikesCount(reply.id, reply.likesCount)} lượt thích
                  </button>
                )}
                <button
                  onClick={() => setReplyingTo(reply.id)}
                  className="text-xs text-gray-500 hover:text-gray-600 transition-colors font-semibold"
                  type="button"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Trả lời
                </button>
                <button
                  onClick={(e) => handleOpenActionMenu(reply.id, e)}
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 p-1 transition-opacity",
                    hoveredItemId === reply.id ? "opacity-100" : "opacity-0",
                  )}
                  aria-label="Tùy chọn"
                  type="button"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <MoreHorizontal className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </>
          )}
        </div>

        <LikeButton
          targetId={parseInt(reply.id)}
          targetType="comment"
          isLiked={getIsLiked(reply.id, reply.isLiked)}
          likesCount={getLikesCount(reply.id, reply.likesCount)}
          size="sm"
          showCount={false}
          onLikeChange={(newIsLiked, newCount) =>
            handleCommentLikeChange(reply.id, newIsLiked, newCount)
          }
          className="p-0 text-gray-400 hover:text-red-500"
        />
      </div>
    );
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset like state from API data - don't merge with previous state to ensure correct per-user state
    const incomingLiked: Record<string, boolean> = {};
    const incomingCounts: Record<string, number> = {};
    const walk = (items: Comment[]) => {
      for (const c of items) {
        // Skip syncing if we are currently interacting with this specific comment
        if (!interactingCommentIds.current.has(c.id)) {
          incomingLiked[c.id] = c.isLiked;
          incomingCounts[c.id] = c.likesCount;
        }
        if (c.replies && c.replies.length) walk(c.replies);
      }
    };
    walk(displayComments);
    // Always use API data as source of truth - reset state, don't merge
    setLikedById((prev) => ({ ...prev, ...incomingLiked }));
    setLikesCountById((prev) => ({ ...prev, ...incomingCounts }));
  }, [displayComments]);

  const getIsLiked = (id: string, fallback?: boolean) => {
    return likedById[id] ?? fallback ?? false;
  };
  const getLikesCount = (id: string, fallback?: number) => {
    return likesCountById[id] ?? fallback ?? 0;
  };

  const handleToggleLike = (id: string) => {
    const newIsLiked = !getIsLiked(id);
    setLikedById((prev) => ({ ...prev, [id]: newIsLiked }));
    setLikesCountById((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + (newIsLiked ? 1 : -1),
    }));
    onLikeComment(id);
  };

  const handleCommentLikeChange = (
    commentId: string,
    newIsLiked: boolean,
    newCount: number,
  ) => {
    interactingCommentIds.current.add(commentId);
    setLikedById((prev) => ({ ...prev, [commentId]: newIsLiked }));
    setLikesCountById((prev) => ({ ...prev, [commentId]: newCount }));

    setTimeout(() => {
      interactingCommentIds.current.delete(commentId);
    }, 1000);
  };

  const handlePostLikeChange = (
    newIsLiked: boolean,
    newCount: number,
  ) => {
    isPostLikeInteracting.current = true;
    setIsPostLikedLocal(newIsLiked);
    setPostLikesCount(newCount);

    // Notify parent to optimistically sync heart state and likes count
    onPostLikeChange?.(newIsLiked, newCount);

    setTimeout(() => {
      isPostLikeInteracting.current = false;
    }, 1000);
  };

  const handlePostLikeSuccess = async () => {
    // Call API to sync back likes list (preview name) after successful API completion
    try {
      setIsLoadingLikePreview(true);
      const data = await dispatch(
        getPostLikeDetailThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 1 },
        }),
      ).unwrap();
      const total = data.totalElements ?? 0;
      setPostLikesCount(total);

      if (data.content && data.content.length > 0) {
        setLatestLikeName(data.content[0].userName);
      } else {
        setLatestLikeName(null);
      }

      // Notify parent to sync likes preview name and total count from API
      onPostLikeSuccess?.();
    } catch (_) {
      // Keep optimistic UI if API fails
    } finally {
      setIsLoadingLikePreview(false);
    }
  };

  const openLikesDialog = (
    targetId: string,
    targetType: "post" | "comment" | "reply",
  ) => {
    setShowLikesDialog({ targetId, targetType });
  };
  const closeLikesDialog = () => setShowLikesDialog(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if ShareDialog is open
      if (isShareDialogOpen) return;

      // Don't close if emoji picker is open
      if (showEmojiPicker) return;

      // Don't close if ActionMenu is open
      if (showActionMenu) return;

      // Don't close if LikesDialog is open
      if (showLikesDialog) return;

      // Don't close if Delete Confirm is open
      if (showDeleteConfirm) return;

      // Don't close if Report Dialog is open
      if (showReportDialog) return;

      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "contain";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.overscrollBehavior = "";
      if (mentionDebounceTimer.current) {
        clearTimeout(mentionDebounceTimer.current);
      }
    };
  }, [
    isOpen,
    onClose,
    isShareDialogOpen,
    showEmojiPicker,
    showActionMenu,
    showLikesDialog,
    showDeleteConfirm,
    showReportDialog,
  ]);

  const extractMentionQuery = (text: string, cursor: number) => {
    const beforeCursor = text.slice(0, cursor);
    const lastAt = beforeCursor.lastIndexOf("@");
    if (lastAt === -1) return null;
    if (lastAt > 0 && !/\s/.test(beforeCursor[lastAt - 1])) return null;

    const mentionText = beforeCursor.slice(lastAt + 1);
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
      setMentionCandidates(data.content || []);
      setShowMentionMenu(data.content.length > 0);
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

  const handleRemoveMention = (userId: number) => {
    setMentionedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const clearMentionState = () => {
    setMentionQuery("");
    setMentionCandidates([]);
    setShowMentionMenu(false);
    setMentionedUsers([]);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(post.id),
          reelId: 0,
          parentId: 0,
          content: newComment.trim(),
          listMentionUserId: mentionedUsers.map((user) => user.id),
        }),
      ).unwrap();

      setNewComment("");
      clearMentionState();

      // Refresh comments to show the new comment (only in dialog)
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 6 },
        }),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm bình luận. Vui lòng thử lại.",
      });
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo || !user) return;

    const contentToSubmit = replyContent.trim();
    const replyingToId = replyingTo;

    // Find root comment ID using optimized index map (O(1) lookup)
    // All replies share the same parentId (root comment), not the immediate parent
    const rootCommentId = rootCommentIdMap.get(replyingToId) || replyingToId;

    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(post.id),
          reelId: 0,
          parentId: parseInt(rootCommentId), // Always use root comment as parentId
          content: contentToSubmit,
          listMentionUserId: [],
        }),
      ).unwrap();

      setReplyContent("");
      setReplyingTo(null);

      // Refresh comments to show the new reply (only in dialog)
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 6 },
        }),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm bình luận. Vui lòng thử lại.",
      });
    }
  };

  const handleOpenShareDialog = () => {
    if (onOpenShareDialog) {
      onOpenShareDialog();
    }
  };

  const handleOpenEmojiPicker = (
    commentId: string | null,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    // Position like Instagram - fixed position
    const position = {
      top: 350, // Fixed top position
      right: 310, // Fixed right position
    };

    setEmojiPickerPosition(position);
    setCurrentCommentForEmoji(commentId);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (currentCommentForEmoji && onAddEmojiReaction) {
      // Add emoji reaction to comment
      onAddEmojiReaction(currentCommentForEmoji, emoji);
    } else if (!currentCommentForEmoji && onAddPostEmojiReaction) {
      // Add emoji reaction to post
      onAddPostEmojiReaction(post.id, emoji);
    } else {
      // Add emoji to comment input
      if (replyingTo) {
        setReplyContent((prev) => prev + emoji);
      } else {
        setNewComment((prev) => prev + emoji);
      }

      // Focus back to textarea after adding emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Move cursor to end of text
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 100);
    }
    setShowEmojiPicker(false);
    setCurrentCommentForEmoji(null);
  };

  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
    setCurrentCommentForEmoji(null);
  };

  const handleOpenActionMenu = (commentId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setActionMenuPosition(undefined);
    setCurrentCommentForAction(commentId);
    setShowActionMenu(true);

    // Prevent dialog from closing when ActionMenu is open
    event.stopPropagation();
  };


  const handleCloseActionMenu = () => {
    setShowActionMenu(false);
    setCurrentCommentForAction(null);
  };

  const toggleReplies = async (commentId: string) => {
    const isExpanding = !expandedReplies[commentId];
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));

    // Load replies when expanding (if not already loaded)
    if (isExpanding) {
      const comment = reduxComments.find((c) => c.id === commentId);
      const currentPageNo = repliesPageNo[commentId] ?? -1;

      // Only load if replies haven't been loaded yet (pageNo is -1)
      if (
        currentPageNo === -1 &&
        (!comment?.replies ||
          comment.replies.length === 0 ||
          comment.hasMoreReplies)
      ) {
        setRepliesLoading((prev) => ({ ...prev, [commentId]: true }));
        try {
          const result = await dispatch(
            getCommentRepliesThunk({
              commentId: parseInt(commentId),
              params: { pageNo: 0, pageSize: 6 },
            }),
          ).unwrap();

          // Update pagination state
          setRepliesPageNo((prev) => ({ ...prev, [commentId]: 0 }));
          setRepliesHasMore((prev) => ({
            ...prev,
            [commentId]: !result.data.last,
          }));
          setRepliesTotalElements((prev) => ({
            ...prev,
            [commentId]: result.data.totalElements || 0,
          }));
        } catch (error) {
          console.error("Error loading replies:", error);
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể tải câu trả lời. Vui lòng thử lại.",
          });
          // Revert expansion on error
          setExpandedReplies((prev) => ({ ...prev, [commentId]: false }));
        } finally {
          setRepliesLoading((prev) => ({ ...prev, [commentId]: false }));
        }
      }
    }
    // When collapsing, no need to wait - state already updated above
  };

  const handleLoadMoreReplies = async (commentId: string) => {
    if (repliesLoading[commentId] || !repliesHasMore[commentId]) return;

    const nextPageNo = (repliesPageNo[commentId] ?? 0) + 1;
    setRepliesLoading((prev) => ({ ...prev, [commentId]: true }));

    try {
      const result = await dispatch(
        getCommentRepliesThunk({
          commentId: parseInt(commentId),
          params: { pageNo: nextPageNo, pageSize: 6 },
        }),
      ).unwrap();

      // Update pagination state
      setRepliesPageNo((prev) => ({ ...prev, [commentId]: nextPageNo }));
      setRepliesHasMore((prev) => ({
        ...prev,
        [commentId]: !result.data.last,
      }));
      // Update totalElements if it's larger (in case of new replies)
      setRepliesTotalElements((prev) => ({
        ...prev,
        [commentId]: Math.max(
          prev[commentId] || 0,
          result.data.totalElements || 0,
        ),
      }));
    } catch (error) {
      console.error("Error loading more replies:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thêm câu trả lời. Vui lòng thử lại.",
      });
    } finally {
      setRepliesLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await dispatch(deleteCommentThunk(parseInt(commentId))).unwrap();

      // Refresh comments after deletion
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 5 },
        }),
      );

      handleCloseActionMenu();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa bình luận. Vui lòng thử lại.",
      });
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editingContent.trim() || !user) return;

    // Find parentId (root parent if nested, else 0)
    let parentId = 0;
    for (const rootComment of displayComments) {
      if (rootComment.id === editingComment) {
        parentId = 0;
        break;
      }
      if (rootComment.replies) {
        const found = rootComment.replies.some((r) => r.id === editingComment);
        if (found) {
          parentId = parseInt(rootComment.id);
          break;
        }
      }
    }

    try {
      await dispatch(
        updateCommentThunk({
          id: parseInt(editingComment),
          userId: user.id,
          postId: parseInt(post.id),
          reelId: 0,
          parentId,
          content: editingContent.trim(),
          listMentionUserId: [],
        }),
      ).unwrap();

      setEditingComment(null);
      setEditingContent("");

      // Silent refresh
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 6 },
        }),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể chỉnh sửa bình luận. Vui lòng thử lại.",
      });
    }
  };

  const handleCommentAction = (action: string) => {
    switch (action) {
      case "report":
        if (currentCommentForAction && currentCommentForAction !== "post") {
          setReportingCommentId(currentCommentForAction);
          setShowReportDialog(true);
        }
        handleCloseActionMenu();
        break;
      case "delete":
        // Handle delete comment - will be handled by handleDeleteComment
        if (currentCommentForAction && currentCommentForAction !== "post") {
          handleDeleteComment(currentCommentForAction);
        }
        break;
      case "edit":
        if (currentCommentForAction && currentCommentForAction !== "post") {
          // Find the comment content
          let comment = displayComments.find((c) => c.id === currentCommentForAction);
          if (!comment) {
            for (const rc of displayComments) {
              if (rc.replies) {
                const found = rc.replies.find((r) => r.id === currentCommentForAction);
                if (found) {
                  comment = found;
                  break;
                }
              }
            }
          }
          if (comment) {
            setEditingComment(comment.id);
            setEditingContent(comment.content);
          }
        }
        handleCloseActionMenu();
        break;
      case "goToPost":
        // Navigate to post detail page
        if (onNavigateToPost) {
          onNavigateToPost(post.id);
        } else {
          navigateToPost(navigate, post.id);
        }
        handleCloseActionMenu();
        onClose();
        break;
      case "copyLink":
        { const postUrl = `${window.location.origin}/posts/${post.id}`;
        navigator.clipboard?.writeText(postUrl)
          .then(() => {
            toast({
              variant: "success",
              title: "Đã sao chép liên kết",
              description: "Liên kết bài viết đã được sao chép vào bộ nhớ tạm.",
            });
          })
          .catch(() => {
            toast({
              variant: "destructive",
              title: "Lỗi",
              description: "Không thể sao chép liên kết.",
            });
          });
        handleCloseActionMenu();
        break; }
      default:
        break;
    }
  };

  const handleDeletePostClick = () => {
    handleCloseActionMenu();
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    // Ensure we reopen menu for post (not comment)
    setCurrentCommentForAction("post");
    setShowActionMenu(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (onDeletePost) {
      await onDeletePost(post.id);
      onClose();
    }
  };

  const handleProfileClick = (userName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onNavigateToProfile) onNavigateToProfile(userName);
    else navigateToProfile(navigate, userName);
    onClose();
  };

  if (!isOpen) return null;

  // Mobile version - simple and clean
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[40] flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pt-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-lg">Bình luận</h1>
          <div className="w-8"></div>
        </div>

        {/* Post Content */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <div
              className="cursor-pointer"
              onClick={(e) => handleProfileClick(post.userName, e)}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={getAvatarUrl(post.avatarUrl)}
                  alt={post.userName}
                />
                <AvatarFallback>
                  {getAvatarInitials(post.userName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-semibold text-sm cursor-pointer hover:underline"
                  onClick={(e) => handleProfileClick(post.userName, e)}
                >
                  {post.userName}
                </span>
                {post.visibility && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      privacyClassName
                    )}
                    title={`Quyền riêng tư: ${privacyLabel}`}
                  >
                    <PrivacyIcon className="h-3 w-3" />
                    {privacyLabel}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{post.caption}</p>
            </div>
          </div>

          {showReportDialog && reportingCommentId && (
            <ReportPostDialog
              isOpen={showReportDialog}
              onClose={() => setShowReportDialog(false)}
              postId={reportingCommentId}
              onReport={(commentId, reason, details) => {
                reportComment(commentId, reason, details);
              }}
              title="Báo cáo bình luận"
            />
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {commentsLoading && displayComments.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader />
            </div>
          ) : commentsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{commentsError}</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {displayComments.map((comment, index) => (
                <div
                  key={comment.id}
                  ref={
                    index === displayComments.length - 1 ? lastElementRef : null
                  }
                  className="group/comment"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="cursor-pointer"
                      onClick={(e) => handleProfileClick(comment.userName, e)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={getAvatarUrl(comment.avatarUrl)}
                          alt={comment.userName}
                        />
                        <AvatarFallback>
                          {getAvatarInitials(comment.userName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      {editingComment === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            autoFocus
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="resize-none min-h-[60px] max-h-[120px] rounded-xl text-sm"
                            onFocus={(e) => {
                              const temp = e.target.value;
                              e.target.value = '';
                              e.target.value = temp;
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                setEditingComment(null);
                                setEditingContent("");
                              }}
                            >
                              Hủy
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              onClick={handleUpdateComment}
                              disabled={!editingContent.trim()}
                            >
                              Lưu
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-semibold text-sm cursor-pointer hover:underline"
                              onClick={(e) =>
                                handleProfileClick(comment.userName, e)
                              }
                            >
                              {comment.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed mb-2">
                            {parseMentions(comment.content, (username) => {
                              handleProfileClick(username);
                            })}
                          </p>
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                            <span 
                              className="text-xs text-gray-500"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                            {getLikesCount(comment.id, comment.likesCount) > 0 && (
                              <button
                                type="button"
                                onClick={() => openLikesDialog(comment.id, "comment")}
                                className="text-xs text-gray-500 hover:underline"
                                style={{ whiteSpace: "nowrap" }}
                              >
                                {getLikesCount(comment.id, comment.likesCount)} lượt thích
                              </button>
                            )}
                            <button
                              onClick={() => setReplyingTo(comment.id)}
                              className="text-xs text-gray-500 hover:text-gray-600 transition-colors font-semibold"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              Trả lời
                            </button>
                            <button
                              onClick={(e) => handleOpenActionMenu(comment.id, e)}
                              className="text-gray-500 hover:text-gray-700 p-1"
                              aria-label="Tùy chọn"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <LikeButton
                        targetId={parseInt(comment.id)}
                        targetType="comment"
                        isLiked={getIsLiked(comment.id, comment.isLiked)}
                        likesCount={getLikesCount(
                          comment.id,
                          comment.likesCount,
                        )}
                        size="sm"
                        showCount={false}
                        onLikeChange={(newIsLiked, newCount) =>
                          handleCommentLikeChange(
                            comment.id,
                            newIsLiked,
                            newCount,
                          )
                        }
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      />
                    </div>
                  </div>
                  {/* Replies for mobile with toggle */}
                  {(comment.replies && comment.replies.length > 0) ||
                    comment.hasMoreReplies ? (
                    <div className="mt-2 ml-11">
                      {!expandedReplies[comment.id] ? (
                        <button
                          type="button"
                          onClick={() => toggleReplies(comment.id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Xem câu trả lời
                        </button>
                      ) : (
                        <>
                          <div className="mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-3">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="group flex items-start gap-3"
                              >
                                <Avatar 
                                  className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={(e) => handleProfileClick(reply.userName, e)}
                                >
                                  <AvatarImage
                                    src={reply.avatarUrl}
                                    alt={reply.userName}
                                  />
                                  <AvatarFallback>
                                    {reply.userName?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span 
                                      className="font-semibold text-sm cursor-pointer hover:underline"
                                      onClick={(e) => handleProfileClick(reply.userName, e)}
                                    >
                                      {reply.userName}
                                    </span>
                                  </div>
                                  <p className="text-sm leading-relaxed mb-2">
                                    {parseMentions(
                                      reply.content,
                                      (username) => {
                                        handleProfileClick(username);
                                      },
                                    )}
                                  </p>
                                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                                    <span 
                                      className="text-xs text-gray-500"
                                      style={{ whiteSpace: "nowrap" }}
                                    >
                                      {formatTimeAgo(reply.createdAt)}
                                    </span>
                                    {getLikesCount(reply.id, reply.likesCount) >
                                      0 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            openLikesDialog(reply.id, "reply")
                                          }
                                          className="text-xs text-gray-500 hover:underline"
                                          style={{ whiteSpace: "nowrap" }}
                                        >
                                          {getLikesCount(
                                            reply.id,
                                            reply.likesCount,
                                          )}{" "}
                                          lượt thích
                                        </button>
                                      )}
                                    <button
                                      onClick={() => setReplyingTo(reply.id)}
                                      className="text-xs text-gray-500 hover:text-gray-600 transition-colors font-semibold"
                                      style={{ whiteSpace: "nowrap" }}
                                    >
                                      Trả lời
                                    </button>
                                  </div>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <LikeButton
                                    targetId={parseInt(reply.id)}
                                    targetType="comment"
                                    isLiked={getIsLiked(
                                      reply.id,
                                      reply.isLiked,
                                    )}
                                    likesCount={getLikesCount(
                                      reply.id,
                                      reply.likesCount,
                                    )}
                                    size="sm"
                                    showCount={false}
                                    onLikeChange={(newIsLiked, newCount) =>
                                      handleCommentLikeChange(
                                        reply.id,
                                        newIsLiked,
                                        newCount,
                                      )
                                    }
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  />
                                </div>
                              </div>
                            ))}
                            {/* Show "Load more" button if there are more replies */}
                            {repliesHasMore[comment.id] &&
                              comment.replies &&
                              comment.replies.length >= 6 && (
                                <div className="mt-2">
                                  {repliesLoading[comment.id] ? (
                                    <div className="flex justify-center py-2">
                                      <Loader />
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleLoadMoreReplies(comment.id)
                                      }
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      Xem thêm câu trả lời
                                    </button>
                                  )}
                                </div>
                              )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedReplies((prev) => ({
                                ...prev,
                                [comment.id]: false,
                              }))
                            }
                            className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                          >
                            Ẩn câu trả lời
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pb-24">
          {replyingTo ? (
            <form onSubmit={handleSubmitReply} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Phản hồi bình luận</span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-xs text-primary hover:text-primary/90"
                >
                  Hủy
                </button>
              </div>
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết câu trả lời..."
                  className="flex-1 resize-none min-h-[40px] py-2.5 max-h-[80px]"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={!replyContent.trim()}
                  className="px-4 h-10 w-10 p-0 flex items-center justify-center rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) =>
                    handleNewCommentChange(
                      e.target.value,
                      e.target.selectionStart,
                    )
                  }
                  placeholder="Viết bình luận..."
                  className="flex-1 resize-none min-h-[40px] py-2.5 max-h-[80px]"
                  rows={1}
                />


                {/* MENTION MENU */}
                {showMentionMenu && mentionCandidates.length > 0 && (
                  <div className="absolute z-50 bottom-full mb-1 w-full max-h-44 overflow-auto rounded border bg-background p-1 shadow-lg">
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
                            {candidate.username}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {candidate.fullName}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* MENTIONED USERS DISPLAY */}
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
              </div>
              <Button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 h-10 w-10 p-0 flex items-center justify-center rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>

            </form>
          )}
        </div>

        {/* Likes Dialog for mobile */}
        <LikesDialog
          isOpen={!!showLikesDialog}
          onClose={closeLikesDialog}
          targetType={
            showLikesDialog?.targetType === "post"
              ? "post"
              : showLikesDialog?.targetType === "comment" ||
                showLikesDialog?.targetType === "reply"
                ? "comment"
                : undefined
          }
          targetId={
            showLikesDialog?.targetType === "post" ||
            showLikesDialog?.targetType === "comment" ||
            showLikesDialog?.targetType === "reply"
              ? parseInt(showLikesDialog.targetId)
              : undefined
          }
        />

        {/* Action Menu for mobile */}
        {!showDeleteConfirm && (
          <ActionMenu
            isOpen={showActionMenu}
            onClose={handleCloseActionMenu}
            position={actionMenuPosition}
            className="w-[calc(100%-32px)] max-w-sm sm:max-w-md"
            items={
              currentCommentForAction === "post"
                ? actionMenuItems && actionMenuItems.length > 0
                  ? actionMenuItems
                    .filter((item) => item.label !== "Chia sẻ lên...")
                    .map((item) =>
                      item.label === "Xóa"
                        ? { ...item, action: handleDeletePostClick }
                        : item,
                    )
                  : [
                    {
                      label: "Xóa",
                      action: handleDeletePostClick,
                      isDestructive: true,
                    },
                    {
                      label: "Báo cáo",
                      action: () => handleCommentAction("report"),
                      isDestructive: true,
                    },
                    {
                      label: "Đi đến bài viết",
                      action: () => handleCommentAction("goToPost"),
                    },
                    {
                      label: "Sao chép liên kết",
                      action: () => handleCommentAction("copyLink"),
                    },
                    { label: "Hủy", action: handleCloseActionMenu },
                  ]
                : (() => {
                  let comment = displayComments.find(
                    (c) => c.id === currentCommentForAction,
                  );
                  if (!comment) {
                    for (const rootComment of displayComments) {
                      if (rootComment.replies) {
                        const reply = rootComment.replies.find(
                          (r) => r.id === currentCommentForAction,
                        );
                        if (reply) {
                          comment = reply;
                          break;
                        }
                      }
                    }
                  }

                  if (!comment) {
                    return [{ label: "Hủy", action: handleCloseActionMenu }];
                  }

                  const isCommentOwner = comment.userId === user?.id.toString();
                  const isPostOwner = post.userId === user?.id.toString();
                  const canDelete = isCommentOwner || isPostOwner;

                  const items: ActionMenuItem[] = [];

                  if (isCommentOwner) {
                    items.push({
                      label: "Chỉnh sửa",
                      action: () => handleCommentAction("edit"),
                    });
                  }

                  if (canDelete) {
                    items.push({
                      label: "Xóa",
                      action: () => handleCommentAction("delete"),
                      isDestructive: true,
                    });
                  }

                  items.push({
                    label: "Báo cáo",
                    action: () => handleCommentAction("report"),
                    isDestructive: true,
                  });
                  items.push({ label: "Hủy", action: handleCloseActionMenu });

                  return items;
                })()
            }
          />
        )}
      </div>

    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ overscrollBehavior: "contain" }}
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          maxHeight: "682px",
          maxWidth: "1023px",
          width: "100%",
          height: "90vh",
        }}
      >
        {/* Left side - Post Media with Slider */}
        <div
          className="bg-black flex items-center justify-center relative"
          style={{
            aspectRatio: "1440 / 1920",
            flexBasis: "511.5px",
            minWidth: "511.5px",
          }}
        >
          {post.media && post.media.length > 0 ? (
            <MediaSlider
              media={post.media.map((media) => ({
                id: media.id,
                type: media.type,
                url: media.url,
                alt: media.alt || "Post media",
              }))}
              className="w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3 w-full h-full bg-muted">
              <div className="p-3 rounded-full bg-muted-foreground/10">
                <ImageOff className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">
                Bài viết chỉ có nội dung chữ
              </p>
            </div>
          )}
        </div>

        {/* Right side - Comments */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div
                className="relative cursor-pointer"
                onClick={(e) => handleProfileClick(post.userName, e)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.avatarUrl} alt={post.userName} />
                  <AvatarFallback>
                    {post.userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3
                className="font-semibold text-sm cursor-pointer hover:underline"
                onClick={(e) => handleProfileClick(post.userName, e)}
              >
                {post.userName}
              </h3>
              {hasValidVisibility && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    privacyClassName
                  )}
                  title={`Quyền riêng tư: ${privacyLabel}`}
                >
                  <PrivacyIcon className="h-3 w-3" />
                  {privacyLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenActionMenu("post", e);
                }}
                className="text-gray-500 hover:text-gray-600 transition-colors p-1"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div
                className="relative cursor-pointer"
                onClick={(e) => handleProfileClick(post.userName, e)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.avatarUrl} alt={post.userName} />
                  <AvatarFallback>
                    {post.userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-semibold text-sm cursor-pointer hover:underline"
                    onClick={(e) => handleProfileClick(post.userName, e)}
                  >
                    {post.userName}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-2">{post.caption}</p>

                {/* Post Emoji Reactions */}
                {post.emojiReactions && post.emojiReactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.emojiReactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(reaction.emoji)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-150 hover:scale-105",
                          reaction.isReacted
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
                        )}
                      >
                        <span className="text-sm">{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ overscrollBehavior: "contain" }}
          >
            {commentsLoading && displayComments.length === 0 ? (
              <div className="flex justify-center items-center pt-36">
                <Loader />
              </div>
            ) : commentsError ? (
              <div className="text-center py-8">
                <p className="text-red-500 text-sm">{commentsError}</p>
              </div>
            ) : (
              <ul className="p-4 space-y-4">
                {displayComments.map((comment, index) => (
                  <li
                    key={comment.id}
                    ref={
                      index === displayComments.length - 1
                        ? lastElementRef
                        : null
                    }
                    className="flex items-start gap-3"
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      // tránh nhảy UI: chỉ set state nếu khác id hiện tại
                      if (hoveredItemId !== comment.id)
                        setHoveredItemId(comment.id);
                      // khóa layout để tránh reflow làm shift
                      target.style.minHeight =
                        target.getBoundingClientRect().height + "px";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.minHeight = "";
                      if (hoveredItemId === comment.id) setHoveredItemId(null);
                    }}
                  >
                    <div
                      className="relative cursor-pointer"
                      onClick={(e) => handleProfileClick(comment.userName, e)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={comment.avatarUrl}
                          alt={comment.userName}
                        />
                        <AvatarFallback>
                          {comment.userName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      {editingComment === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            autoFocus
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="resize-none min-h-[60px] max-h-[120px] rounded-xl text-sm"
                            onFocus={(e) => {
                              const temp = e.target.value;
                              e.target.value = '';
                              e.target.value = temp;
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                setEditingComment(null);
                                setEditingContent("");
                              }}
                            >
                              Hủy
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              onClick={handleUpdateComment}
                              disabled={!editingContent.trim()}
                            >
                              Lưu
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-semibold text-sm cursor-pointer hover:underline"
                              onClick={(e) =>
                                handleProfileClick(comment.userName, e)
                              }
                            >
                              {comment.userName}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed mb-2">
                            {parseMentions(comment.content, (username) => {
                              handleProfileClick(username);
                            })}
                          </p>

                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                        <span 
                          className="text-xs text-gray-500"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                        {getLikesCount(comment.id, comment.likesCount) > 0 && (
                          <button
                            type="button"
                            onClick={() => openLikesDialog(comment.id, "comment")}
                            className="text-xs text-gray-500 hover:underline"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {getLikesCount(comment.id, comment.likesCount)} lượt thích
                          </button>
                        )}
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-xs text-gray-500 hover:text-gray-600 transition-colors font-semibold"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          Trả lời
                        </button>
                        <button
                          onClick={(e) => handleOpenActionMenu(comment.id, e)}
                          className={cn(
                            "inline-flex items-center justify-center w-6 h-6 p-1 transition-opacity",
                            hoveredItemId === comment.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                          aria-label="Tùy chọn"
                          type="button"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                        </button>
                      </div>

                      {/* Emoji Reactions */}
                      {comment.emojiReactions &&
                        comment.emojiReactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {comment.emojiReactions.map((reaction, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  handleEmojiSelect(reaction.emoji)
                                }
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-150 hover:scale-105",
                                  reaction.isReacted
                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
                                )}
                              >
                                <span className="text-sm">
                                  {reaction.emoji}
                                </span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                      {comment.emojiReactions &&
                        comment.emojiReactions.some((r) => r.count > 0) && (
                          <div className="flex items-center gap-2 mt-2">
                            {comment.emojiReactions &&
                              comment.emojiReactions.some(
                                (r) => r.count > 0,
                              ) && (
                                <div className="flex items-center gap-1">
                                  {comment.emojiReactions
                                    .filter((r) => r.count > 0)
                                    .slice(0, 3)
                                    .map((reaction, index) => (
                                      <span key={index} className="text-sm">
                                        {reaction.emoji}
                                      </span>
                                    ))}
                                  {comment.emojiReactions.filter(
                                    (r) => r.count > 0,
                                  ).length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +
                                      {comment.emojiReactions.filter(
                                        (r) => r.count > 0,
                                      ).length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Replies toggle and list */}
                    {(comment.replies && comment.replies.length > 0) ||
                        comment.hasMoreReplies ? (
                        <div className="mt-2">
                          {!expandedReplies[comment.id] ? (
                            <button
                              type="button"
                              onClick={() => toggleReplies(comment.id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Xem câu trả lời
                            </button>
                          ) : (
                            <>
                              <div className="mt-2 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-3">
                                {comment.replies?.map((reply) =>
                                  renderReplyItem(reply, comment.id),
                                )}
                                {/* Show "Load more" button if there are more replies */}
                                {repliesHasMore[comment.id] &&
                                  comment.replies &&
                                  comment.replies.length >= 6 && (
                                    <div className="mt-2">
                                      {repliesLoading[comment.id] ? (
                                        <div className="flex justify-center py-2">
                                          <Loader />
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleLoadMoreReplies(comment.id)
                                          }
                                          className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                          Xem thêm câu trả lời
                                        </button>
                                      )}
                                    </div>
                                  )}
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleReplies(comment.id)}
                                className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                              >
                                Ẩn câu trả lời
                              </button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <LikeButton
                        targetId={parseInt(comment.id)}
                        targetType="comment"
                        isLiked={getIsLiked(comment.id, comment.isLiked)}
                        likesCount={getLikesCount(
                          comment.id,
                          comment.likesCount,
                        )}
                        showCount={false}
                        onLikeChange={(newIsLiked, newCount) =>
                          handleCommentLikeChange(
                            comment.id,
                            newIsLiked,
                            newCount,
                          )
                        }
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        size="sm"
                      />
                    </div>
                  </li>
                ))}
                {/* Loading indicator for infinite scroll */}
                {commentsLoading && displayComments.length > 0 && (
                  <li className="flex justify-center py-4">
                    <Loader />
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div
            className="p-4 border-t border-gray-200 dark:border-gray-700"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="flex items-center gap-4 mb-4">
              <LikeButton
                targetId={parseInt(post.id)}
                targetType="post"
                isLiked={isPostLikedLocal}
                likesCount={postLikesCount}
                showCount
                onLikeChange={handlePostLikeChange}
                onLikeSuccess={handlePostLikeSuccess}
                className="hover:bg-transparent -ml-2 text-gray-700 dark:text-gray-200"
                size="md"
              />
              <button 
                onClick={() => {
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                type="button"
                aria-label="Tập trung ô bình luận"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              {/* Temporarily hidden share button
              <button
                onClick={handleOpenShareDialog}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                type="button"
              >
                <Send className="w-6 h-6" />
              </button>
              */}
              <div className="flex-1"></div>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleBookmark(post.id);
                }}
              >
                <Bookmark
                  className={cn(
                    "w-6 h-6",
                    isBookmarked(post.id) &&
                    "fill-current text-gray-800 dark:text-gray-100",
                  )}
                />
              </button>
            </div>

            {/* Likes summary like Instagram */}
            {postLikesCount > 0 && (
              <div className="mt-1 text-sm">
                {latestLikeName ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openLikesDialog(post.id, "post")}
                      className="font-medium hover:underline"
                    >
                      {latestLikeName}
                    </button>
                    {postLikesCount > 1 && (
                      <>
                        <span className="text-gray-600 dark:text-gray-300">
                          {" "}
                          và{" "}
                        </span>
                        <button
                          type="button"
                          onClick={() => openLikesDialog(post.id, "post")}
                          className="font-medium hover:underline"
                        >
                          những người khác
                        </button>
                      </>
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      {" "}
                      đã thích
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => openLikesDialog(post.id, "post")}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    {postLikesCount.toLocaleString("vi-VN")} lượt thích
                  </button>
                )}
              </div>
            )}

            {/* Post time under summary */}
            <div className="mt-1 mb-4 text-[12px] text-gray-500">
              <time>{formatTimeAgo(post.createdAt)}</time>
            </div>

            {/* Comment Form */}
            {replyingTo ? (
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Trả lời</span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-xs text-primary hover:text-primary/90"
                  >
                    Hủy
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEmojiPicker(null, e)}
                    className="emoji-button text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <Textarea
                    ref={textareaRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Thêm trả lời..."
                    className="flex-1 min-h-[40px] resize-none border-0 focus:ring-0 focus:outline-none"
                    rows={1}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyContent.trim()}
                    className="px-4 text-primary hover:text-primary/90 disabled:text-gray-400"
                    variant="ghost"
                  >
                    Gửi
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <form
                  onSubmit={handleSubmitComment}
                  className="flex gap-2 relative"
                >
                  <button
                    type="button"
                    onClick={(e) => handleOpenEmojiPicker(null, e)}
                    className="emoji-button text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <Textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={(e) =>
                      handleNewCommentChange(
                        e.target.value,
                        e.target.selectionStart,
                      )
                    }
                    placeholder="Thêm bình luận..."
                    className="flex-1 min-h-[40px] resize-none border-0 focus:ring-0 focus:outline-none"
                    rows={1}
                  />

                  {/* MENTION MENU */}
                  {showMentionMenu && mentionCandidates.length > 0 && (
                    <div className="absolute z-50 bottom-full mb-1 w-full max-h-44 overflow-auto rounded border bg-background p-1 shadow-lg">
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

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim()}
                    className="px-4 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                    variant="ghost"
                  >
                    Gửi
                  </Button>
                </form>

                {/* MENTIONED USERS DISPLAY */}
                {mentionedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={handleCloseEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />

      {/* Action Menu */}
      {!showDeleteConfirm && (
        <ActionMenu
          isOpen={showActionMenu}
          onClose={handleCloseActionMenu}
          position={actionMenuPosition}
          className="w-[calc(100%-32px)] max-w-sm sm:max-w-md"
          items={
            currentCommentForAction === "post"
              ? actionMenuItems && actionMenuItems.length > 0
                ? actionMenuItems
                  .filter((item) => item.label !== "Chia sẻ lên...")
                  .map((item) =>
                    item.label === "Xóa"
                      ? { ...item, action: handleDeletePostClick }
                      : item,
                  )
                : [
                  {
                    label: "Xóa",
                    action: handleDeletePostClick,
                    isDestructive: true,
                  },
                  {
                    label: "Báo cáo",
                    action: () => handleCommentAction("report"),
                    isDestructive: true,
                  },
                  {
                    label: "Đi đến bài viết",
                    action: () => handleCommentAction("goToPost"),
                  },
                  /* Temporarily hidden share option
                  {
                    label: "Chia sẻ lên...",
                    action: () => handleCommentAction("share"),
                  },
                  */
                  {
                    label: "Sao chép liên kết",
                    action: () => handleCommentAction("copyLink"),
                  },
                  { label: "Hủy", action: handleCloseActionMenu },
                ]
              : (() => {
                // Get comment or reply for action menu
                // First try to find in displayComments (root comments)
                let comment = displayComments.find(
                  (c) => c.id === currentCommentForAction,
                );

                // If not found, try to find in replies (nested replies)
                if (!comment) {
                  for (const rootComment of displayComments) {
                    if (rootComment.replies) {
                      const reply = rootComment.replies.find(
                        (r) => r.id === currentCommentForAction,
                      );
                      if (reply) {
                        comment = reply;
                        break;
                      }
                    }
                  }
                }

                if (!comment) {
                  return [{ label: "Hủy", action: handleCloseActionMenu }];
                }

                const isCommentOwner = comment.userId === user?.id.toString();
                const isPostOwner = post.userId === user?.id.toString();
                const canDelete = isCommentOwner || isPostOwner;

                const items: ActionMenuItem[] = [];

                if (isCommentOwner) {
                  items.push({
                    label: "Chỉnh sửa",
                    action: () => handleCommentAction("edit"),
                  });
                }

                if (canDelete) {
                  items.push({
                    label: "Xóa",
                    action: () => handleCommentAction("delete"),
                    isDestructive: true,
                  });
                }

                items.push({
                  label: "Báo cáo",
                  action: () => handleCommentAction("report"),
                  isDestructive: true,
                });
                items.push({ label: "Hủy", action: handleCloseActionMenu });

                return items;
              })()
          }
        />
      )}

      <LikesDialog
        isOpen={!!showLikesDialog}
        onClose={closeLikesDialog}
        targetType={
          showLikesDialog?.targetType === "post"
            ? "post"
            : showLikesDialog?.targetType === "comment" ||
              showLikesDialog?.targetType === "reply"
              ? "comment"
              : undefined
        }
        targetId={
          showLikesDialog?.targetType === "post" ||
          showLikesDialog?.targetType === "comment" ||
          showLikesDialog?.targetType === "reply"
            ? parseInt(showLikesDialog.targetId)
            : undefined
        }
      />

      {showReportDialog && reportingCommentId && (
        <ReportPostDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          postId={reportingCommentId}
          onReport={(commentId, reason, details) => {
            reportComment(commentId, reason, details);
          }}
          title="Báo cáo bình luận"
        />
      )}

      {/* Delete Confirmation Dialog - Style like ActionMenuDialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Xóa bài viết?</h3>
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa bài viết này không?
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="flex-1"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
