/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { PostCard } from "../components/PostCard";
import { EditPostDialog } from "../components/EditPostDialog";
import { ReportPostDialog } from "../components/ReportPostDialog";
import { ShareDialog } from "../components/ShareDialog";
import { Stories } from "@/components/common/Stories";
import { StoryViewer } from "@/features/story/components";
import { sortStoriesByViewedStatus } from "@/features/story/utils/sortStories";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  getFeedThunk,
  updatePostThunk,
  deletePostThunk,
  togglePostActiveThunk,
} from "../postSlice";
import {
  createCommentThunk,
  likeCommentThunk,
  likePostThunk,
} from "@/features/interaction/interactionSlice";
import {
  getUserStoriesThunk,
  getFriendStoriesThunk,
} from "@/features/story/storySlice";
import { Loader } from "@/components/common/Loader";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import type { UpdatePostRequest } from "../types";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  file: File;
}

export const FeedPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { posts, isLoading, error, hasMore, currentPage } = useAppSelector(
    (state) => state.post
  );
  const { 
    userStories, 
    friendStories, 
    isLoading: isLoadingStories,
    friendHasMore,
    friendCurrentPage
  } = useAppSelector((state) => state.story);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [reportingPost, setReportingPost] = useState<string | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePost, setSharePost] = useState<any>(null);
  const { toast } = useToast();

  // Load feed and stories when component mounts
  useEffect(() => {
    if (user) {
      dispatch(getFeedThunk({ userId: user.id, page: 0, limit: 10 }));
      // Load current user's stories
      dispatch(
        getUserStoriesThunk({ userId: user.id, pageNo: 0, pageSize: 10 })
      );
      // Load friends' stories
      dispatch(
        getFriendStoriesThunk({ userId: user.id, pageNo: 0, pageSize: 10 })
      );
    }
  }, [dispatch, user]);

  // Infinite scroll handler for posts
  const handleLoadMore = () => {
    if (user && !isLoading && hasMore) {
      const nextPage = currentPage + 1;
      dispatch(getFeedThunk({ userId: user.id, page: nextPage, limit: 10 }));
    }
  };

  // Infinite scroll handler for stories
  const handleLoadMoreStories = () => {
    if (user && !isLoadingStories && friendHasMore) {
      // Use the correct current page from store
      const nextPage = friendCurrentPage + 1;
      dispatch(getFriendStoriesThunk({ 
        userId: user.id, 
        pageNo: nextPage,
        pageSize: 10 
      }));
    }
  };

  // Use infinite scroll hook with higher threshold
  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore,
    isLoading,
    error, // Pass error to prevent infinite loop on error
    threshold: 200, // Trigger earlier for smoother experience
  });

  const handleLike = async (postId: string) => {
    try {
      await dispatch(likePostThunk(parseInt(postId))).unwrap();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thích bài viết. Vui lòng thử lại.",
      });
    }
  };

  const handleBookmark = (postId: string) => {
    // TODO: Dispatch bookmarkPostThunk
    console.log("Bookmark post:", postId);
  };

  const handleEdit = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPost(post);
    }
  };

  const handleSaveEdit = (files: File[], updateData: UpdatePostRequest) => {
    dispatch(updatePostThunk({ files, postData: updateData }))
      .unwrap()
      .then(() => {
        toast({
          title: "Cập nhật thành công!",
          description: "Bài viết đã được cập nhật.",
        });
        setEditingPost(null);
        // Refresh feed from beginning
        if (user) {
          dispatch(getFeedThunk({ userId: user.id, page: 0, limit: 10 }));
        }
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error || "Không thể cập nhật bài viết.",
        });
        setEditingPost(null);
      });
  };

  const handleDelete = (postId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      dispatch(deletePostThunk(parseInt(postId)))
        .unwrap()
        .then(() => {
          toast({
            title: "Xóa bài viết thành công!",
            description: "Bài viết đã được xóa khỏi trang cá nhân của bạn.",
          });
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: error || "Không thể xóa bài viết.",
          });
        });
    }
  };

  const handleReport = (postId: string, reason: string, details?: string) => {
    console.log("Report post:", { postId, reason, details });
    setReportingPost(null);
  };

  const handleShare = (postId: string, userIds: string[], message: string) => {
    // In a real app, this would send the share data to the backend
    console.log("Sharing post:", { postId, userIds, message });

    toast({
      title: "Chia sẻ thành công!",
      description: `Đã gửi bài viết đến ${userIds.length} người`,
      duration: 2000,
    });

    setShowShareDialog(false);
    setSharePost(null);
  };

  const handleOpenShareDialog = (post: any) => {
    setSharePost(post);
    setShowShareDialog(true);
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!user) return;

    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(postId),
          reelId: 0,
          parentId: 0,
          content,
          listMentionUserId: [],
        })
      ).unwrap();
      // Refresh comments if needed - CommentDialog will reload automatically
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm bình luận. Vui lòng thử lại.",
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
        description: "Không thể thích bình luận. Vui lòng thử lại.",
      });
    }
  };

  const handleReplyComment = async (commentId: string, content: string, postId?: string) => {
    if (!user || !postId) return;

    try {
      await dispatch(
        createCommentThunk({
          id: 0,
          userId: user.id,
          postId: parseInt(postId),
          reelId: 0,
          parentId: parseInt(commentId),
          content,
          listMentionUserId: [],
        })
      ).unwrap();
      // Refresh comments if needed
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể trả lời bình luận. Vui lòng thử lại.",
      });
    }
  };

  const handleStoryClick = (story: any) => {
    // Use sorted stories for consistent order
    const allStories = [...userStories, ...friendStories];
    const sortedStories = sortStoriesByViewedStatus(allStories);
    const storyIndex = sortedStories.findIndex((s) => s.id === story.id);
    if (storyIndex !== -1) {
      setCurrentStoryIndex(storyIndex);
      setShowStoryViewer(true);
    }
  };

  // Show initial loading
  if (isLoading && posts.length === 0) {
    return <Loader overlay />;
  }

  // Show error
  if (error && posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg"
            onClick={() =>
              user &&
              dispatch(getFeedThunk({ userId: user.id, page: 0, limit: 10 }))
            }
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Combine stories: user stories FIRST, then friend stories
  const allStories = [...userStories, ...friendStories];

  // Sort stories by viewed status
  const sortedStories = sortStoriesByViewedStatus(allStories);

  // Transform to Stories component format
  const displayStories = sortedStories
    .filter((story) => story.content && story.content.length > 0) // Filter out empty stories
    .map((story) => ({
      id: story.id,
      username: story.username,
      profileImage: story.profileImage,
      hasNewStory: story.content.length > 0,
      isViewed: story.isViewed || false,
      isOwnStory: story.isOwnStory,
      isCloseFriend: false, // Story type doesn't have isCloseFriend
    }));

  return (
    <div className="w-full min-h-screen bg-background pt-4">
      {/* Stories */}
      <Stories 
        stories={displayStories} 
        onStoryClick={handleStoryClick}
        showCreateButton={true}
        currentUserAvatar={user?.avatar}
        onLoadMore={handleLoadMoreStories}
        hasMore={friendHasMore}
        isLoading={isLoadingStories}
      />

      {/* Posts Feed */}
      <div className="space-y-6 p-4">
        {posts.map((post, index) => {
          const isLastItem = index === posts.length - 1;

          return (
            <div key={post.id} ref={isLastItem ? lastElementRef : null}>
              <PostCard
                post={post as any}
                onLike={handleLike}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReport={(postId) => setReportingPost(postId)}
                onShare={handleShare}
                onOpenShareDialog={() => handleOpenShareDialog(post)}
                isShareDialogOpen={showShareDialog && sharePost?.id === post.id}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
                onReplyComment={handleReplyComment}
                isOwnPost={post.userId === user?.id.toString()}
                isInProfilePage={false}
              />
            </div>
          );
        })}

        {/* Load more indicator */}
        {isLoading && posts.length > 0 && (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        )}

        {/* Error indicator for load more */}
        {error && posts.length > 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              onClick={handleLoadMore}
            >
              Thử lại
            </button>
          </div>
        )}

        {posts.length === 0 && !isLoading && (
          <div className="text-center py-40">
            <p className="text-muted-foreground mb-4">Chưa có bài viết nào.</p>
          </div>
        )}
      </div>

      {/* Edit Post Dialog */}
      {editingPost && (
        <EditPostDialog
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          postId={parseInt(editingPost.id)}
          userId={user?.id || 0}
          initialContent={editingPost.caption}
          initialVisibility={
            editingPost.visibility.toUpperCase() as "PUBLIC" | "PRIVATE"
          }
          initialMediaUrl={editingPost.media.map((m: any) => m.url)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Report Post Dialog */}
      {reportingPost && (
        <ReportPostDialog
          isOpen={!!reportingPost}
          onClose={() => setReportingPost(null)}
          postId={reportingPost}
          onReport={handleReport}
        />
      )}

      {/* Story Viewer */}
      {showStoryViewer && (
        <StoryViewer
          isOpen={showStoryViewer}
          onClose={() => setShowStoryViewer(false)}
          stories={sortedStories}
          initialStoryIndex={currentStoryIndex}
        />
      )}

      {/* Share Dialog */}
      {sharePost && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => {
            setShowShareDialog(false);
            setSharePost(null);
          }}
          post={sharePost}
          onShare={handleShare}
        />
      )}
    </div>
  );
};
