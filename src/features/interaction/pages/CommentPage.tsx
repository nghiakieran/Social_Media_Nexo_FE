import { useState } from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { CommentList } from '../components/CommentList';
import { CommentComposer } from '../components/CommentComposer';
import { ShareDialog } from '../components/ShareDialog';
import { ReactionBar } from '../components/ReactionBar';
import { mockComments } from '../__mocks__/comments';
import { useToast } from '@/hooks/use-toast';

export const CommentPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [comments, setComments] = useState(mockComments);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleAddComment = async (content: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newComment = {
        id: `comment_${Date.now()}`,
        postId: postId || 'post1',
        userId: 'current_user',
        userName: 'Bạn',
        userAvatar: 'https://picsum.photos/40/40?random=999',
        content,
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setComments(prev => [...prev, newComment]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm bình luận. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
        };
      }
      return comment;
    }));
  };

  const handleReplyToComment = (parentId: string, content: string) => {
    const newReply = {
      id: `reply_${Date.now()}`,
      postId: postId || 'post1',
      userId: 'current_user',
      userName: 'Bạn',
      userAvatar: 'https://picsum.photos/40/40?random=999',
      content,
      parentId,
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      return comment;
    }));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    toast({
      title: "Đã xóa bình luận",
      duration: 2000,
    });
  };

  const handleReportComment = (commentId: string) => {
    toast({
      title: "Đã báo cáo bình luận",
      description: "Chúng tôi sẽ xem xét báo cáo của bạn.",
      duration: 3000,
    });
  };

  const handleShare = (type: 'feed' | 'story' | 'message' | 'link') => {
    console.log('Share type:', type);
  };

  const postUrl = `${window.location.origin}/post/${postId}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background flex flex-col h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="font-semibold text-lg">Bình luận</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareDialog(true)}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Reaction Bar */}
            <div className="mb-6 pb-4 border-b border-border">
              <ReactionBar
                targetId={postId || 'post1'}
                reactions={{
                  '❤️': 24,
                  '👍': 12,
                  '😂': 8,
                  '😮': 3,
                }}
                onReactionToggle={(emoji) => {
                  toast({
                    title: `${emoji} Phản ứng!`,
                    duration: 1500,
                  });
                }}
              />
            </div>

            {/* Comments List */}
            <CommentList
              comments={comments}
              onLike={handleLikeComment}
              onReply={handleReplyToComment}
              onDelete={handleDeleteComment}
              onReport={handleReportComment}
            />
          </div>
        </div>

        {/* Comment Composer - Sticky at bottom */}
        <div className="sticky bottom-0">
          <CommentComposer
            postId={postId || 'post1'}
            onSubmit={handleAddComment}
            isLoading={isLoading}
          />
        </div>

        {/* Share Dialog */}
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          postId={postId || 'post1'}
          postUrl={postUrl}
          onShare={handleShare}
        />
      </div>
    </div>
  );
};