import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../../store";
import { LazyGrid } from "../../../components/common/LazyGrid";
import { Bookmark } from "lucide-react";
import { CommentDialog } from "../../post/components/CommentDialog";
import { ShareDialog } from "../../post/components/ShareDialog";
import { useBookmark } from "../hooks/useBookmark";
import { useToast } from "../../../hooks/use-toast";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../../hooks/use-mobile";
import {
  getPostCommentsThunk,
  createCommentThunk,
  likeCommentThunk,
  clearComments,
} from "@/features/interaction/interactionSlice";
import { getSavedPostsThunk } from "../savedSlice";
import { likePostThunk } from "@/features/post/postSlice";
import { useMemo } from "react";

interface SavedAllPostsContentProps {
  onBack?: () => void;
  pageSize?: number;
}

export const SavedAllPostsContent: React.FC<SavedAllPostsContentProps> = ({
  onBack,
  pageSize = 20,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { posts, loading, pagination } = useAppSelector((state) => state.saved);
  const { posts: allPosts } = useAppSelector((state) => state.post);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isAuthorFollowed, setIsAuthorFollowed] = useState<
    Record<string, boolean>
  >({});
  const user = useAppSelector((state) => state.auth.user);

  // Load saved posts on mount
  useEffect(() => {
    dispatch(getSavedPostsThunk({ page: 0, size: pageSize }));
  }, [dispatch, pageSize]);

  // Infinite scroll - load more saved posts
  const handleLoadMore = useCallback(() => {
    if (!loading && !pagination.last) {
      dispatch(getSavedPostsThunk({ page: pagination.pageNo + 1, size: pageSize }));
    }
  }, [loading, pagination.pageNo, pagination.last, pageSize, dispatch]);

  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: !pagination.last,
    isLoading: loading,
    threshold: 100,
  });

  // Get comments from Redux state
  const { comments: reduxComments } = useAppSelector(
    (state) => state.interaction.comments,
  );

  // Load comments when post is selected
  useEffect(() => {
    if (selectedPost) {
      dispatch(clearComments());
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(selectedPost.id),
          params: { pageNo: 0, pageSize: 50 },
        }),
      );
    }
  }, [dispatch, selectedPost]);

  const currentComments = useMemo(() => {
    if (!selectedPost) return [];
    // Transform Redux comments to CDComment format
    return reduxComments.map((comment: any): any => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.userName,
      avatarUrl: comment.avatarUrl,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: comment.isLiked,
      createdAt: comment.createdAt,
      replies: comment.replies?.map((r: any): any => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        avatarUrl: r.avatarUrl,
        content: r.content,
        likesCount: r.likesCount,
        isLiked: r.isLiked,
        createdAt: r.createdAt,
      })),
    }));
  }, [selectedPost, reduxComments]);

  const handlePostClick = (item: {
    id: string;
    thumbnail: string;
    type?: string;
    caption?: string;
    likesCount?: number;
    commentsCount?: number;
  }) => {
    const post = posts.find((p) => p.id === item.id);
    if (post) {
      if (isMobile) {
        navigate(`/posts/${post.post.id}`);
      } else {
        setSelectedPost(post.post);
        setShowCommentDialog(true);
      }
    }
  };

  // Comment handlers
  const handleAddComment = async (content: string) => {
    if (!selectedPost || !user) return;
    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(selectedPost.id),
          reelId: 0,
          parentId: 0,
          content,
          listMentionUserId: [],
        }),
      ).unwrap();
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(selectedPost.id),
          params: { pageNo: 0, pageSize: 50 },
        }),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm bình luận.",
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

  const handleReplyComment = async (parentId: string, content: string) => {
    if (!selectedPost || !user) return;
    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(selectedPost.id),
          reelId: 0,
          parentId: parseInt(parentId),
          content,
          listMentionUserId: [],
        }),
      ).unwrap();
      dispatch(
        getPostCommentsThunk({
          postId: parseInt(selectedPost.id),
          params: { pageNo: 0, pageSize: 50 },
        }),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể trả lời bình luận.",
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await dispatch(likePostThunk(postId)).unwrap();
      if (selectedPost) {
        setSelectedPost((prev: any) =>
          prev
            ? {
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.likesCount + (prev.isLiked ? -1 : 1),
              }
            : prev,
        );
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thực hiện thao tác. Vui lòng thử lại.",
      });
    }
  };

  const handleShare = (postId: string, userIds: string[], message: string) => {
    toast({
      title: "Đã chia sẻ bài viết!",
      description: `Chia sẻ với ${userIds.length} người dùng.`,
      duration: 2000,
    });
    console.log(
      "Sharing post:",
      postId,
      "To users:",
      userIds,
      "Message:",
      message,
    );
    // TODO: Implement actual share API call
    setShowShareDialog(false);
  };

  const handleOpenShareDialog = () => {
    setShowShareDialog(true);
  };

  const handleToggleFollowAuthor = (
    userId: string,
    nextIsFollowing: boolean,
  ) => {
    setIsAuthorFollowed((prev) => ({
      ...prev,
      [userId]: nextIsFollowing,
    }));
    toast({
      title: nextIsFollowing ? "Đã theo dõi!" : "Đã bỏ theo dõi!",
      duration: 1500,
    });
    console.log("Toggle follow author:", userId, "Following:", nextIsFollowing);
    // TODO: Implement actual follow/unfollow API call
  };

  return (
    <div className="px-4 py-4">
      {/* Content */}
      {posts.length === 0 && loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : posts.length > 0 ? (
        <>
          <LazyGrid
            items={posts.map((post, index) => ({
              id: post.id,
              thumbnail: post.post.media[0]?.url || "/placeholder.svg",
              type:
                post.post.media[0]?.type === "image"
                  ? "photo"
                  : post.post.media[0]?.type || "photo",
              caption: post.post.content,
              likesCount: post.post.likesCount,
              commentsCount: post.post.commentsCount,
              ref: index === posts.length - 1 ? lastElementRef : undefined,
            }))}
            onItemClick={handlePostClick}
            className="pb-4"
            columns={3}
            gap="md"
            enableProgressiveLoading={true}
            enableBlurToSharp={false}
            renderOverlay={(item, isVisible) => {
              if (!isVisible) return null;

              const post = posts.find((p) => p.id === item.id);
              if (!post) return null;

              const isVideo =
                post.post.media[0]?.type === "video" ||
                post.post.media[0]?.type === "reel";
              const isCarousel = post.post.media.length > 1;

              return (
                <>
                  {/* Video/Reel indicator */}
                  {isVideo && (
                    <div className="absolute top-2 right-2">
                      <svg
                        className="w-4 h-4 text-white fill-current drop-shadow-lg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}

                  {/* Carousel indicator */}
                  {isCarousel && (
                    <div className="absolute top-2 left-2">
                      <svg
                        className="w-4 h-4 text-white fill-current drop-shadow-lg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </>
              );
            }}
          />
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 sm:py-12 px-4">
          <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-1">
            Chưa có bài viết nào được lưu
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-xs mx-auto mb-4">
            Bắt đầu lưu các bài viết yêu thích để xem lại sau
          </p>
        </div>
      )}

      {/* Comment Dialog */}
      {selectedPost && (
        <CommentDialog
          isOpen={showCommentDialog}
          onClose={() => {
            setShowCommentDialog(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          comments={currentComments}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onReplyComment={handleReplyComment}
          onLikePost={handleLikePost}
          onShare={handleShare}
          onOpenShareDialog={handleOpenShareDialog}
          isPostLiked={selectedPost.isLiked || false}
          onPostLikeChange={(newIsLiked, newCount) => {
            setSelectedPost((prev: any) =>
              prev ? { ...prev, isLiked: newIsLiked, likesCount: newCount } : prev
            );
          }}
          isAuthorFollowed={isAuthorFollowed[selectedPost.author?.id] || false}
          onToggleFollowAuthor={handleToggleFollowAuthor}
        />
      )}

      {/* Share Dialog */}
      {selectedPost && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          post={selectedPost}
          onShare={handleShare}
        />
      )}
    </div>
  );
};
