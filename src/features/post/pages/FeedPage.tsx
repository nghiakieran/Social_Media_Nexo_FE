/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { PostCard } from '../components/PostCard';
import { EditPostDialog } from '../components/EditPostDialog';
import { ReportPostDialog } from '../components/ReportPostDialog';
import { ShareDialog } from '../components/ShareDialog';
import { Stories } from '@/components/common/Stories';
import { StoryViewer } from '@/features/story/components';
import { mockPosts } from '../__mocks__/posts';
import { mockStories, mockStoriesData } from '../__mocks__/stories';
import { mockComments } from '@/features/interaction/__mocks__/comments';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  file: File;
}

export const FeedPage = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [reportingPost, setReportingPost] = useState<string | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [comments, setComments] = useState<any[]>(mockComments);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharePost, setSharePost] = useState<any>(null);
  const { toast } = useToast();


  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleEdit = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setEditingPost(post);
    }
  };

  const handleSaveEdit = (postId: string, updatedData: any) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, ...updatedData }
        : post
    ));
    setEditingPost(null);
  };

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    toast({
      title: "Xóa bài viết thành công!",
      description: "Bài viết đã được xóa khỏi trang cá nhân của bạn.",
    });
  };

  const handleReport = (postId: string, reason: string, details?: string) => {
    console.log('Report post:', { postId, reason, details });
    setReportingPost(null);
  };

  const handleShare = (postId: string, userIds: string[], message: string) => {
    // In a real app, this would send the share data to the backend
    console.log('Sharing post:', { postId, userIds, message });
    
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

  const handleAddComment = (postId: string, content: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      postId,
      userId: 'current_user',
      userName: 'Bạn',
      userAvatar: 'https://picsum.photos/40/40?random=999',
      content,
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };
    
    setComments(prev => [...prev, newComment]);
    
    // Update post comment count
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, commentsCount: post.commentsCount + 1 }
        : post
    ));
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1
          }
        : comment
    ));
  };

  const handleReplyComment = (commentId: string, content: string) => {
    const newReply = {
      id: `reply_${Date.now()}`,
      postId: 'post1', // Use a default postId since we're working with mock data
      userId: 'current_user',
      userName: 'Bạn',
      userAvatar: 'https://picsum.photos/40/40?random=999',
      content,
      parentId: commentId,
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...(comment.replies || []), newReply] }
        : comment
    ));
  };

  const handleStoryClick = (story: any) => {
    const storyIndex = mockStories.findIndex(s => s.id === story.id);
    if (storyIndex !== -1) {
      setCurrentStoryIndex(storyIndex);
      setShowStoryViewer(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background pt-4">
      {/* Stories */}
      <Stories stories={mockStories} onStoryClick={handleStoryClick} />

        {/* Posts Feed */}
        <div className="space-y-6 p-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={(postId) => setReportingPost(postId)}
                        onShare={handleShare}
                        onOpenShareDialog={() => handleOpenShareDialog(post)}
                        isShareDialogOpen={showShareDialog && sharePost?.id === post.id}
                        comments={comments.filter(comment => comment.postId === post.id)}
                        onAddComment={handleAddComment}
                        onLikeComment={handleLikeComment}
                        onReplyComment={handleReplyComment}
            />
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Chưa có bài viết nào.
              </p>
            </div>
          )}
        </div>

        {/* Edit Post Dialog */}
        {editingPost && (
          <EditPostDialog
            isOpen={!!editingPost}
            onClose={() => setEditingPost(null)}
            post={editingPost}
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
            stories={mockStoriesData}
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