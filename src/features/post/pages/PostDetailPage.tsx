import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { useBookmark } from "@/features/saved/hooks/useBookmark";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { navigateToProfile } from "@/utils/navigation";
import {
  ArrowLeft,
  Bookmark,
  Globe,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Users,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getPostDetailThunk,
  deletePostThunk,
  updatePostThunk,
  togglePostActiveThunk,
} from "../postSlice";
import type { UpdatePostRequest } from "../types";
import { ActionMenuDialog } from "../components/ActionMenuDialog";
import { formatTimeAgo } from "@/utils/timeFormat";
import { CommentSection } from "@/features/interaction/components/CommentSection";
import { LikeButton } from "@/features/interaction/components/LikeButton";
import { EditPostDialog } from "../components/EditPostDialog";
import { LikesDialog } from "../components/LikesDialog";
import { MediaSlider } from "../components/MediaSlider";
import { ShareDialog } from "../components/ShareDialog";
import { Loader } from "@/components/common/Loader";
import type { Post } from "../types";
import { CommentDialog } from "../components/CommentDialog";
import {
  clearComments,
  createCommentThunk,
  getPostCommentsThunk,
  likeCommentThunk,
} from "@/features/interaction/interactionSlice";

// Interface for UI Post (extends API Post with additional UI properties)
interface UIPost extends Post {
  stats: {
    likes: number;
    comments: number;
  };
  interactions: {
    isLiked: boolean;
    isBookmarked: boolean;
    isShared: boolean;
  };
  taggedFriends: string[];
}

export const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { currentPost, isLoading, error } = useAppSelector(
    (state) => state.post
  );
  const { user } = useAppSelector((state) => state.auth);

  const [post, setPost] = useState<UIPost | null>(null);
  const [interactions, setInteractions] = useState({
    isLiked: false,
    isBookmarked: false,
    isShared: false,
  });

  // Load post detail when component mounts
  useEffect(() => {
    if (postId && user) {
      dispatch(getPostDetailThunk(parseInt(postId)));
    }
  }, [dispatch, user, postId]);

  // Map currentPost to UIPost when loaded
  useEffect(() => {
    if (currentPost) {
      const uiPost: UIPost = {
        ...currentPost,
        stats: {
          likes: currentPost.likesCount,
          comments: currentPost.commentsCount,
        },
        interactions: {
          isLiked: currentPost.isLiked,
          isBookmarked: currentPost.isBookmarked,
          isShared: false,
        },
        taggedFriends: currentPost.taggedUsers.map((t) => t.userName),
      };
      setPost(uiPost);
      setInteractions({
        isLiked: currentPost.isLiked,
        isBookmarked: currentPost.isBookmarked,
        isShared: false,
      });
    }
  }, [currentPost]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLikesDialog, setShowLikesDialog] = useState<null | {
    targetId: string;
    targetType: "post" | "comment" | "reply";
  }>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const { comments: reduxComments } = useAppSelector(
    (state) => state.interaction.comments
  );

  const privacyIcons = {
    public: Globe,
    private: Lock,
  };

  const handleLikeChange = (isLiked: boolean, newCount: number) => {
    setInteractions((prev) => ({
      ...prev,
      isLiked,
    }));

    setPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          likes: newCount,
        },
      };
    });
  };

  const handleBookmark = () => {
    toggleBookmark(post.id);
    setInteractions((prev) => ({
      ...prev,
      isBookmarked: !prev.isBookmarked,
    }));
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleOpenActionMenu = () => {
    setShowActionMenu(true);
  };

  const handleCloseActionMenu = () => {
    setShowActionMenu(false);
  };

  const handleActionMenuAction = async (action: string) => {
    switch (action) {
      case "delete":
        try {
          await dispatch(deletePostThunk(parseInt(post.id))).unwrap();
          toast({
            variant: "success",
            title: "Đã xóa",
            description: "Bài viết đã được xóa.",
          });
          navigate(-1);
        } catch (error) {
          toast({
            title: "Lỗi",
            description: "Không thể xóa bài viết. Vui lòng thử lại.",
            variant: "destructive",
          });
        }
        break;
      case "edit":
        setShowEditDialog(true);
        break;
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
          // Refresh post detail
          if (postId) {
            dispatch(getPostDetailThunk(parseInt(postId)));
          }
        } catch (error) {
          toast({
            title: "Lỗi",
            description: "Không thể thay đổi trạng thái bài viết.",
            variant: "destructive",
          });
        }
        break;
      case "hideLikes":
        toast({
          variant: "success",
          title: "Đã ẩn",
          description: "Số lượt thích đã được ẩn với những người khác.",
        });
        break;
      case "disableComments":
        toast({
          variant: "success",
          title: "Đã tắt",
          description: "Tính năng bình luận đã được tắt.",
        });
        break;
      case "aboutAccount":
        toast({
          title: "Thông tin tài khoản",
          description: "Đang hiển thị thông tin tài khoản...",
        });
        break;
      default:
        break;
    }
  };

  const handleEditPost = (files: File[], updateData: UpdatePostRequest) => {
    dispatch(updatePostThunk({ files, postData: updateData }))
      .unwrap()
      .then(() => {
        toast({
          variant: "success",
          title: "Cập nhật thành công!",
          description: "Bài viết đã được cập nhật.",
        });
        setShowEditDialog(false);
        // Refresh post detail
        if (postId) {
          dispatch(getPostDetailThunk(parseInt(postId)));
        }
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error || "Không thể cập nhật bài viết.",
        });
        setShowEditDialog(false);
      });
  };

  const handleSharePost = (
    postId: string,
    userIds: string[],
    message: string
  ) => {
    toast({
      variant: "success",
      title: "Đã chia sẻ",
      description: `Bài viết đã được chia sẻ với ${userIds.length} người dùng.`,
    });
    setShowShareDialog(false);
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

  const handleProfileClick = () => {
    navigateToProfile(navigate, post.userName);
  };

  const handleTagClick = (userName: string) => {
    navigateToProfile(navigate, userName);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Comments data mapped for CommentDialog
  const dialogComments = useMemo(() => {
    return reduxComments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.userName,
      avatarUrl: comment.avatarUrl,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: comment.isLiked,
      createdAt: comment.createdAt,
      replies:
        comment.replies?.map((reply) => ({
          id: reply.id,
          userId: reply.userId,
          userName: reply.userName,
          avatarUrl: reply.avatarUrl,
          content: reply.content,
          likesCount: reply.likesCount,
          isLiked: reply.isLiked,
          createdAt: reply.createdAt,
          replies: reply.replies,
        })) || [],
    }));
  }, [reduxComments]);

  // Fetch comments when opening dialog
  useEffect(() => {
    if (!showCommentDialog || !post) return;
    dispatch(clearComments());
    dispatch(
      getPostCommentsThunk({
        postId: parseInt(post.id),
        params: { pageNo: 0, pageSize: 50 },
      })
    );
  }, [dispatch, showCommentDialog, post]);

  const handleAddComment = async (content: string) => {
    if (!post || !user || !content.trim()) return;
    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(post.id),
          reelId: 0,
          parentId: 0,
          content: content.trim(),
          listMentionUserId: [],
        })
      ).unwrap();
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 50 },
        })
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm bình luận.",
      });
    }
  };

  const handleReplyComment = async (parentId: string, content: string) => {
    if (!post || !user || !content.trim()) return;
    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(post.id),
          reelId: 0,
          parentId: parseInt(parentId),
          content: content.trim(),
          listMentionUserId: [],
        })
      ).unwrap();
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(post.id),
          params: { pageNo: 0, pageSize: 50 },
        })
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể trả lời bình luận.",
      });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await dispatch(likeCommentThunk(parseInt(commentId))).unwrap();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thích bình luận.",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return <Loader overlay />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              if (postId) {
                dispatch(getPostDetailThunk(parseInt(postId)));
              }
            }}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Show not found state if post doesn't exist
  if (!post || !postId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy bài viết</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 sm:py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-9 w-9 p-0 rounded-full hover:bg-muted/80 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-base font-semibold text-foreground">Chi tiết bài viết</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {/* Post Card */}
        <div className="bg-card sm:border sm:border-border/50 sm:rounded-xl sm:m-4 sm:shadow-md overflow-hidden">

          {/* Author Row */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <img
                src={post.avatarUrl}
                alt={post.userName}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                onClick={handleProfileClick}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="font-semibold text-sm text-foreground cursor-pointer hover:underline"
                    onClick={handleProfileClick}
                  >
                    {post.userName}
                  </span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {post.visibility === "private" ? (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Globe className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {post.visibility === "private" ? "Chỉ mình tôi" : "Công khai"}
                  </span>
                </div>
              </div>
            </div>

            {post.userId === user?.id.toString() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenActionMenu}
                className="h-8 w-8 p-0 rounded-full hover:bg-muted/80 flex-shrink-0"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="px-4 pb-3">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.caption}</p>
            </div>
          )}

          {/* Tagged Friends */}
          {post.taggedFriends && post.taggedFriends.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">với</span>
                {post.taggedFriends.map((userName, index) => (
                  <span key={index}>
                    <span
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleTagClick(userName)}
                    >
                      {userName}
                    </span>
                    {index < post.taggedFriends.length - 1 && (
                      <span className="text-muted-foreground">, </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Media — edge-to-edge on mobile */}
          {post.media && post.media.length > 0 && (
            <div className="w-full">
              <MediaSlider
                media={post.media.map((media) => ({
                  id: media.id,
                  type: media.type,
                  url: media.url,
                  alt: `Post media ${media.id}`,
                }))}
                className="max-h-max"
              />
            </div>
          )}

          {/* Likes count */}
          {post.stats.likes > 0 && (
            <div className="px-4 pt-3">
              <button
                type="button"
                onClick={() => handleOpenLikesDialog(post.id, "post")}
                className="text-sm font-medium hover:underline text-foreground"
              >
                {post.stats.likes} lượt thích
              </button>
            </div>
          )}

          <Separator className="mt-3" />

          {/* Action Bar */}
          <div className="flex items-center px-2 py-1">
            <LikeButton
              targetId={parseInt(post.id)}
              targetType="post"
              isLiked={interactions.isLiked}
              likesCount={post.stats.likes}
              size="md"
              showCount={false}
              onLikeChange={handleLikeChange}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <span className="text-sm font-medium">Thích</span>
            </LikeButton>

            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-primary"
              onClick={() => {
                commentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                  const textarea = commentSectionRef.current?.querySelector("textarea");
                  textarea?.focus();
                }, 400);
              }}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Bình luận</span>
            </button>

            <button
              onClick={handleBookmark}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-muted/60 transition-colors",
                isBookmarked(post.id) || interactions.isBookmarked
                  ? "text-yellow-500"
                  : "text-muted-foreground hover:text-yellow-500"
              )}
            >
              <Bookmark
                className={cn(
                  "w-5 h-5",
                  (isBookmarked(post.id) || interactions.isBookmarked) && "fill-current"
                )}
              />
              <span className="text-sm font-medium">Lưu</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div ref={commentSectionRef} className="sm:mx-4 sm:mb-6">
          <CommentSection postId={parseInt(postId!)} />
        </div>
      </div>


      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        post={{
          id: post.id,
          content: post.caption,
          media: post.media || [],
          userName: post.userName,
          avatarUrl: post.avatarUrl,
          createdAt: post.createdAt,
        }}
        onShare={handleSharePost}
      />

      <LikesDialog
        isOpen={!!showLikesDialog}
        onClose={handleCloseLikesDialog}
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
        title={
          showLikesDialog?.targetType === "post"
            ? "Lượt thích"
            : showLikesDialog?.targetType === "comment"
              ? "Lượt thích bình luận"
              : "Lượt thích trả lời"
        }
      />

      {/* Action Menu Dialog */}
      <ActionMenuDialog
        isOpen={showActionMenu}
        onClose={handleCloseActionMenu}
        onAction={handleActionMenuAction}
        isOwnPost={post.userId === user?.id.toString()}
      />

      {/* Edit Post Dialog */}
      <EditPostDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        postId={parseInt(post.id)}
        userId={parseInt(post.userId)}
        initialContent={post.caption}
        initialVisibility={
          post.visibility.toUpperCase() as "PUBLIC" | "PRIVATE"
        }
        initialMediaUrl={post.media.map((m) => m.url)}
        onSave={handleEditPost}
      />

      {/* Comment Dialog with full interaction APIs */}
      <CommentDialog
        isOpen={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        post={{
          id: post.id,
          userId: post.userId,
          userName: post.userName,
          avatarUrl: post.avatarUrl,
          caption: post.caption,
          media: post.media || [],
          likesCount: post.stats.likes,
          commentsCount: post.stats.comments,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          isActive: post.isActive,
        }}
        comments={dialogComments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onReplyComment={handleReplyComment}
        onLikePost={(postId) => {
          if (postId.toString() === post.id) {
            handleLikeChange(!interactions.isLiked, post.stats.likes);
          }
        }}
        onPostLikeChange={handleLikeChange}
        isPostLiked={interactions.isLiked}
        onOpenShareDialog={() => setShowShareDialog(true)}
        isShareDialogOpen={showShareDialog}
        onNavigateToProfile={(userName) => navigate(`/${userName}`)}
        onNavigateToPost={(pid) => navigate(`/posts/${pid}`)}
        onDeletePost={async (pid) => {
          try {
            await dispatch(deletePostThunk(parseInt(pid))).unwrap();
            toast({
              variant: "success",
              title: "Đã xóa",
              description: "Bài viết đã được xóa.",
            });
            navigate(-1);
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Lỗi",
              description: "Không thể xóa bài viết.",
            });
          }
        }}
      />
    </div>
  );
};
