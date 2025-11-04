import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { getPostsThunk, togglePostActiveThunk } from '@/features/post/postSlice';
import { Loader } from '@/components/common/Loader';
import { EyeOff, Info, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { LazyGrid } from '@/components/common/LazyGrid';
import { CommentDialog } from '@/features/post/components/CommentDialog';
import { MobilePostDetail } from '@/features/post/components/MobilePostDetail';
import { ShareDialog } from '@/features/post/components/ShareDialog';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Post } from '@/features/post/types';
import {
  getPostCommentsThunk,
  createCommentThunk,
  likeCommentThunk,
  likePostThunk,
  clearComments,
} from '@/features/interaction/interactionSlice';

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

export const HiddenPostsContent = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAppSelector(state => state.auth);
  const { posts, isLoading, hasMore, currentPage } = useAppSelector(state => state.post);
  const profile = useAppSelector((s) => s.profile.currentProfile);
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState<Record<string, boolean>>({});
  
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
  
  const selectedComments = useMemo<CDComment[]>(() => {
    if (!selectedPost) return [];
    // Transform Redux comments to CDComment format
    return reduxComments.map((comment): CDComment => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.userName,
      avatarUrl: comment.avatarUrl,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: comment.isLiked,
      createdAt: comment.createdAt,
      replies: comment.replies?.map((r): CDComment => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        avatarUrl: r.avatarUrl,
        content: r.content,
        likesCount: r.likesCount,
        isLiked: r.isLiked,
        createdAt: r.createdAt,
        replies: r.replies?.map((rr): CDComment => ({
          id: rr.id,
          userId: rr.userId,
          userName: rr.userName,
          avatarUrl: rr.avatarUrl,
          content: rr.content,
          likesCount: rr.likesCount,
          isLiked: rr.isLiked,
          createdAt: rr.createdAt,
        })),
      })),
    }));
  }, [selectedPost, reduxComments]);
  
  // Filter only hidden posts (isActive = false)
  const hiddenPosts = posts.filter(post => !post.isActive);

  useEffect(() => {
    // Load user's posts (including hidden ones)
    if (user) {
      dispatch(getPostsThunk({ userId: user.id, pageNo: 0, pageSize: 20 }));
    }
  }, [dispatch, user]);

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (user && !isLoading && hasMore) {
      const nextPage = currentPage + 1;
      dispatch(getPostsThunk({ userId: user.id, pageNo: nextPage, pageSize: 20 }));
    }
  }, [user, isLoading, hasMore, currentPage, dispatch]);

  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore,
    isLoading,
    threshold: 200,
  });

  const handleRestorePost = async (postId: string, isActive: boolean) => {
    try {
      await dispatch(togglePostActiveThunk(parseInt(postId))).unwrap();
      toast({
        title: "Đã hiển thị bài viết",
        description: "Bài viết đã được hiển thị lại trên trang cá nhân của bạn.",
      });
      setSelectedPost(null);
      
      // Refresh posts to update the list
      if (user) {
        dispatch(getPostsThunk({ userId: user.id, pageNo: 0, pageSize: 10 }));
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể hiển thị lại bài viết.',
        variant: 'destructive',
      });
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const currentComments: CDComment[] = useMemo(() => {
    if (!selectedPost) return [];
    return selectedComments;
  }, [selectedComments, selectedPost]);

  // Helper functions for API calls
  const handleAddCommentAPI = async (content: string) => {
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

  const handleLikePostAPI = async (postId: string) => {
    try {
      await dispatch(likePostThunk(parseInt(postId))).unwrap();
      setIsPostLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thích bài viết.",
      });
    }
  };

  if (isLoading && hiddenPosts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader />
      </div>
    );
  }

  if (hiddenPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
        <div className="w-16 h-16 md:w-24 md:h-24 mb-4 md:mb-6 rounded-full bg-muted/50 flex items-center justify-center">
          <EyeOff className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-2">Chưa có bài viết nào bị ẩn</h3>
        <p className="text-sm md:text-base text-muted-foreground text-center max-w-sm">
          Các bài viết bạn ẩn đi sẽ xuất hiện ở đây. Bạn có thể xem lại và khôi phục chúng bất cứ lúc nào.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Alert */}
      <div className="px-4 md:px-0">
        <Alert className="border-orange-500/20 bg-orange-500/5">
          <Info className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">
            Các bài viết này đang bị ẩn và không hiển thị trên trang cá nhân của bạn. 
            Click vào bài viết để xem chi tiết và khôi phục.
          </AlertDescription>
        </Alert>
      </div>

      {/* Hidden Posts Grid */}
      <LazyGrid
        items={hiddenPosts.map((post) => ({
          id: post.id,
          thumbnail: post.media[0]?.thumbnail || post.media[0]?.url || '',
          type: (post.media[0]?.type === 'image' ? 'photo' : 'video') as 'photo' | 'video' | 'reel',
          caption: post.caption,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
        }))}
        onItemClick={(item) => {
          const post = hiddenPosts.find(p => p.id === item.id);
          if (post) handlePostClick(post);
        }}
        className="px-4 md:px-0 pb-4"
        renderOverlay={(item, isVisible) => (
          <>
            {/* Default overlay (likes, comments) */}
            {isVisible && (
              <>
                {/* Video/Reel indicator */}
                {(item.type === 'video' || item.type === 'reel') && (
                  <div className="absolute top-2 right-2">
                    <div className="p-1 rounded-full bg-black/60">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Stats overlay on hover */}
                {(item.likesCount !== undefined || item.commentsCount !== undefined) && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    {item.likesCount !== undefined && (
                      <div className="flex items-center gap-2 text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className="font-semibold">{item.likesCount}</span>
                      </div>
                    )}
                    {item.commentsCount !== undefined && (
                      <div className="flex items-center gap-2 text-white">
                        <MessageCircle className="w-6 h-6" fill="currentColor" />
                        <span className="font-semibold">{item.commentsCount}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden Badge - Always visible */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center gap-1 bg-orange-500/90 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                    <EyeOff className="w-3 h-3" />
                    <span>Đã ẩn</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      />

      {/* Infinite scroll trigger */}
      {hiddenPosts.length > 0 && (
        <div ref={lastElementRef} className="h-4" />
      )}

      {/* Load More Indicator */}
      {isLoading && hiddenPosts.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <Loader />
        </div>
      )}

      {/* No More Posts */}
      {!hasMore && hiddenPosts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Đã hiển thị tất cả bài viết đã ẩn
        </div>
      )}

      {/* Desktop - Comment Dialog */}
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
          isPostLiked={isPostLiked[selectedPost.id] ?? selectedPost.isLiked ?? false}
          onOpenShareDialog={() => setIsShareOpen(true)}
          isShareDialogOpen={isShareOpen}
          onNavigateToProfile={(userName) => navigate(`/${userName}`)}
          onNavigateToPost={(postId) => navigate(`/posts/${postId}`)}
          actionMenuItems={[
            { 
              label: '👁️ Hiển thị lại bài viết', 
              action: () => handleRestorePost(selectedPost.id, selectedPost.isActive) 
            },
            { label: 'Đi đến bài viết', action: () => { navigate(`/posts/${selectedPost.id}`); } },
            { label: 'Giới thiệu về tài khoản này', action: () => {} },
            { label: 'Hủy', action: () => {} },
          ]}
        />
      )}

      {/* Mobile - Post Detail */}
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
          isPostLiked={isPostLiked[selectedPost.id] ?? selectedPost.isLiked ?? false}
          actionMenuItems={[
            { 
              label: '👁️ Hiển thị lại bài viết', 
              action: () => handleRestorePost(selectedPost.id, selectedPost.isActive) 
            },
            { label: 'Đi đến bài viết', action: () => { navigate(`/posts/${selectedPost.id}`); } },
            { label: 'Hủy', action: () => {} },
          ]}
          onNavigateToProfile={(userName) => navigate(`/${userName}`)}
          onNavigateToPost={(postId) => navigate(`/posts/${postId}`)}
        />
      )}

      {/* Share Dialog */}
      {selectedPost && (
        <ShareDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          post={{
            id: selectedPost.id,
            content: selectedPost.caption,
            media: selectedPost.media.map(m => ({ 
              url: m.url, 
              type: m.type, 
              alt: selectedPost.caption 
            })),
            userName: selectedPost.userName,
            avatarUrl: selectedPost.avatarUrl,
            createdAt: selectedPost.createdAt,
          }}
          onShare={(postId, userIds, message) => {
            setIsShareOpen(false);
          }}
        />
      )}
    </div>
  );
};
