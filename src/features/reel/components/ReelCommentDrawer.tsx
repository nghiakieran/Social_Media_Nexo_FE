import { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Send, MessageCircle, MoreHorizontal, Smile } from "lucide-react";
import { RootState } from "@/store";
import { closeCommentsDrawer } from "../reelSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTimeAgo } from "@/utils/timeFormat";
import { formatNumber } from "@/utils/constants";
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
import { ReportPostDialog } from "@/features/post/components/ReportPostDialog";
import { reportReel } from "@/features/reel/api/reelApi";
import { updateReelLikeOptimistic, incrementCommentsCount, decrementCommentsCount } from "@/features/reel/reelSlice";
import { useToast } from "@/hooks/use-toast";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import { parseMentions } from "@/utils/mentions";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { navigateToProfile } from "@/utils/navigation";

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
}

const ReelCommentDrawer = () => {
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  
  const { isCommentsDrawerOpen, selectedReelId, reels } = useSelector(
    (state: RootState) => state.reel
  );

  const {
    comments: reduxComments,
    isLoading: commentsLoading,
    error: commentsError,
    hasMore: hasMoreComments,
    currentPage: commentsCurrentPage,
    isCreating,
  } = useAppSelector((state) => state.interaction.comments);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentReel = reels.find((r) => r.id === selectedReelId);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [repliesPageNo, setRepliesPageNo] = useState<Record<string, number>>({});
  const [repliesHasMore, setRepliesHasMore] = useState<Record<string, boolean>>({});
  const [repliesLoading, setRepliesLoading] = useState<Record<string, boolean>>({});
  const [repliesTotalElements, setRepliesTotalElements] = useState<Record<string, number>>({});
  const [likedById, setLikedById] = useState<Record<string, boolean>>({});
  const [likesCountById, setLikesCountById] = useState<Record<string, number>>({});
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [currentCommentForEmoji, setCurrentCommentForEmoji] = useState<string | null>(null);

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [currentCommentForAction, setCurrentCommentForAction] = useState<string | null>(null);

  const [showLikesDialog, setShowLikesDialog] = useState<null | {
    targetId: string;
    targetType: "reel" | "comment" | "reply";
  }>(null);

  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [isReelLikedLocal, setIsReelLikedLocal] = useState(false);
  const [reelLikesCount, setReelLikesCount] = useState(0);
  const [latestLikeName, setLatestLikeName] = useState<string | null>(null);
  const [hasFetchedLikePreview, setHasFetchedLikePreview] = useState(false);

  useEffect(() => {
    if (currentReel) {
      setIsReelLikedLocal(currentReel.isLiked);
      setReelLikesCount(currentReel.likesCount || 0);
      setHasFetchedLikePreview(false);
      setLatestLikeName(null);
    }
  }, [currentReel?.id]);

  useEffect(() => {
    if (currentReel) {
      setIsReelLikedLocal(currentReel.isLiked);
      setReelLikesCount(currentReel.likesCount || 0);
    }
  }, [currentReel?.isLiked, currentReel?.likesCount]);

  // Load comments when reel is selected
  useEffect(() => {
    if (selectedReelId && isCommentsDrawerOpen) {
      appDispatch(clearComments());
      appDispatch(clearCommentError());
      appDispatch(
        getReelCommentsThunk({
          reelId: parseInt(selectedReelId),
          params: { pageNo: 0, pageSize: 20 },
        })
      );
    }
  }, [appDispatch, selectedReelId, isCommentsDrawerOpen]);

  useEffect(() => {
    if (!selectedReelId || !isCommentsDrawerOpen || hasFetchedLikePreview) return;

    const run = async () => {
      try {
        setHasFetchedLikePreview(true);
        const data = await appDispatch(
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
        // Keep flag to prevent infinite retry
      }
    };
    run();
  }, [appDispatch, selectedReelId, isCommentsDrawerOpen, hasFetchedLikePreview]);

  const handleLoadMoreComments = () => {
    if (hasMoreComments && !commentsLoading && selectedReelId) {
      appDispatch(
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

  const handleClose = () => {
    dispatch(closeCommentsDrawer());
  };

  const handleSubmitComment = async (ev: React.FormEvent) => {
    ev.preventDefault();
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
      appDispatch(incrementCommentsCount(selectedReelId));
      appDispatch(
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
      await appDispatch(
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
      appDispatch(incrementCommentsCount(selectedReelId));
      appDispatch(
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
    if (selectedReelId) {
      appDispatch(updateReelLikeOptimistic({ reelId: selectedReelId, isLiked: newIsLiked, likesCount: newCount }));
    }
  };

  const handleReelLikeSuccess = async () => {
    if (!selectedReelId) return;
    try {
      const data = await appDispatch(
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
          const result = await appDispatch(
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
      const result = await appDispatch(
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
    } finally {
      setRepliesLoading((p) => ({ ...p, [commentId]: false }));
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
    setEmojiPickerPosition({ top: window.innerHeight / 2 - 100, right: 20 });
    setCurrentCommentForEmoji(commentId);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (replyingTo) {
      setReplyContent((p) => p + emoji);
    } else {
      setCommentText((p) => p + emoji);
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

  const handleProfileClickLocal = (userName: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigateToProfile(navigate, userName);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await appDispatch(deleteCommentThunk(parseInt(commentId))).unwrap();
      if (selectedReelId) {
        appDispatch(decrementCommentsCount(selectedReelId));
        appDispatch(
          getReelCommentsThunk({
            reelId: parseInt(selectedReelId),
            params: { pageNo: 0, pageSize: 20 },
          })
        );
      }
      handleCloseActionMenu();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa bình luận.",
      });
    }
  };

  const handleReportSubmit = async (reelId: string, reason: string, details: string) => {
    try {
      await reportReel(reelId, reason, details);
      toast({
        title: "Thành công",
        description: "Báo cáo của bạn đã được gửi.",
      });
      setShowReportDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi báo cáo. Vui lòng thử lại.",
      });
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
          onClick={(e) => handleProfileClickLocal(reply.userName, e)}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage
              src={getAvatarUrl(reply.avatarUrl)}
              alt={reply.userName}
            />
            <AvatarFallback>{getAvatarInitials(reply.userName)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-semibold text-xs cursor-pointer hover:underline"
              onClick={(e) => handleProfileClickLocal(reply.userName, e)}
            >
              {reply.userName}
            </span>
          </div>
          <p className="text-xs leading-relaxed mb-2 break-words">
            {parseMentions(reply.content, (username) => {
              handleProfileClickLocal(username);
            })}
          </p>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
            <span 
              className="text-[11px] text-gray-500"
              style={{ whiteSpace: "nowrap" }}
            >
              {formatTimeAgo(reply.createdAt)}
            </span>
            {getLikesCount(reply.id, reply.likesCount) > 0 && (
              <button
                type="button"
                onClick={() => openLikesDialog(reply.id, "reply")}
                className="text-[11px] text-gray-500 hover:underline"
                style={{ whiteSpace: "nowrap" }}
              >
                {formatNumber(getLikesCount(reply.id, reply.likesCount))} lượt thích
              </button>
            )}
            <button
              onClick={() => setReplyingTo(reply.id)}
              className="text-[11px] text-gray-500 hover:text-gray-600 transition-colors font-semibold"
              type="button"
              style={{ whiteSpace: "nowrap" }}
            >
              Trả lời
            </button>
            <button
              onClick={(e) => handleOpenActionMenu(reply.id, e)}
              className={cn(
                "inline-flex items-center justify-center w-5 h-5 p-1 transition-opacity",
                hoveredItemId === reply.id ? "opacity-100" : "opacity-0"
              )}
              aria-label="Tùy chọn"
              type="button"
              style={{ whiteSpace: "nowrap" }}
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

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 transition-transform duration-300 flex flex-col"
        style={{
          height: "80vh",
          maxHeight: "80vh",
          transform: isCommentsDrawerOpen ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0 cursor-pointer" onClick={handleClose}>
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold">Bình luận</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List Scroll Container */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          {/* Owner Caption Comment */}
          <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => handleProfileClickLocal(currentReel.userName)}
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
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-semibold text-sm hover:underline cursor-pointer"
                  onClick={() => handleProfileClickLocal(currentReel.userName)}
                >
                  {currentReel.userName}
                </span>
                <span className="text-gray-500 text-xs">
                  {formatTimeAgo(currentReel.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100 break-words">
                {parseMentions(currentReel.caption, (username) => {
                  handleProfileClickLocal(username);
                })}
              </p>
            </div>
          </div>

          {/* Other Comments */}
          {commentsLoading && displayComments.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : commentsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{commentsError}</p>
            </div>
          ) : displayComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có bình luận</p>
              <p className="text-xs mt-1">Hãy là người đầu tiên bình luận</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {displayComments.map((comment, index) => (
                <li
                  key={comment.id}
                  ref={index === displayComments.length - 1 ? lastElementRef : null}
                  className="flex items-start gap-3"
                  onMouseEnter={() => setHoveredItemId(comment.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <div
                    className="relative cursor-pointer flex-shrink-0"
                    onClick={(e) => handleProfileClickLocal(comment.userName, e)}
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-semibold text-sm cursor-pointer hover:underline"
                            onClick={(e) => handleProfileClickLocal(comment.userName, e)}
                          >
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 break-words">
                          {parseMentions(comment.content, (username) => {
                            handleProfileClickLocal(username);
                          })}
                        </p>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                          {getLikesCount(comment.id, comment.likesCount) > 0 && (
                            <button
                              type="button"
                              onClick={() => openLikesDialog(comment.id, "comment")}
                              className="text-xs text-gray-500 hover:underline"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {formatNumber(getLikesCount(comment.id, comment.likesCount))} lượt thích
                            </button>
                          )}
                          <button
                            className="text-xs text-gray-500 hover:text-gray-600 font-semibold"
                            onClick={() => setReplyingTo(comment.id)}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            Trả lời
                          </button>
                          <button
                            onClick={(e) => handleOpenActionMenu(comment.id, e)}
                            className={cn(
                              "inline-flex items-center justify-center w-6 h-6 p-1 transition-opacity",
                              hoveredItemId === comment.id ? "opacity-100" : "opacity-0"
                            )}
                            aria-label="Tùy chọn"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                          </button>
                        </div>
                        
                        {/* Nested Replies Rendering */}
                        {((comment.replies && comment.replies.length > 0) || comment.hasMoreReplies) && (
                          <div className="mt-2">
                            {!expandedReplies[comment.id] ? (
                              <button
                                type="button"
                                onClick={() => toggleReplies(comment.id)}
                                className="text-xs text-gray-500 hover:text-gray-700 font-semibold"
                              >
                                Xem câu trả lời
                              </button>
                            ) : (
                              <>
                                <div className="mt-2 ml-2 border-l border-gray-200 dark:border-gray-800 pl-3 space-y-3">
                                  {comment.replies?.map((reply) =>
                                    renderReplyItem(reply, comment.id)
                                  )}
                                  {repliesHasMore[comment.id] && (
                                    <div className="mt-2">
                                      {repliesLoading[comment.id] ? (
                                        <div className="flex justify-center py-2">
                                          <Loader />
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleLoadMoreReplies(comment.id)}
                                          className="text-xs text-gray-500 hover:text-gray-700 font-semibold"
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
                                  className="text-xs text-gray-500 hover:text-gray-700 font-semibold mt-2"
                                >
                                  Ẩn câu trả lời
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <LikeButton
                      targetId={parseInt(comment.id)}
                      targetType="comment"
                      isLiked={getIsLiked(comment.id, comment.isLiked)}
                      likesCount={getLikesCount(comment.id, comment.likesCount)}
                      size="sm"
                      showCount={false}
                      onLikeChange={(newIsLiked, newCount) =>
                        handleCommentLikeChange(comment.id, newIsLiked, newCount)
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

        {/* Footer controls & Input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4 mb-3">
            <LikeButton
              targetId={parseInt(selectedReelId || "0")}
              targetType="reel"
              isLiked={isReelLikedLocal}
              likesCount={reelLikesCount}
              size="md"
              showCount={true}
              onLikeChange={handleReelLikeChange}
              onLikeSuccess={handleReelLikeSuccess}
              className="h-auto p-0"
            />
            <button
              onClick={() => textareaRef.current?.focus()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              type="button"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <div className="flex-1" />
          </div>

          {reelLikesCount > 0 && (
            <div className="mb-2 text-xs">
              {latestLikeName ? (
                <>
                  <button
                    type="button"
                    onClick={() => openLikesDialog(selectedReelId || "0", "reel")}
                    className="font-medium hover:underline"
                  >
                    {latestLikeName}
                  </button>
                  {reelLikesCount > 1 && (
                    <>
                      <span className="text-gray-500"> và </span>
                      <button
                        type="button"
                        onClick={() => openLikesDialog(selectedReelId || "0", "reel")}
                        className="font-medium hover:underline"
                      >
                        những người khác
                      </button>
                    </>
                  )}
                  <span className="text-gray-500"> đã thích</span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openLikesDialog(selectedReelId || "0", "reel")}
                  className="font-medium hover:underline"
                >
                  {formatNumber(reelLikesCount)} lượt thích
                </button>
              )}
            </div>
          )}

          <div className="mb-3 text-[10px] text-gray-400">
            <time>{formatTimeAgo(currentReel.createdAt)}</time>
          </div>

          {replyingTo ? (
            <form onSubmit={handleSubmitReply} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Đang trả lời...</span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-xs text-primary hover:text-primary/95"
                >
                  Hủy
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={(e) => handleOpenEmojiPicker(null, e)}
                  className="emoji-button text-gray-500 hover:text-gray-700"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <Textarea
                  ref={textareaRef}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Thêm trả lời..."
                  className="flex-1 min-h-[36px] resize-none border border-gray-200 dark:border-gray-800 rounded-lg py-1 px-3 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                  rows={1}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!replyContent.trim()}
                  variant="ghost"
                  className="text-primary hover:text-primary/95 disabled:text-gray-400"
                >
                  Gửi
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={(e) => handleOpenEmojiPicker(null, e)}
                className="emoji-button text-gray-500 hover:text-gray-700"
              >
                <Smile className="w-5 h-5" />
              </button>
              <Textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Thêm bình luận..."
                className="flex-1 min-h-[36px] resize-none border border-gray-200 dark:border-gray-800 rounded-lg py-1 px-3 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                rows={1}
                disabled={isCreating}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!commentText.trim() || isCreating}
                variant="ghost"
                className="text-primary hover:text-primary/95 disabled:text-gray-400"
              >
                Gửi
              </Button>
            </form>
          )}
        </div>
      </div>

      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />

      <ActionMenu
        isOpen={showActionMenu}
        onClose={handleCloseActionMenu}
        position={actionMenuPosition}
        items={(() => {
          let comment: Comment | undefined = displayComments.find(
            (c) => c.id === currentCommentForAction
          );
          if (!comment) {
            for (const root of displayComments) {
              if (root.replies) {
                const r = root.replies.find((x) => x.id === currentCommentForAction);
                if (r) {
                  comment = r;
                  break;
                }
              }
            }
          }
          if (!comment) return [{ label: "Hủy", action: handleCloseActionMenu }];

          const isCommentOwner = comment.userId === user?.id.toString();
          const isReelOwner = currentReel.userId === user?.id.toString();
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
            action: () => {},
            isDestructive: true,
          });
          items.push({ label: "Hủy", action: handleCloseActionMenu });
          return items;
        })()}
      />

      <LikesDialog
        isOpen={!!showLikesDialog}
        onClose={closeLikesDialog}
        targetType={
          showLikesDialog?.targetType === "reel"
            ? "reel"
            : showLikesDialog?.targetType === "comment" ||
              showLikesDialog?.targetType === "reply"
              ? "comment"
              : undefined
        }
        targetId={showLikesDialog?.targetId ? parseInt(showLikesDialog.targetId) : undefined}
      />

      {showReportDialog && (
        <ReportPostDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          postId={selectedReelId || ""}
          onReport={(reelId, reason, details) => {
            handleReportSubmit(reelId, reason, details);
          }}
          title="Báo cáo Reel"
        />
      )}
    </>
  );
};

export default ReelCommentDrawer;
