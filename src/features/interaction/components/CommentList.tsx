import { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Reply, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LikeButton } from './LikeButton';
import { useToast } from '@/hooks/use-toast';
import { formatTimeAgo } from '@/utils/timeFormat';

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  parentId?: string;
  replies?: Comment[];
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommentListProps {
  comments: Comment[];
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
}

export const CommentList = ({ 
  comments, 
  onLike, 
  onReply, 
  onDelete, 
  onReport 
}: CommentListProps) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();

  const handleReplySubmit = (parentId: string) => {
    if (!replyContent.trim()) return;
    
    onReply(parentId, replyContent.trim());
    setReplyContent('');
    setReplyingTo(null);
    
    toast({
      title: "Đã trả lời bình luận!",
      duration: 2000,
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div 
      key={comment.id} 
      className={`flex gap-3 ${isReply ? 'ml-8 mt-3' : 'mb-4'}`}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={comment.userAvatar} alt={comment.userName} />
        <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="bg-muted rounded-2xl px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{comment.content}</p>
        </div>
        
        <div className="flex items-center gap-4 px-2">
          <LikeButton
            isLiked={comment.isLiked}
            likesCount={comment.likesCount}
            onToggle={() => onLike(comment.id)}
            size="sm"
            showCount={false}
          />
          
          {comment.likesCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {comment.likesCount} lượt thích
            </span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setReplyingTo(comment.id)}
          >
            Trả lời
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onReport(comment.id)}>
                <Flag className="w-3 h-3 mr-2" />
                Báo cáo
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(comment.id)}
                className="text-destructive"
              >
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="flex gap-2 mt-2 ml-2">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src="https://picsum.photos/32/32?random=999" alt="You" />
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={`Trả lời ${comment.userName}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReplySubmit(comment.id);
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  Hủy
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleReplySubmit(comment.id)}
                  disabled={!replyContent.trim()}
                >
                  Trả lời
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {comments.map((comment) => renderComment(comment))}
      
      {comments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có bình luận nào.</p>
          <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
        </div>
      )}
    </div>
  );
};