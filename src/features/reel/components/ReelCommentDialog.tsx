import { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  MessageCircle,
  X,
  MoreHorizontal,
  Smile,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatTimeAgo } from "@/utils/timeFormat";
import { formatNumber } from "@/utils/constants";
import { HLSVideoPlayer } from "@/components/common/HLSVideoPlayer";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getReelCommentsThunk,
  getCommentRepliesThunk,
  createCommentThunk,
  deleteCommentThunk,
  clearComments,
  clearCommentError,
} from "@/features/interaction/interactionSlice";
import { getReelLikeDetailThunk } from "@/features/interaction";
import { LikeButton } from "@/features/interaction/components/LikeButton";
import { Loader } from "@/components/common/Loader";
import { EmojiPicker } from "@/components/common/EmojiPicker";
import { ActionMenu, ActionMenuItem } from "@/components/common/ActionMenu";
import { LikesDialog } from "@/features/post/components/LikesDialog";
import { cn } from "@/lib/utils";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import { parseMentions } from "@/utils/mentions";
import { navigateToProfile } from "@/utils/navigation";
import { ReportPostDialog } from "@/features/post/components/ReportPostDialog";
import { reportReel } from "@/features/reel/api/reelApi";

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

const ReelCommentDialog = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const { isCommentsDrawerOpen, selectedReelId, reels } = useAppSelector(
    (s) => s.reel
  );
  const {
    comments: reduxComments,
    isLoading: commentsLoading,
    error: commentsError,
    hasMore: hasMoreComments,
    currentPage: commentsCurrentPage,
    isCreating,
  } = useAppSelector((s) => s.interaction.comments);

  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentReel = reels.find((r) => r.id === selectedReelId);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [repliesPageNo, setRepliesPageNo] = useState<Record<string, number>>(
    {}
  );
  const [repliesHasMore, setRepliesHasMore] = useState<Record<string, boolean>>(
    {}
  );
  const [repliesLoading, setRepliesLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [repliesTotalElements, setRepliesTotalElements] = useState<
    Record<string, number>
  >({});
  const [likedById, setLikedById] = useState<Record<string, boolean>>({});
  const [likesCountById, setLikesCountById] = useState<Record<string, number>>(
    {}
  );
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
  const [showLikesDialog, setShowLikesDialog] = useState<null | {
    targetId: string;
    targetType: "reel" | "comment" | "reply";
  }>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [isReelLikedLocal, setIsReelLikedLocal] = useState(
    currentReel?.isLiked || false
  );
  const [reelLikesCount, setReelLikesCount] = useState(
    currentReel?.likesCount || 0
  );
  const [latestLikeName, setLatestLikeName] = useState<string | null>(null);
  const [hasFetchedLikePreview, setHasFetchedLikePreview] = useState(false);

  useEffect(() => {
    if (currentReel) {
      setIsReelLikedLocal(currentReel.isLiked);
      setReelLikesCount(currentReel.likesCount || 0);
      setHasFetchedLikePreview(false);
      setLatestLikeName(null);
    }
  }, [currentReel?.id, currentReel?.isLiked, currentReel?.likesCount]);

  useEffect(() => {
    if (isCommentsDrawerOpen && selectedReelId) {
      dispatch(clearComments());
      dispatch(clearCommentError());
      dispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId),
          params: { pageNo: 0, pageSize: 20 },
        })
      );
    }
  }, [dispatch, isCommentsDrawerOpen, selectedReelId]);

  useEffect(() => {
    if (!isCommentsDrawerOpen || !selectedReelId || hasFetchedLikePreview)
      return;

    const run = async () => {
      try {
        setHasFetchedLikePreview(true);
        const data = await dispatch(
          getReelLikeDetailThunk({
            reelId: parseInt(selectedReelId),
            params: { pageNo: 0, pageSize: 1 },
          })
        ).unwrap();

        const total = data.totalElements ?? 0;
        setReelLikesCount(total);

        if (data.content && data.content.length > 0) {
          setLatestLikeName(data.content[0].userName);
        } else {
          setLatestLikeName(null);
        }
      } catch (_) {
        // Keep flag as true to prevent infinite retry
      }
    };
    run();
  }, [dispatch, isCommentsDrawerOpen, selectedReelId, hasFetchedLikePreview]);

  const handleLoadMoreComments = () => {
    if (hasMoreComments && !commentsLoading && selectedReelId) {
      dispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId),
          params: { pageNo: commentsCurrentPage + 1, pageSize: 20 },
        })
      );
    }
  };

  const { lastElementRef } = useInfiniteScroll(handleLoadMoreComments, {
    hasMore: hasMoreComments,
    isLoading: commentsLoading,
    error: commentsError,
    threshold: 200,
  });

  const displayComments: Comment[] = useMemo(() => {
    return reduxComments.map((c) => ({
      id: c.id,
      userId: c.userId?.toString(),
      userName: c.userName,
      avatarUrl: c.avatarUrl,
      content: c.content,
      likesCount: c.likesCount,
      isLiked: c.isLiked,
      createdAt: c.createdAt,
      hasMoreReplies: c.hasMoreReplies,
      replies: c.replies?.map((r) => ({
        id: r.id,
        userId: r.userId?.toString(),
        userName: r.userName,
        avatarUrl: r.avatarUrl,
        content: r.content,
        likesCount: r.likesCount,
        isLiked: r.isLiked,
        createdAt: r.createdAt,
      })),
    }));
  }, [reduxComments]);

  const rootCommentIdMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const comment of reduxComments) {
      map.set(comment.id, comment.id);
      if (comment.replies) {
        for (const reply of comment.replies) {
          map.set(reply.id, comment.id);
        }
      }
    }
    return map;
  }, [reduxComments]);

  useEffect(() => {
    if (replyingTo) {
      let targetComment: Comment | null = null;
      for (const comment of displayComments) {
        if (comment.id === replyingTo) {
          targetComment = comment;
          break;
        }
        if (comment.replies) {
          const foundReply = comment.replies.find((r) => r.id === replyingTo);
          if (foundReply) {
            targetComment = foundReply;
            break;
          }
        }
      }

      if (targetComment) {
        const mentionText = `@${targetComment.userName} `;
        const currentContent = replyContent.trim();
        if (
          !currentContent ||
          !currentContent.startsWith(`@${targetComment.userName}`)
        ) {
          setReplyContent(mentionText);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              const length = textareaRef.current.value.length;
              textareaRef.current.setSelectionRange(length, length);
            }
          }, 0);
        }
      }
    } else {
      setReplyContent("");
    }
  }, [replyingTo, displayComments]);

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
      if (
        showEmojiPicker ||
        showActionMenu ||
        showLikesDialog ||
        showDeleteConfirm
      ) {
        return;
      }

      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        dispatch({ type: "reel/closeCommentsDrawer" });
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "reel/closeCommentsDrawer" });
    };

    if (isCommentsDrawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "contain";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.overscrollBehavior = "";
    };
  }, [
    isCommentsDrawerOpen,
    dispatch,
    showEmojiPicker,
    showActionMenu,
    showLikesDialog,
    showDeleteConfirm,
  ]);

  const handleSubmitComment = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!commentText.trim() || !selectedReelId || !user) return;
    try {
      await dispatch(
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
      dispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId),
          params: { pageNo: 0, pageSize: 20 },
        })
      );
    } catch (err) {
      console.error("create comment", err);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm bình luận. Vui lòng thử lại.",
      });
    }
  };

  const handleSubmitReply = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!replyContent.trim() || !replyingTo || !user || !selectedReelId) return;

    const rootId = rootCommentIdMap.get(replyingTo) || replyingTo;

    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: 0,
          reelId: parseInt(selectedReelId),
          parentId: parseInt(rootId),
          content: replyContent.trim(),
          listMentionUserId: [],
        })
      ).unwrap();

      setReplyContent("");
      setReplyingTo(null);

      dispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId),
          params: { pageNo: 0, pageSize: 20 },
        })
      );
    } catch (err) {
      console.error("create reply", err);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm trả lời. Vui lòng thử lại.",
      });
    }
  };

  useEffect(() => {
    const incomingLiked: Record<string, boolean> = {};
    const incomingCounts: Record<string, number> = {};
    const walk = (items: Comment[]) => {
      for (const c of items) {
        incomingLiked[c.id] = c.isLiked;
        incomingCounts[c.id] = c.likesCount;
        if (c.replies && c.replies.length) walk(c.replies);
      }
    };
    walk(displayComments);
    setLikedById(incomingLiked);
    setLikesCountById(incomingCounts);
  }, [displayComments]);

  const getIsLiked = (id: string, fallback?: boolean) =>
    likedById[id] ?? fallback ?? false;
  const getLikesCount = (id: string, fallback?: number) =>
    likesCountById[id] ?? fallback ?? 0;

  const handleCommentLikeChange = (
    commentId: string,
    newIsLiked: boolean,
    newCount: number
  ) => {
    setLikedById((prev) => ({ ...prev, [commentId]: newIsLiked }));
    setLikesCountById((prev) => ({ ...prev, [commentId]: newCount }));
  };

  const handleReelLikeChange = (
    newIsLiked: boolean,
    newCount: number
  ) => {
    setIsReelLikedLocal(newIsLiked);
    setReelLikesCount(newCount);
  };

  const handleReelLikeSuccess = async () => {
    try {
      const data = await dispatch(
        getReelLikeDetailThunk({
          reelId: parseInt(selectedReelId!),
          params: { pageNo: 0, pageSize: 1 },
        })
      ).unwrap();
      const total = data.totalElements ?? 0;
      setReelLikesCount(total);
      if (data.content && data.content.length > 0) {
        setLatestLikeName(data.content[0].userName);
      } else {
        setLatestLikeName(null);
      }
    } catch (error) {
      console.error("Failed to refresh reel like preview:", error);
    }
  };

  const getTotalRepliesCount = (commentId: string): number => {
    if (repliesTotalElements[commentId] !== undefined) {
      return repliesTotalElements[commentId];
    }
    const comment = displayComments.find((c) => c.id === commentId);
    if (comment?.hasMoreReplies || comment?.replies) {
      return comment.replies?.length || 0;
    }
    return 0;
  };

  const toggleReplies = async (commentId: string) => {
    const isExpanding = !expandedReplies[commentId];
    setExpandedReplies((p) => ({ ...p, [commentId]: isExpanding }));

    if (isExpanding) {
      const currentPageNo = repliesPageNo[commentId] ?? -1;
      const comment = displayComments.find((c) => c.id === commentId);

      if (
        currentPageNo === -1 &&
        (!comment?.replies ||
          comment.replies.length === 0 ||
          comment.hasMoreReplies)
      ) {
        setRepliesLoading((p) => ({ ...p, [commentId]: true }));
        try {
          const result = await dispatch(
            getCommentRepliesThunk({
              commentId: parseInt(commentId),
              params: { pageNo: 0, pageSize: 6 },
            })
          ).unwrap();
          setRepliesPageNo((p) => ({ ...p, [commentId]: 0 }));
          setRepliesHasMore((p) => ({
            ...p,
            [commentId]: !result.data.last,
          }));
          setRepliesTotalElements((p) => ({
            ...p,
            [commentId]: result.data.totalElements || 0,
          }));
        } catch (err) {
          console.error("load replies", err);
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể tải câu trả lời.",
          });
          setExpandedReplies((p) => ({ ...p, [commentId]: false }));
        } finally {
          setRepliesLoading((p) => ({ ...p, [commentId]: false }));
        }
      }
    }
  };

  const handleLoadMoreReplies = async (commentId: string) => {
    if (repliesLoading[commentId] || !repliesHasMore[commentId]) return;
    const nextPageNo = (repliesPageNo[commentId] ?? 0) + 1;
    setRepliesLoading((p) => ({ ...p, [commentId]: true }));
    try {
      const result = await dispatch(
        getCommentRepliesThunk({
          commentId: parseInt(commentId),
          params: { pageNo: nextPageNo, pageSize: 6 },
        })
      ).unwrap();
      setRepliesPageNo((p) => ({ ...p, [commentId]: nextPageNo }));
      setRepliesHasMore((p) => ({ ...p, [commentId]: !result.data.last }));
      setRepliesTotalElements((p) => ({
        ...p,
        [commentId]: Math.max(
          p[commentId] || 0,
          result.data.totalElements || 0
        ),
      }));
    } catch (err) {
      console.error("load more replies", err);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thêm câu trả lời.",
      });
    } finally {
      setRepliesLoading((p) => ({ ...p, [commentId]: false }));
    }
  };

  const handleReportSubmit = async (
    reelId: string,
    reason: string,
    details?: string
  ) => {
    try {
      await reportReel(reelId, reason, details);
      setShowReportDialog(false);
      toast({
        title: "Đã gửi báo cáo",
        description: "Cảm ơn bạn đã báo cáo.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi báo cáo. Vui lòng thử lại sau.",
      });
    }
  };

  const openLikesDialog = (
    targetId: string,
    targetType: "reel" | "comment" | "reply"
  ) => {
    setShowLikesDialog({ targetId, targetType });
  };
  const closeLikesDialog = () => setShowLikesDialog(null);

  const handleOpenEmojiPicker = (
    commentId: string | null,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setEmojiPickerPosition({ top: 350, right: 310 });
    setCurrentCommentForEmoji(commentId);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (currentCommentForEmoji) {
      // Logic react emoji (nếu có)
    } else {
      if (replyingTo) {
        setReplyContent((p) => p + emoji);
      } else {
        setCommentText((p) => p + emoji);
      }
    }
    setShowEmojiPicker(false);
    setCurrentCommentForEmoji(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleOpenActionMenu = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActionMenuPosition({
      top: window.innerHeight / 2,
      left: window.innerWidth / 2,
    });
    setCurrentCommentForAction(id);
    setShowActionMenu(true);
  };
  const handleCloseActionMenu = () => {
    setShowActionMenu(false);
    setCurrentCommentForAction(null);
  };

  const handleProfileClick = (userName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigateToProfile(navigate, userName);
    dispatch({ type: "reel/closeCommentsDrawer" });
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await dispatch(deleteCommentThunk(parseInt(commentId))).unwrap();
      dispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId!),
          params: { pageNo: 0, pageSize: 20 },
        })
      );
      handleCloseActionMenu();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa bình luận.",
      });
    }
  };

  const handleDeleteReelClick = () => {
    handleCloseActionMenu();
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setCurrentCommentForAction("reel");
    setShowActionMenu(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (currentReel) {
      toast({ title: "Đã xóa reel." });
      dispatch({ type: "reel/closeCommentsDrawer" });
    }
  };

  const renderReplyItem = (reply: Comment, parentCommentId: string) => {
    return (
      <div
        key={reply.id}
        className="group/reply flex items-start gap-3"
        onMouseEnter={() => setHoveredItemId(reply.id)}
        onMouseLeave={() => setHoveredItemId(null)}
      >
        <div
          className="relative cursor-pointer"
          onClick={(e) => handleProfileClick(reply.userName, e)}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage
              src={getAvatarUrl(reply.avatarUrl)}
              alt={reply.userName}
            />
            <AvatarFallback>{getAvatarInitials(reply.userName)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-semibold text-xs cursor-pointer"
              onClick={(e) => handleProfileClick(reply.userName, e)}
            >
              {reply.userName}
            </span>
          </div>
          <p className="text-xs leading-relaxed mb-2">
            {parseMentions(reply.content, (username) => {
              handleProfileClick(username);
            })}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-gray-500">
              {formatTimeAgo(reply.createdAt)}
            </span>
            {getLikesCount(reply.id, reply.likesCount) > 0 && (
              <button
                type="button"
                onClick={() => openLikesDialog(reply.id, "reply")}
                className="text-[11px] text-gray-500 hover:underline"
              >
                {formatNumber(getLikesCount(reply.id, reply.likesCount))} lượt
                thích
              </button>
            )}
            <button
              onClick={() => setReplyingTo(reply.id)}
              className="text-[11px] text-gray-500 hover:text-gray-600 transition-colors"
              type="button"
            >
              Trả lời
            </button>
            <button
              onClick={(e) => handleOpenActionMenu(reply.id, e)}
              className={cn(
                "inline-flex items-center justify-center w-5 h-5 p-1 ml-1 transition-opacity",
                hoveredItemId === reply.id ? "opacity-100" : "opacity-0"
              )}
              aria-label="Tùy chọn"
              type="button"
            >
              <MoreHorizontal className="w-3 h-3 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
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

  if (!isCommentsDrawerOpen || !currentReel) return null;

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 bg-white dark:bg-gray-900 z-[40] flex flex-col"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 fixed top-0 left-0 right-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "reel/closeCommentsDrawer" })}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-lg">Bình luận</h1>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-y-auto pt-16">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div
                className="cursor-pointer"
                onClick={(e) => handleProfileClick(currentReel.userName, e)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={getAvatarUrl(currentReel.avatarUrl)}
                    alt={currentReel.userName}
                  />
                  <AvatarFallback>
                    {getAvatarInitials(currentReel.userName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-semibold text-sm cursor-pointer hover:underline"
                    onClick={(e) => handleProfileClick(currentReel.userName, e)}
                  >
                    {currentReel.userName}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {parseMentions(currentReel.caption, (username) => {
                    handleProfileClick(username);
                  })}
                </p>
                <span className="text-xs text-gray-500 mt-2 block">
                  {formatTimeAgo(currentReel.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {commentsLoading && displayComments.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              {" "}
              <Loader />{" "}
            </div>
          ) : commentsError ? (
            <div className="text-center py-8">
              {" "}
              <p className="text-red-500 text-sm">{commentsError}</p>{" "}
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
                      <div className="flex items-center gap-4">
                        {getLikesCount(comment.id, comment.likesCount) > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              openLikesDialog(comment.id, "comment")
                            }
                            className="text-xs text-gray-500 hover:underline"
                          >
                            {formatNumber(
                              getLikesCount(comment.id, comment.likesCount)
                            )}{" "}
                            lượt thích
                          </button>
                        )}
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
                        >
                          Trả lời
                        </button>
                        <button
                          onClick={(e) => handleOpenActionMenu(comment.id, e)}
                          className="text-gray-500 hover:text-gray-700 p-1 ml-2"
                          aria-label="Tùy chọn"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <LikeButton
                        targetId={parseInt(comment.id)}
                        targetType="comment"
                        isLiked={getIsLiked(comment.id, comment.isLiked)}
                        likesCount={getLikesCount(
                          comment.id,
                          comment.likesCount
                        )}
                        size="sm"
                        showCount={false}
                        onLikeChange={(newIsLiked, newCount) =>
                          handleCommentLikeChange(
                            comment.id,
                            newIsLiked,
                            newCount
                          )
                        }
                        className="p-0 text-gray-400 hover:text-red-500"
                      />
                    </div>
                  </div>
                  {(comment.replies && comment.replies.length > 0) ||
                    comment.hasMoreReplies ? (
                    <div className="mt-2 ml-11">
                      {!expandedReplies[comment.id] ? (
                        <button
                          type="button"
                          onClick={() => toggleReplies(comment.id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Xem câu trả lời ({getTotalRepliesCount(comment.id)})
                        </button>
                      ) : (
                        <>
                          <div className="mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-3">
                            {comment.replies?.map((reply) =>
                              renderReplyItem(reply, comment.id)
                            )}
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
              ))}
              {commentsLoading && displayComments.length > 0 && (
                <div className="flex justify-center py-4">
                  <Loader />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 fixed bottom-0 left-0 right-0 z-10">
          {replyingTo ? (
            <form onSubmit={handleSubmitReply} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Đang trả lời...</span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-xs text-primary hover:text-primary/90"
                >
                  Hủy
                </button>
              </div>
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Thêm trả lời..."
                  className="flex-1 resize-none"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={!replyContent.trim()}
                  className="px-4"
                  size="sm"
                >
                  Gửi
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Thêm bình luận..."
                className="flex-1 resize-none"
                rows={1}
                disabled={isCreating}
              />
              <Button
                type="submit"
                disabled={!commentText.trim() || isCreating}
                className="px-4"
                size="sm"
              >
                Gửi
              </Button>
            </form>
          )}
        </div>
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
        <div
          className="flex items-center justify-center relative overflow-hidden bg-black"
          style={{
            aspectRatio: "9 / 16",
            flexBasis: "50%",
            minWidth: "50%",
            maxWidth: "50%",
          }}
        >
          <HLSVideoPlayer
            src={currentReel.mediaUrl}
            autoPlay
            loop
            playsInline
            controls
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div
                className="relative cursor-pointer"
                onClick={(e) => handleProfileClick(currentReel.userName, e)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={getAvatarUrl(currentReel.avatarUrl)}
                    alt={currentReel.userName}
                  />
                  <AvatarFallback>
                    {getAvatarInitials(currentReel.userName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3
                className="font-semibold text-sm cursor-pointer hover:underline"
                onClick={(e) => handleProfileClick(currentReel.userName, e)}
              >
                {currentReel.userName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleOpenActionMenu("reel", e)}
                className="text-gray-500 hover:text-gray-600 transition-colors p-1"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => dispatch({ type: "reel/closeCommentsDrawer" })}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto"
            style={{ overscrollBehavior: "contain" }}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className="relative cursor-pointer"
                onClick={(e) => handleProfileClick(currentReel.userName, e)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={getAvatarUrl(currentReel.avatarUrl)}
                    alt={currentReel.userName}
                  />
                  <AvatarFallback>
                    {getAvatarInitials(currentReel.userName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-semibold text-sm cursor-pointer hover:underline"
                        onClick={(e) =>
                          handleProfileClick(currentReel.userName, e)
                        }
                      >
                        {currentReel.userName}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {parseMentions(currentReel.caption, (username) => {
                        handleProfileClick(username);
                      })}
                    </p>
                    <span className="text-gray-500 text-xs mt-2 block">
                      {formatTimeAgo(currentReel.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {commentsLoading && displayComments.length === 0 ? (
              <div className="flex justify-center py-12">
                {" "}
                <Loader />{" "}
              </div>
            ) : commentsError ? (
              <div className="text-center py-12">
                {" "}
                <p className="text-red-500 text-sm">{commentsError}</p>{" "}
              </div>
            ) : displayComments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Chưa có bình luận</p>
                <p className="text-xs mt-1">Hãy là người đầu tiên bình luận</p>
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
                    onMouseEnter={() => setHoveredItemId(comment.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <div
                      className="relative cursor-pointer"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
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
                          <p className="text-sm leading-relaxed break-words mb-2">
                            {parseMentions(comment.content, (username) => {
                              handleProfileClick(username);
                            })}
                          </p>
                          <div className="flex items-center gap-4">
                            {getLikesCount(comment.id, comment.likesCount) >
                              0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openLikesDialog(comment.id, "comment")
                                  }
                                  className="text-xs text-gray-500 hover:underline"
                                >
                                  {formatNumber(
                                    getLikesCount(comment.id, comment.likesCount)
                                  )}{" "}
                                  lượt thích
                                </button>
                              )}
                            <button
                              className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
                              onClick={() => setReplyingTo(comment.id)}
                            >
                              Trả lời
                            </button>
                            <button
                              onClick={(e) =>
                                handleOpenActionMenu(comment.id, e)
                              }
                              className={cn(
                                "inline-flex items-center justify-center w-6 h-6 p-1 ml-2 transition-opacity",
                                hoveredItemId === comment.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                              aria-label="Tùy chọn"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                            </button>
                          </div>
                          {(comment.replies && comment.replies.length > 0) ||
                            comment.hasMoreReplies ? (
                            <div className="mt-2">
                              {!expandedReplies[comment.id] ? (
                                <button
                                  type="button"
                                  onClick={() => toggleReplies(comment.id)}
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                  Xem câu trả lời (
                                  {getTotalRepliesCount(comment.id)})
                                </button>
                              ) : (
                                <>
                                  <div className="mt-2 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-3">
                                    {comment.replies?.map((reply) =>
                                      renderReplyItem(reply, comment.id)
                                    )}
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
                                                handleLoadMoreReplies(
                                                  comment.id
                                                )
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
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <LikeButton
                        targetId={parseInt(comment.id)}
                        targetType="comment"
                        isLiked={getIsLiked(comment.id, comment.isLiked)}
                        likesCount={getLikesCount(
                          comment.id,
                          comment.likesCount
                        )}
                        size="sm"
                        showCount={false}
                        onLikeChange={(newIsLiked, newCount) =>
                          handleCommentLikeChange(
                            comment.id,
                            newIsLiked,
                            newCount
                          )
                        }
                        className="p-0 text-gray-400 hover:text-red-500"
                      />
                    </div>
                  </li>
                ))}
                {commentsLoading && displayComments.length > 0 && (
                  <li className="flex justify-center py-4">
                    <Loader />
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <LikeButton
                targetId={parseInt(selectedReelId!)}
                targetType="reel"
                isLiked={isReelLikedLocal}
                likesCount={reelLikesCount}
                size="md"
                showCount={false}
                onLikeChange={handleReelLikeChange}
                onLikeSuccess={handleReelLikeSuccess}
                className="h-auto p-0"
              />
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors"
                type="button"
              >
                <Send className="w-6 h-6" />
              </button>
              <div className="flex-1" />
            </div>

            {reelLikesCount > 0 && (
              <div className="mb-3 text-sm">
                {latestLikeName ? (
                  <>
                    <button
                      type="button"
                      onClick={() => openLikesDialog(currentReel.id, "reel")}
                      className="font-medium hover:underline"
                    >
                      {latestLikeName}
                    </button>
                    {reelLikesCount > 1 && (
                      <>
                        <span className="text-gray-600 dark:text-gray-300">
                          {" "}
                          và{" "}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            openLikesDialog(currentReel.id, "reel")
                          }
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
                    onClick={() => openLikesDialog(currentReel.id, "reel")}
                    className="font-medium hover:underline"
                  >
                    {formatNumber(reelLikesCount)} lượt thích
                  </button>
                )}
              </div>
            )}

            <div className="mb-4 text-xs text-gray-500">
              <time>{formatTimeAgo(currentReel.createdAt)}</time>
            </div>

            {replyingTo ? (
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Đang trả lời...</span>
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
                    variant="ghost"
                    className="px-4 text-primary hover:text-primary/90 disabled:text-gray-400"
                  >
                    Gửi
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => handleOpenEmojiPicker(null, e)}
                  className="emoji-button text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <Textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Thêm bình luận..."
                  className="flex-1 min-h-[40px] resize-none border-0 focus:ring-0 focus:outline-none"
                  rows={1}
                  disabled={isCreating}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!commentText.trim() || isCreating}
                  variant="ghost"
                  className="px-4 text-primary hover:text-primary/90 disabled:text-gray-400"
                >
                  Gửi
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />

      {!showDeleteConfirm && (
        <ActionMenu
          isOpen={showActionMenu}
          onClose={handleCloseActionMenu}
          position={actionMenuPosition}
          items={
            currentCommentForAction === "reel"
              ? (() => {
                const isReelOwner =
                  currentReel.userId === user?.id.toString();
                const items: ActionMenuItem[] = [];
                if (isReelOwner) {
                  items.push({
                    label: "Xóa",
                    action: handleDeleteReelClick,
                    isDestructive: true,
                  });
                }
                items.push({
                  label: "Báo cáo",
                  action: () => setShowReportDialog(true),
                  isDestructive: true,
                });
                items.push({ label: "Hủy", action: handleCloseActionMenu });
                return items;
              })()
              : (() => {
                let comment: Comment | undefined = displayComments.find(
                  (c) => c.id === currentCommentForAction
                );
                if (!comment) {
                  for (const root of displayComments) {
                    if (root.replies) {
                      const r = root.replies.find(
                        (x) => x.id === currentCommentForAction
                      );
                      if (r) {
                        comment = r;
                        break;
                      }
                    }
                  }
                }
                if (!comment)
                  return [{ label: "Hủy", action: handleCloseActionMenu }];

                const isCommentOwner = comment.userId === user?.id.toString();
                const isReelOwner =
                  currentReel.userId === user?.id.toString();
                const canDelete = isCommentOwner || isReelOwner;

                const items: ActionMenuItem[] = [];
                if (canDelete) {
                  items.push({
                    label: "Xóa",
                    action: () => handleDeleteComment(comment!.id),
                    isDestructive: true,
                  });
                }
                items.push({
                  label: "Báo cáo",
                  action: () => {
                    /* report comment */
                  },
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
        targetType={showLikesDialog?.targetType === "reel" ? "reel" : undefined}
        targetId={
          showLikesDialog?.targetId
            ? parseInt(showLikesDialog.targetId)
            : undefined
        }
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Xóa thước phim?</h3>
              <p className="text-sm text-muted-foreground">
                Bạn có chắc muốn xóa không?
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

      {showReportDialog && (
        <ReportPostDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          postId={currentReel.id}
          onReport={handleReportSubmit}
        />
      )}
    </div>
  );
};

export default ReelCommentDialog;
