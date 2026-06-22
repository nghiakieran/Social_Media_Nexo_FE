import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Smile,
  EyeOff,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CommentDialog } from "./CommentDialog";
import { LazyImage } from "@/components/common/LazyImage";
import { HLSVideoPlayer } from "@/components/common/HLSVideoPlayer";
import { ShareDialog } from "./ShareDialog";
import { EmojiPicker } from "@/components/common/EmojiPicker";
import { useToast } from "@/hooks/use-toast";
import { LikesDialog } from "./LikesDialog";
import { ActionMenu } from "@/components/common/ActionMenu";
import { useBookmark } from "@/features/saved/hooks/useBookmark";
import { useLazyBookmarkCheck } from "@/features/saved/hooks/useLazyBookmarkCheck";
import { useNavigate } from "react-router-dom";
import { navigateToPost, navigateToProfile } from "@/utils/navigation";
import { formatTimeAgoShort } from "@/utils/timeFormat";
import { useAppDispatch, useAppSelector } from "@/store";
import { togglePostActiveThunk } from "../postSlice";
import { LikeButton } from "@/features/interaction/components/LikeButton";
import {
  getPostCommentsThunk,
  createCommentThunk,
  clearComments,
} from "@/features/interaction/interactionSlice";
import { getPostLikeDetailThunk } from "@/features/interaction";
import { useInView } from "@/hooks/use-in-view";
import { parseMentions } from "@/utils/mentions";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface TaggedUser {
  userId: number;
  userName: string;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  caption: string;
  media: MediaItem[];
  visibility: "public" | "private";
  taggedUsers: TaggedUser[];
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isActive: boolean;
  violationScore?: number;
  violationType?: string;
}

interface CommentType {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: CommentType[];
}

// Utility function to transform API comment response to CommentType
const transformComment = (comment: {
  id: number;
  userId: number;
  userName: string;
  avatarUrl: string;
  content: string;
  likesCount?: number;
  like?: boolean;
  createdAt: string;
}): CommentType => ({
  id: comment.id.toString(),
  userId: comment.userId.toString(),
  userName: comment.userName,
  avatarUrl: comment.avatarUrl,
  content: comment.content,
  likesCount: comment.likesCount || 0,
  isLiked: comment.like || false,
  createdAt: comment.createdAt,
});

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string) => void;
  onShare?: (postId: string, userIds: string[], message: string) => void;
  onOpenShareDialog?: () => void;
  isShareDialogOpen?: boolean;
  comments?: CommentType[];
  onAddComment?: (postId: string, content: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyComment?: (
    commentId: string,
    content: string,
    postId?: string,
  ) => void;
  isOwnPost?: boolean; // Để biết có phải post của mình không
  isInProfilePage?: boolean; // Để biết có đang ở profile page không
}

export const PostCard = ({
  post,
  onLike,
  onEdit,
  onDelete,
  onReport,
  onShare,
  onOpenShareDialog,
  isShareDialogOpen = false,
  comments = [],
  onAddComment,
  onLikeComment,
  onReplyComment,
  isOwnPost = false,
  isInProfilePage = false,
}: PostCardProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const { toast } = useToast();
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [inlineComment, setInlineComment] = useState("");
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [postComments, setPostComments] = useState<CommentType[]>([]);
  const [hasFetchedComments, setHasFetchedComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [latestLikeName, setLatestLikeName] = useState<string | null>(null);
  const [hasFetchedLikePreview, setHasFetchedLikePreview] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Use bookmark hook
  const { isBookmarked, toggleBookmark } = useBookmark();

  // Lazy check bookmark status when post comes into view
  const lazyCheckRef = useLazyBookmarkCheck([post.id]);

  // Check if post is in viewport
  const { hasBeenInView } = useInView(cardRef, {
    threshold: 0.1,
    rootMargin: "200px", // Start loading when 200px before entering viewport
    triggerOnce: true, // Only trigger once
  });

  // Fetch comments preview for this post only when it enters viewport
  useEffect(() => {
    // Only fetch if:
    // 1. Post is in view (hasBeenInView)
    // 2. Haven't fetched yet (hasFetchedComments === false)
    // 3. Has more comments (hasMoreComments === true)
    if (!hasBeenInView || hasFetchedComments || !hasMoreComments) {
      return;
    }

    const fetchComments = async () => {
      try {
        setHasFetchedComments(true);
        const result = await dispatch(
          getPostCommentsThunk({
            postId: parseInt(post.id),
            params: { pageNo: 0, pageSize: 1 },
          }),
        ).unwrap();

        // Transform and store in local state (only root comments)
        if (result && result.commentResponseList) {
          const rootComments = result.commentResponseList
            .filter(
              (c: { parentId?: number }) => !c.parentId || c.parentId === 0,
            )
            .slice(0, 2)
            .reverse();

          const comments = rootComments.map(transformComment);
          setPostComments(comments);

          // Update commentsCount from totalElements
          setCommentsCount(result.totalElements || 0);

          // Check if there are more comments
          if (result.commentResponseList.length < 2 || result.last) {
            setHasMoreComments(false);
          }
        } else {
          setHasMoreComments(false);
        }
      } catch (error) {
        console.error("Error fetching comments preview:", error);
      }
    };

    fetchComments();
  }, [dispatch, post.id, hasBeenInView, hasFetchedComments, hasMoreComments]);

  // Fetch like preview (newest liker + total count) when in view
  useEffect(() => {
    if (!hasBeenInView || hasFetchedLikePreview) return;
    const fetchLikePreview = async () => {
      try {
        setHasFetchedLikePreview(true);
        const data = await dispatch(
          getPostLikeDetailThunk({
            postId: parseInt(post.id),
            params: { pageNo: 0, pageSize: 1 },
          }),
        ).unwrap();

        const total = data.totalElements ?? 0;
        setLikesCount(total);

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
      } catch (e) {
        // Keep flag as true to prevent infinite retry loops on persistent errors (e.g. 403)
      }
    };
    fetchLikePreview();
  }, [dispatch, post.id, hasBeenInView, hasFetchedLikePreview]);

  // Sync state when post prop changes - ensure it's always in sync with API data
  useEffect(() => {
    setIsLiked(post.isLiked);
    setLikesCount(post.likesCount);
    setCommentsCount(post.commentsCount);
  }, [post.id, post.isLiked, post.likesCount, post.commentsCount]);

  const privacyIcons = {
    public: Globe,
    private: Lock,
  };

  const PrivacyIcon = privacyIcons[post.visibility] || Globe;

  const handleProfileClick = () => {
    navigateToProfile(navigate, post.userName);
  };

  const handleTagClick = (userName: string) => {
    navigateToProfile(navigate, userName);
  };

  const handleNavigateToProfile = (userName: string) => {
    navigateToProfile(navigate, userName);
  };

  const handleGoToPost = (postId: string) => {
    navigateToPost(navigate, postId);
  };

  const handleLikeChange = (newIsLiked: boolean, newCount: number) => {
    setIsLiked(newIsLiked);
    // Đơn giản: tăng/giảm 1 khi like/unlike
    setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1);
  };

  const handleLikeSuccess = async () => {
    // Gọi API để đồng bộ lại danh sách likes sau khi API POST like hoàn tất thành công
    try {
      const data = await dispatch(
        getPostLikeDetailThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 1 },
        }),
      ).unwrap();

      const total = data.totalElements ?? 0;
      setLikesCount(total);

      // Luôn lấy user đầu tiên trong danh sách (người like mới nhất)
      if (data.content && data.content.length > 0) {
        setLatestLikeName(data.content[0].userName);
      } else {
        setLatestLikeName(null);
      }
    } catch (_) {
      // Giữ nguyên state hiện tại nếu API lỗi
    }
  };

  const handleCommentClick = () => {
    setShowCommentDialog(true);
  };

  const handleCloseCommentDialog = () => {
    setShowCommentDialog(false);
    // Refresh comments preview when dialog closes (to show 2 newest comments)
    if (hasFetchedComments) {
      const refreshComments = async () => {
        try {
          const result = await dispatch(
            getPostCommentsThunk({
              postId: parseInt(post.id),
              params: { pageNo: 0, pageSize: 1 },
            }),
          ).unwrap();

          if (result && result.commentResponseList) {
            // API returns newest first, reverse để comment mới nhất hiển thị ở dưới cùng
            const rootComments = result.commentResponseList
              .filter(
                (c: { parentId?: number }) => !c.parentId || c.parentId === 0,
              )
              .slice(0, 2)
              .reverse();

            const comments = rootComments.map(transformComment);
            setPostComments(comments);

            // Update commentsCount from totalElements
            setCommentsCount(result.totalElements || 0);
          }
        } catch (error) {
          console.error("Error refreshing comments preview:", error);
        }
      };
      refreshComments();
    }
  };

  const handleShareClick = () => {
    if (onOpenShareDialog) {
      onOpenShareDialog();
    }
  };

  const handleReactionToggle = (emoji: string) => {
    toast({
      title: `${emoji} Phản ứng!`,
      duration: 1500,
    });
  };

  const handleOpenEmojiPicker = (event: React.MouseEvent) => {
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
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    setShowEmojiPicker(false);
    toast({
      title: `${emoji} Phản ứng!`,
      description: "Phản ứng của bạn đã được ghi nhận.",
    });
  };

  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const handleAddComment = async (content: string) => {
    if (!user) return;

    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(post.id),
          reelId: 0,
          parentId: 0,
          content,
          listMentionUserId: [],
        }),
      ).unwrap();

      // Refresh comments after adding - API returns newest first
      try {
        const result = await dispatch(
          getPostCommentsThunk({
            postId: parseInt(post.id),
            params: { pageNo: 0, pageSize: 1 },
          }),
        ).unwrap();

        if (result && result.commentResponseList) {
          const rootComments = result.commentResponseList
            .filter(
              (c: { parentId?: number }) => !c.parentId || c.parentId === 0,
            )
            .slice(0, 2)
            .reverse();

          const comments = rootComments.map(transformComment);
          setPostComments(comments);

          // Update commentsCount from totalElements
          setCommentsCount(result.totalElements || 0);
        }
      } catch (error) {
        console.error("Error refreshing comments:", error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm bình luận. Vui lòng thử lại.",
      });
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };

  const handleReplyComment = (commentId: string, content: string) => {
    if (onReplyComment) {
      // onReplyComment accepts (commentId, content, postId?)
      onReplyComment(commentId, content, post.id);
    }
  };

  const handleOpenLikesDialog = () => {
    setShowLikesDialog(true);
  };

  const handleCloseLikesDialog = () => {
    setShowLikesDialog(false);
  };

  const handleSubmitInlineComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineComment.trim()) return;

    await handleAddComment(inlineComment.trim());
    setInlineComment("");
  };

  const handleOpenActionMenu = () => {
    setActionMenuPosition({
      top: window.innerHeight / 2,
      left: window.innerWidth / 2,
    });
    setShowActionMenu(true);
  };

  const handleCloseActionMenu = () => setShowActionMenu(false);

  const handlePostAction = async (action: string) => {
    switch (action) {
      case "toggleHidePost":
        try {
          await dispatch(togglePostActiveThunk(parseInt(post.id))).unwrap();
          const isNowHidden = !post.isActive;
          toast({
            variant: "success",
            title: isNowHidden ? "Đã ẩn bài viết" : "Đã hiển thị bài viết",
            description: isNowHidden
              ? "Bài viết sẽ không hiển thị trên trang cá nhân của bạn."
              : "Bài viết đã được hiển thị lại trên trang cá nhân.",
          });
        } catch (error) {
          toast({
            title: "Lỗi",
            description: "Không thể thay đổi trạng thái bài viết.",
            variant: "destructive",
          });
        }
        break;
      case "report":
        onReport(post.id);
        break;
      case "goToPost":
        console.log("Navigating to post:", post.id);
        handleGoToPost(post.id);
        break;
      case "share":
        if (onOpenShareDialog) onOpenShareDialog();
        break;
      case "copyLink":
        navigator.clipboard?.writeText(window.location.href).catch(() => {});
        break;
      case "embed":
        break;
      case "aboutAccount":
        break;
      default:
        break;
    }
    handleCloseActionMenu();
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev < post.media.length - 1 ? prev + 1 : 0,
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev > 0 ? prev - 1 : post.media.length - 1,
    );
  };

  return (
    <Card
      ref={(el) => {
        cardRef.current = el;
        lazyCheckRef(el);
      }}
      className="w-full max-w-md mx-auto bg-background border-border"
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar
              className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleProfileClick}
            >
              <AvatarImage
                src={getAvatarUrl(post.avatarUrl)}
                alt={post.userName}
              />
              <AvatarFallback>
                {getAvatarInitials(post.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-semibold text-foreground text-sm cursor-pointer hover:underline"
                  onClick={handleProfileClick}
                >
                  {post.userName}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatTimeAgoShort(post.createdAt)}</span>
                <span>•</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PrivacyIcon className="w-3 h-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {post.visibility === "public"
                          ? "Công khai"
                          : "Riêng tư"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleOpenActionMenu}
              aria-label="Lựa chọn khác"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {post.caption && (
          <div className="px-4 pb-3">
            <p className="text-sm leading-relaxed">
              {post.caption.split(" ").map((word, index) =>
                word.startsWith("#") ? (
                  <span key={index} className="text-primary font-medium">
                    {word}{" "}
                  </span>
                ) : (
                  word + " "
                ),
              )}
            </p>

            {/* Tagged Users */}
            {post.taggedUsers && post.taggedUsers.length > 0 && (
              <div className="mt-2 flex items-center gap-1 flex-wrap">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">với</span>
                {post.taggedUsers.map((tag, index) => (
                  <span key={index} className="text-xs">
                    <span
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleTagClick(tag.userName)}
                    >
                      {tag.userName}
                    </span>
                    {index < post.taggedUsers.length - 1 && (
                      <span className="text-muted-foreground">, </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media */}
        {post.media.length > 0 && (
          <div className="relative">
            {/* Violation Detection Ribbon */}
            {post.violationScore && post.violationScore > 0.7 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Nghi ngờ vi phạm
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nội dung này có thể vi phạm chính sách cộng đồng</p>
                    <p className="text-xs">
                      Độ tin cậy: {Math.round((post.violationScore || 0) * 100)}
                      %
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <div className="aspect-square bg-muted relative overflow-hidden">
              {post.media[currentMediaIndex].type === "image" ? (
                <LazyImage
                  src={post.media[currentMediaIndex].url}
                  alt={post.media[currentMediaIndex].alt || "Post media"}
                  className="w-full h-full"
                  loading="lazy"
                  decoding="async"
                  enableProgressiveLoading
                />
              ) : (
                <HLSVideoPlayer
                  src={post.media[currentMediaIndex].url}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  playsInline
                  preload="metadata"
                />
              )}

              {/* Media Navigation */}
              {post.media.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white p-0"
                    onClick={prevMedia}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white p-0"
                    onClick={nextMedia}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Media Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {post.media.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentMediaIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <LikeButton
                targetId={parseInt(post.id)}
                targetType="post"
                isLiked={isLiked}
                likesCount={likesCount}
                showCount
                onLikeChange={handleLikeChange}
                onLikeSuccess={handleLikeSuccess}
              />
              <button
                className="h-9 w-9 inline-flex items-center justify-center select-none touch-manipulation text-foreground hover:opacity-80 active:opacity-60 transition-opacity"
                onClick={handleCommentClick}
                aria-label="Bình luận"
                type="button"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <button
                className="h-9 w-9 inline-flex items-center justify-center select-none touch-manipulation text-foreground hover:opacity-80 active:opacity-60 transition-opacity"
                onClick={handleShareClick}
                aria-label="Chia sẻ"
                type="button"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button
              className={`h-9 w-9 inline-flex items-center justify-center select-none touch-manipulation transition-opacity ${
                isBookmarked(post.id)
                  ? "text-foreground"
                  : "text-foreground hover:opacity-80 active:opacity-60"
              }`}
              onClick={async () => {
                const success = await toggleBookmark(post.id);
                if (!success) {
                  toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: "Không thể lưu bài viết. Vui lòng thử lại.",
                  });
                }
              }}
              aria-label="Lưu bài viết"
              type="button"
            >
              <Bookmark
                className={`w-6 h-6 ${
                  isBookmarked(post.id) ? "fill-current" : ""
                }`}
              />
            </button>
          </div>

          {/* Likes summary */}
          {likesCount > 0 && (
            <button
              type="button"
              onClick={handleOpenLikesDialog}
              className="mt-1 text-left text-sm w-full"
            >
              {latestLikeName ? (
                <>
                  <span className="font-medium hover:underline">
                    {latestLikeName}
                  </span>
                  {likesCount > 1 && (
                    <>
                      <span className="text-gray-600 dark:text-gray-300">
                        {" "}
                        và{" "}
                      </span>
                      <span className="font-medium hover:underline">
                        những người khác
                      </span>
                    </>
                  )}
                  <span className="text-gray-600 dark:text-gray-300">
                    {" "}
                    đã thích
                  </span>
                </>
              ) : (
                <span className="text-gray-600 dark:text-gray-300">
                  {likesCount.toLocaleString("vi-VN")} lượt thích
                </span>
              )}
            </button>
          )}

          {/* Comments Count */}
          {commentsCount > 0 && (
            <div className="mb-2">
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleCommentClick}
              >
                Xem tất cả {commentsCount.toLocaleString("vi-VN")} bình luận
              </button>
            </div>
          )}

          {/* Comments Preview (latest 2) */}
          {postComments && postComments.length > 0 && (
            <ul className="mb-2 space-y-1">
              {postComments.map((c) => (
                <li key={c.id} className="flex items-start text-sm max-w-full">
                  <button
                    type="button"
                    className="font-medium mr-2 hover:underline shrink-0"
                    onClick={handleCommentClick}
                  >
                    {c.userName}
                  </button>
                  <span className="break-all whitespace-pre-wrap text-sm text-foreground max-w-full">
                    {parseMentions(c.content, (username) => {
                      navigateToProfile(navigate, username);
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Inline comment input */}
          <form
            onSubmit={handleSubmitInlineComment}
            className="mt-2 flex items-center gap-3"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowEmojiPicker(true);
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Biểu tượng cảm xúc"
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              value={inlineComment}
              onChange={(e) => setInlineComment(e.target.value)}
              placeholder="Bình luận..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!inlineComment.trim()}
              className={`text-sm font-semibold ${
                inlineComment.trim()
                  ? "text-primary hover:text-primary/90"
                  : "text-gray-400 cursor-default"
              }`}
            >
              Đăng
            </button>
          </form>
        </div>
      </CardContent>

      {/* Comment Dialog */}
      <CommentDialog
        isOpen={showCommentDialog}
        onClose={handleCloseCommentDialog}
        post={post}
        comments={postComments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onReplyComment={handleReplyComment}
        onLikePost={onLike}
        onShare={onShare}
        isPostLiked={post.isLiked}
        onOpenShareDialog={onOpenShareDialog}
        isShareDialogOpen={isShareDialogOpen}
        isAuthorFollowed={false}
        onToggleFollowAuthor={(userId, next) => {}}
        onNavigateToProfile={handleNavigateToProfile}
      />

      {/* Likes Dialog */}
      <LikesDialog
        isOpen={showLikesDialog}
        onClose={handleCloseLikesDialog}
        title="Lượt thích"
        infoText={undefined}
        targetType="post"
        targetId={parseInt(post.id)}
      />

      {/* Action Menu */}
      <ActionMenu
        isOpen={showActionMenu}
        onClose={handleCloseActionMenu}
        position={actionMenuPosition}
        items={[
          {
            label: "Báo cáo",
            action: () => handlePostAction("report"),
            isDestructive: true,
          },
          {
            label: "Đi đến bài viết",
            action: () => handlePostAction("goToPost"),
          },
          { label: "Chia sẻ lên...", action: () => handlePostAction("share") },
          {
            label: "Sao chép liên kết",
            action: () => handlePostAction("copyLink"),
          },
          { label: "Nhúng", action: () => handlePostAction("embed") },
          {
            label: "Giới thiệu về tài khoản này",
            action: () => handlePostAction("aboutAccount"),
          },
          { label: "Hủy", action: handleCloseActionMenu },
        ]}
      />

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={(emoji) => {
          setInlineComment((prev) => prev + emoji);
          setShowEmojiPicker(false);
        }}
        position={emojiPickerPosition}
      />
    </Card>
  );
};
