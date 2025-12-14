import { useState, useMemo } from "react";
import { Play, Heart, MessageCircle, ImageOff } from "lucide-react";
import { ProfilePost } from "../profileSlice";
import { CommentDialog } from "@/features/post/components/CommentDialog";
import { MobilePostDetail } from "@/features/post/components/MobilePostDetail";
import { ShareDialog } from "@/features/post/components/ShareDialog";
import { EditPostDialog } from "@/features/post/components/EditPostDialog";
import { useAppSelector, useAppDispatch } from "@/store";
import { useNavigate } from "react-router-dom";
import { LazyGrid } from "@/components/common/LazyGrid";
import {
  deletePostThunk,
  togglePostActiveThunk,
  getPostsThunk,
  updatePostThunk,
} from "@/features/post/postSlice";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UpdatePostRequest } from "@/features/post/types";
import {
  getPostCommentsThunk,
  createCommentThunk,
  likeCommentThunk,
  clearComments,
} from "@/features/interaction/interactionSlice";
import { useEffect } from "react";
import { ReportPostDialog } from "@/features/post/components/ReportPostDialog";
import { reportPost } from "@/features/post/api/postApi";

interface PostGridProps {
  posts: ProfilePost[];
  onPostClick?: (post: ProfilePost) => void;
  lastElementRef?: (node: HTMLElement | null) => void;
}

interface PostDetailProps {
  post: ProfilePost;
  onClose: () => void;
}

const PostDetail = ({ post, onClose }: PostDetailProps) => null;

export const PostGrid = ({
  posts,
  onPostClick,
  lastElementRef,
}: PostGridProps) => {
  const [selectedPost, setSelectedPost] = useState<ProfilePost | null>(null);
  const [editingPost, setEditingPost] = useState<ProfilePost | null>(null);
  const profile = useAppSelector((s) => s.profile.currentProfile);
  const currentUser = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState<Record<string, boolean>>({});
  const [isBookmarkedById, setIsBookmarkedById] = useState<
    Record<string, boolean>
  >({});
  const [reportingPost, setReportingPost] = useState<ProfilePost | null>(null);
  // Get comments from Redux state
  const { comments: reduxComments } = useAppSelector(
    (state) => state.interaction.comments
  );

  // Load comments when post is selected
  useEffect(() => {
    if (selectedPost) {
      dispatch(clearComments());
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(selectedPost.id),
          params: { pageNo: 0, pageSize: 50 },
        })
      );
    }
  }, [dispatch, selectedPost]);

  const handleReportSubmit = async (
    postId: string,
    reason: string,
    details?: string
  ) => {
    try {
      await reportPost(postId, reason, details);

      toast({
        title: "Đã gửi báo cáo",
        description:
          "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét bài viết này.",
      });

      setReportingPost(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi báo cáo. Vui lòng thử lại sau.",
      });
    }
  };

  const handleOpenReport = (post: ProfilePost) => {
    setReportingPost(post);
    setSelectedPost(null);
  };

  interface CDComment {
    id: string;
    userId: string;
    userName: string;
    avatarUrl: string;
    content: string;
    likesCount: number;
    isLiked: boolean;
    createdAt: string;
    replies?: CDComment[];
  }

  interface MockReply {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    avatarUrl: string;
    content: string;
    likesCount?: number;
    isLiked?: boolean;
    createdAt: string;
    updatedAt?: string;
    parentId?: string;
    replies?: MockReply[];
  }

  // Transform Redux comments to CDComment format - inline transformation

  const selectedComments = useMemo<CDComment[]>(() => {
    if (!selectedPost) return [];
    return reduxComments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.userName,
      avatarUrl: comment.avatarUrl,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: comment.isLiked,
      createdAt: comment.createdAt,
      replies: comment.replies?.map((reply) => ({
        id: reply.id,
        userId: reply.userId,
        userName: reply.userName,
        avatarUrl: reply.avatarUrl,
        content: reply.content,
        likesCount: reply.likesCount,
        isLiked: reply.isLiked,
        createdAt: reply.createdAt,
        replies: reply.replies,
      })),
    }));
  }, [selectedPost, reduxComments]);

  const currentComments: CDComment[] = useMemo(() => {
    if (!selectedPost) return [];
    return selectedComments;
  }, [selectedComments, selectedPost]);

  // Helper functions for API calls
  const handleAddCommentAPI = async (content: string) => {
    if (!selectedPost || !currentUser) return;
    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: currentUser.id,
          postId: parseInt(selectedPost.id),
          reelId: 0,
          parentId: 0,
          content,
          listMentionUserId: [],
        })
      ).unwrap();
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(selectedPost.id),
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

  const handleLikeCommentAPI = async (commentId: string) => {
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

  const handleReplyCommentAPI = async (parentId: string, content: string) => {
    if (!selectedPost || !currentUser) return;
    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: currentUser.id,
          postId: parseInt(selectedPost.id),
          reelId: 0,
          parentId: parseInt(parentId),
          content,
          listMentionUserId: [],
        })
      ).unwrap();
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(selectedPost.id),
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

  const handleLikePostAPI = (postId: string) => {
    // LikeButton đã tự gọi API rồi, chỉ cần update local state
    setIsPostLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handlePostClick = (post: ProfilePost) => {
    setSelectedPost(post);
    onPostClick?.(post);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await dispatch(deletePostThunk(parseInt(postId))).unwrap();
      toast({
        title: "Đã xóa",
        description: "Bài viết đã được xóa thành công.",
      });
      setSelectedPost(null);
      // Refresh posts - ProfilePage sẽ tự load lại từ store
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleToggleHidePost = async (postId: string, isActive: boolean) => {
    try {
      await dispatch(togglePostActiveThunk(parseInt(postId))).unwrap();
      const isNowHidden = !isActive;
      toast({
        title: isNowHidden ? "Đã ẩn bài viết" : "Đã hiển thị bài viết",
        description: isNowHidden
          ? "Bài viết sẽ không hiển thị trên trang cá nhân của bạn."
          : "Bài viết đã được hiển thị lại trên trang cá nhân.",
      });
      setSelectedPost(null);

      // Refresh posts to update the list
      if (profile) {
        const userId = parseInt(profile.id);
        dispatch(getPostsThunk({ userId, pageNo: 0, pageSize: 10 }));
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi trạng thái bài viết.",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (post: ProfilePost) => {
    setEditingPost(post);
    setSelectedPost(null); // Close comment dialog
  };

  const handleSaveEdit = async (
    files: File[],
    updateData: UpdatePostRequest
  ) => {
    if (!editingPost) return;

    try {
      await dispatch(
        updatePostThunk({
          files,
          postData: updateData,
        })
      ).unwrap();

      toast({
        title: "Đã cập nhật",
        description: "Bài viết đã được cập nhật thành công.",
      });

      setEditingPost(null);

      // Refresh posts to show updated content
      if (profile) {
        const userId = parseInt(profile.id);
        dispatch(getPostsThunk({ userId, pageNo: 0, pageSize: 10 }));
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài viết. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4">
        <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-muted rounded-full flex items-center justify-center mb-3 md:mb-4">
          <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-base md:text-lg font-semibold mb-2">
          Chưa có bài viết
        </h3>
        <p className="text-sm md:text-base text-muted-foreground text-center">
          Khi bạn chia sẻ ảnh và video, các bài viết sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <>
      <LazyGrid
        items={posts.map((post, index) => ({
          id: post.id,
          thumbnail:
            post.media[0]?.thumbnail ||
            post.media[0]?.url ||
            "/placeholder.svg",
          type: (post.media[0]
            ? post.media[0]?.type === "image"
              ? "photo"
              : "video"
            : "photo") as
            | "photo"
            | "video"
            | "reel",
          caption: post.caption,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          ref: index === posts.length - 1 ? lastElementRef : undefined,
        }))}
        onItemClick={(item) => {
          const post = posts.find((p) => p.id === item.id);
          if (post) handlePostClick(post);
        }}
        className="px-4 md:px-0 pb-4"
        columns={3}
        gap="md"
        enableProgressiveLoading={true}
        enableBlurToSharp={false}
        renderPlaceholder={(item) =>
          item.thumbnail
            ? undefined
            : (
                <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <ImageOff className="w-6 h-6" />
                  <span className="text-xs font-medium">Bài viết không có ảnh/video</span>
                </div>
              )
        }
        renderOverlay={(item, isVisible) => {
          if (!isVisible) return null;

          return (
            <>
              {/* Video/Reel indicator */}
              {item.type === "video" && (
                <div className="absolute top-2 right-2">
                  <Play className="w-4 h-4 text-white fill-current drop-shadow-lg" />
                </div>
              )}

              {/* Hover overlay with stats */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{item.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{item.commentsCount}</span>
                  </div>
                </div>
              </div>
            </>
          );
        }}
      />

      {selectedPost && !isMobile && (
        <CommentDialog
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={{
            id: selectedPost.id,
            userId: selectedPost.userId,
            userName: selectedPost.userName,
            avatarUrl: selectedPost.avatarUrl,
            caption: selectedPost.caption,
            media: selectedPost.media || [],
            likesCount: selectedPost.likesCount,
            commentsCount: selectedPost.commentsCount,
            createdAt: selectedPost.createdAt,
            updatedAt: selectedPost.updatedAt,
            isActive: selectedPost.isActive,
          }}
          comments={currentComments}
          onAddComment={handleAddCommentAPI}
          onLikeComment={handleLikeCommentAPI}
          onReplyComment={handleReplyCommentAPI}
          onLikePost={handleLikePostAPI}
          isPostLiked={
            isPostLiked[selectedPost.id] ?? selectedPost.isLiked ?? false
          }
          onOpenShareDialog={() => setIsShareOpen(true)}
          isShareDialogOpen={isShareOpen}
          onNavigateToProfile={(userName) => navigate(`/${userName}`)}
          onNavigateToPost={(postId) => navigate(`/posts/${postId}`)}
          onDeletePost={handleDeletePost}
          actionMenuItems={
            // Check if this is the current user's own post
            currentUser && selectedPost.userId === currentUser.id.toString()
              ? [
                  {
                    label: "Xóa",
                    action: () => handleDeletePost(selectedPost.id),
                    isDestructive: true,
                  },
                  {
                    label: "Chỉnh sửa",
                    action: () => handleEditPost(selectedPost),
                  },
                  {
                    label: selectedPost.isActive
                      ? "🙈 Ẩn bài viết khỏi trang cá nhân"
                      : "👁️ Hiển thị bài viết",
                    action: () =>
                      handleToggleHidePost(
                        selectedPost.id,
                        selectedPost.isActive
                      ),
                  },
                  {
                    label: "Ẩn số lượt thích với những người khác",
                    action: () => {},
                  },
                  { label: "Tắt tính năng bình luận", action: () => {} },
                  {
                    label: "Đi đến bài viết",
                    action: () => {
                      navigate(`/posts/${selectedPost.id}`);
                    },
                  },
                  {
                    label: "Giới thiệu về tài khoản này",
                    action: () => {
                      console.log("Navigating to post:", selectedPost.id);
                    },
                  },
                  { label: "Hủy", action: () => {} },
                ]
              : [
                  {
                    label: "Báo cáo",
                    action: () => handleOpenReport(selectedPost),
                    isDestructive: true,
                  },
                  {
                    label: "Đi đến bài viết",
                    action: () => {
                      navigate(`/posts/${selectedPost.id}`);
                    },
                  },
                  {
                    label: "Giới thiệu về tài khoản này",
                    action: () => {
                      console.log("Navigating to post:", selectedPost.id);
                    },
                  },
                  { label: "Hủy", action: () => {} },
                ]
          }
        />
      )}

      {/* Mobile Post Detail */}
      {selectedPost && isMobile && (
        <MobilePostDetail
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={{
            id: selectedPost.id,
            userId: selectedPost.userId,
            userName: selectedPost.userName,
            avatarUrl: selectedPost.avatarUrl,
            caption: selectedPost.caption,
            media: selectedPost.media || [],
            likesCount: selectedPost.likesCount,
            commentsCount: selectedPost.commentsCount,
            createdAt: selectedPost.createdAt,
            isActive: selectedPost.isActive,
          }}
          comments={currentComments}
          onAddComment={handleAddCommentAPI}
          onLikeComment={handleLikeCommentAPI}
          onReplyComment={handleReplyCommentAPI}
          onLikePost={handleLikePostAPI}
          isPostLiked={
            isPostLiked[selectedPost.id] ?? selectedPost.isLiked ?? false
          }
          actionMenuItems={
            currentUser && selectedPost.userId === currentUser.id.toString()
              ? [
                  {
                    label: "Xóa",
                    action: () => handleDeletePost(selectedPost.id),
                  },
                  {
                    label: "Chỉnh sửa",
                    action: () => handleEditPost(selectedPost),
                  },
                  {
                    label: selectedPost.isActive
                      ? "🙈 Ẩn bài viết khỏi trang cá nhân"
                      : "👁️ Hiển thị bài viết",
                    action: () =>
                      handleToggleHidePost(
                        selectedPost.id,
                        selectedPost.isActive
                      ),
                  },
                  {
                    label: "Đi đến bài viết",
                    action: () => {
                      navigate(`/posts/${selectedPost.id}`);
                    },
                  },
                  { label: "Hủy", action: () => {} },
                ]
              : [
                  {
                    label: "Báo cáo",
                    action: () => handleOpenReport(selectedPost),
                  },
                  {
                    label: "Đi đến bài viết",
                    action: () => {
                      navigate(`/posts/${selectedPost.id}`);
                    },
                  },
                  { label: "Hủy", action: () => {} },
                ]
          }
          onNavigateToProfile={(userName) => navigate(`/${userName}`)}
          onNavigateToPost={(postId) => navigate(`/posts/${postId}`)}
        />
      )}

      {/* Share Dialog to match homepage behavior */}
      {selectedPost && (
        <ShareDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          post={{
            id: selectedPost.id,
            content: selectedPost.caption,
            media: selectedPost.media.map((m) => ({
              url: m.url,
              type: m.type,
              alt: selectedPost.caption,
            })),
            userName: selectedPost.userName,
            avatarUrl: selectedPost.avatarUrl,
            createdAt: selectedPost.createdAt,
          }}
          onShare={(postId, userIds, message) => {
            // mock share success then close
            setIsShareOpen(false);
          }}
        />
      )}

      {/* Edit Post Dialog */}
      {editingPost && (
        <EditPostDialog
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          postId={parseInt(editingPost.id)}
          userId={parseInt(editingPost.userId)}
          initialContent={editingPost.caption}
          initialVisibility={
            (editingPost.visibility?.toUpperCase() as "PUBLIC" | "PRIVATE") ||
            "PUBLIC"
          }
          initialMediaUrl={editingPost.media?.map((m) => m.url) || []}
          onSave={handleSaveEdit}
        />
      )}

      {reportingPost && (
        <ReportPostDialog
          isOpen={!!reportingPost}
          onClose={() => setReportingPost(null)}
          postId={reportingPost.id}
          onReport={handleReportSubmit}
        />
      )}
    </>
  );
};
