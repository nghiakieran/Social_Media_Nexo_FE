/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { LazyGrid } from '../../../components/common/LazyGrid';
import { Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { EditCollectionDialog } from './EditCollectionDialog';
import { DeleteCollectionDialog } from './DeleteCollectionDialog';
import { CommentDialog } from '../../post/components/CommentDialog';
import { ShareDialog } from '../../post/components/ShareDialog';
import { useBookmark } from '../hooks/useBookmark';
import { useToast } from '../../../hooks/use-toast';
import { bookmarkPostThunk } from '../../post/postSlice';
import {
  getPostCommentsThunk,
  createCommentThunk,
  likeCommentThunk,
  likePostThunk,
  clearComments,
} from '@/features/interaction/interactionSlice';
import { useEffect, useMemo } from 'react';

interface SavedCollectionDetailContentProps {
  collectionId: string;
  onBack: () => void;
}

export const SavedCollectionDetailContent: React.FC<SavedCollectionDetailContentProps> = ({
  collectionId,
  onBack
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { posts, collections } = useAppSelector((state) => state.saved);
  const { posts: allPosts } = useAppSelector((state) => state.post);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isAuthorFollowed, setIsAuthorFollowed] = useState<Record<string, boolean>>({});
  const user = useAppSelector((state) => state.auth.user);

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

  const currentComments = useMemo(() => {
    if (!selectedPost) return [];
    // Transform Redux comments to CDComment format
    return reduxComments.map((comment: any) => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.userName,
      avatarUrl: comment.avatarUrl,
      content: comment.content,
      likesCount: comment.likesCount,
      isLiked: comment.isLiked,
      createdAt: comment.createdAt,
      replies: comment.replies?.map((r: any) => ({
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

  const collection = collections.find(c => c.id === collectionId);
  const collectionPosts = posts.filter(p => p.collectionId === collectionId);

  const handlePostClick = (item: { id: string; thumbnail: string; type?: string; caption?: string; likesCount?: number; commentsCount?: number }) => {
    const post = collectionPosts.find(p => p.id === item.id);
    if (post) {
      setSelectedPost(post.post);
      setShowCommentDialog(true);
    }
  };

  const handleEditCollection = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteCollection = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCollectionDeleted = () => {
    onBack(); // Go back to collections list after deletion
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

  const handleLikePost = async (postId: string) => {
    try {
      await dispatch(likePostThunk(parseInt(postId))).unwrap();
      const post = allPosts.find(p => p.id === postId);
      if (post && selectedPost) {
        setSelectedPost((prev: any) => prev ? { ...prev, isLiked: !prev.isLiked, likesCount: prev.likesCount + (prev.isLiked ? -1 : 1) } : prev);
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
    console.log('Sharing post:', postId, 'To users:', userIds, 'Message:', message);
    // TODO: Implement actual share API call
    setShowShareDialog(false);
  };

  const handleOpenShareDialog = () => {
    setShowShareDialog(true);
  };

  const handleToggleFollowAuthor = (userId: string, nextIsFollowing: boolean) => {
    setIsAuthorFollowed(prev => ({
      ...prev,
      [userId]: nextIsFollowing
    }));
    toast({
      title: nextIsFollowing ? "Đã theo dõi!" : "Đã bỏ theo dõi!",
      duration: 1500,
    });
    console.log('Toggle follow author:', userId, 'Following:', nextIsFollowing);
    // TODO: Implement actual follow/unfollow API call
  };

  if (!collection) {
    return (
      <div className="px-4 py-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Không tìm thấy bộ sưu tập
        </h1>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700"
        >
          Quay lại danh sách bộ sưu tập
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"/>
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-gray-900" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-sm text-gray-500">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Collection Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditCollection}>
              Chỉnh sửa bộ sưu tập
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDeleteCollection}
              className="text-red-600"
            >
              Xóa bộ sưu tập
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {collectionPosts.length > 0 ? (
        <LazyGrid
          items={collectionPosts.map(post => ({
            id: post.id,
            thumbnail: post.post.media[0]?.url || '/placeholder.svg',
            type: post.post.media[0]?.type === 'image' ? 'photo' : (post.post.media[0]?.type || 'photo'),
            caption: post.post.content,
            likesCount: post.post.likesCount,
            commentsCount: post.post.commentsCount
          }))}
          onItemClick={handlePostClick}
          className="pb-4"
          columns={3}
          gap="md"
          enableProgressiveLoading={true}
          enableBlurToSharp={false}
          renderOverlay={(item, isVisible) => {
            if (!isVisible) return null;
            
            const post = collectionPosts.find(p => p.id === item.id);
            if (!post) return null;
            
            const isVideo = post.post.media[0]?.type === 'video' || post.post.media[0]?.type === 'reel';
            const isCarousel = post.post.media.length > 1;
            
            return (
              <>
                {/* Video/Reel indicator */}
                {isVideo && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
                
                {/* Carousel indicator */}
                {isCarousel && (
                  <div className="absolute top-2 left-2">
                    <svg className="w-4 h-4 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
                
                {/* Hover overlay with stats */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="font-semibold">{item.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                      </svg>
                      <span className="font-semibold">{item.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </>
            );
          }}
        />
      ) : (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bộ sưu tập trống
          </h3>
          <p className="text-gray-500 mb-6">
            Chưa có bài viết nào trong bộ sưu tập "{collection.name}"
          </p>
        </div>
      )}

      {/* Dialogs */}
      <EditCollectionDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        collectionId={collectionId}
        currentName={collection.name}
      />

      <DeleteCollectionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        collectionId={collectionId}
        collectionName={collection.name}
        onDeleted={handleCollectionDeleted}
      />

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
