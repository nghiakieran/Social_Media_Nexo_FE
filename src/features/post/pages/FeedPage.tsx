/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostComposer } from '../components/PostComposer';
import { PostCard } from '../components/PostCard';
import { EditPostDialog } from '../components/EditPostDialog';
import { ReportPostDialog } from '../components/ReportPostDialog';
import { Stories } from '@/components/common/Stories';
import { StoryViewer } from '@/features/story/components';
import { mockPosts } from '../__mocks__/posts';
import { mockStories, mockStoriesData } from '../__mocks__/stories';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  file: File;
}

export const FeedPage = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [showComposer, setShowComposer] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [reportingPost, setReportingPost] = useState<string | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const { toast } = useToast();

  const handleCreatePost = async (postData: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
        const newPost = {
        id: `post_${Date.now()}`,
        userId: 'current_user',
        userName: 'Bạn',
        userAvatar: 'https://picsum.photos/40/40?random=999',
        content: postData.content,
        media: postData.media.map((item: MediaItem) => ({
          id: item.id,
          type: item.type,
          url: item.url,
          alt: `Media ${item.id}`,
        })),
        privacy: postData.privacy,
        taggedUsers: postData.taggedUsers,
        hashtags: postData.hashtags,
        location: postData.location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        isBookmarked: false,
        isPinned: false,
        violationScore: Math.random(), // Mock violation score
      };

      setPosts(prev => [newPost, ...prev]);
      setShowComposer(false);
      
      toast({
        title: "Đăng bài thành công!",
        description: "Bài viết của bạn đã được đăng.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.",
      });
    }
  };

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

  const handleStoryClick = (story: any) => {
    const storyIndex = mockStories.findIndex(s => s.id === story.id);
    if (storyIndex !== -1) {
      setCurrentStoryIndex(storyIndex);
      setShowStoryViewer(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Create Post Button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <Button onClick={() => setShowComposer(true)} className="w-full gap-2" variant="outline">
          <Plus className="w-4 h-4" />
          Tạo bài viết mới
        </Button>
      </div>

      {/* Stories */}
      <Stories stories={mockStories} onStoryClick={handleStoryClick} />

        {/* Post Composer */}
        {showComposer && (
          <div className="p-4 border-b border-border">
            <PostComposer
              onSubmit={handleCreatePost}
              isLoading={false}
            />
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowComposer(false)}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

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
            />
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
              </p>
              <Button 
                onClick={() => setShowComposer(true)}
                variant="instagram"
              >
                Tạo bài viết
              </Button>
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
    </div>
  );
};