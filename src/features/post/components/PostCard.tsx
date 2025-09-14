import { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CommentDialog } from './CommentDialog';
import { ShareDialog } from './ShareDialog';
import { EmojiPicker } from '@/components/common/EmojiPicker';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  media: MediaItem[];
  privacy: 'public' | 'friends' | 'private';
  taggedUsers: string[];
  hashtags: string[];
  location?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  violationScore?: number;
  violationType?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string) => void;
  onShare?: (postId: string, userIds: string[], message: string) => void;
  onOpenShareDialog?: () => void;
  isShareDialogOpen?: boolean;
  comments?: Comment[];
  onAddComment?: (postId: string, content: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyComment?: (commentId: string, content: string) => void;
}

export const PostCard = ({ 
  post, 
  onLike, 
  onBookmark, 
  onEdit, 
  onDelete, 
  onReport,
  onShare,
  onOpenShareDialog,
  isShareDialogOpen = false,
  comments = [],
  onAddComment,
  onLikeComment,
  onReplyComment
}: PostCardProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const { toast } = useToast();

  const privacyIcons = {
    public: Globe,
    friends: Users,
    private: Lock,
  };

  const PrivacyIcon = privacyIcons[post.privacy];

  const handleAction = (action: string, actionFn: (id: string) => void) => {
    actionFn(post.id);
    toast({
      title: `${action} thành công!`,
      duration: 2000,
    });
  };

  const handleCommentClick = () => {
    setShowCommentDialog(true);
  };

  const handleShareClick = () => {
    if (onOpenShareDialog) {
      onOpenShareDialog();
    }
  };

  const handleReactionToggle = (emoji: string) => {
    toast({
      title: `${emoji} Phản ứng!`,
      duration: 1500,
    });
  };

  const handleOpenEmojiPicker = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Position like Instagram - fixed position
    const position = {
      top: 350, // Fixed top position
      right: 310 // Fixed right position
    };
    
    setEmojiPickerPosition(position);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    setShowEmojiPicker(false);
    toast({
      title: `${emoji} Phản ứng!`,
      description: "Phản ứng của bạn đã được ghi nhận.",
    });
  };

  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const handleAddComment = (content: string) => {
    if (onAddComment) {
      onAddComment(post.id, content);
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };

  const handleReplyComment = (commentId: string, content: string) => {
    if (onReplyComment) {
      onReplyComment(commentId, content);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev < post.media.length - 1 ? prev + 1 : 0
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev > 0 ? prev - 1 : post.media.length - 1
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background border-border">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.userAvatar} alt={post.userName} />
              <AvatarFallback>{post.userName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{post.userName}</span>
              <PrivacyIcon className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(post.id)}>
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive">
                Xóa bài viết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReport(post.id)}>
                Báo cáo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        {post.content && (
          <div className="px-4 pb-3">
            <p className="text-sm leading-relaxed">
              {post.content.split(' ').map((word, index) => 
                word.startsWith('#') ? (
                  <span key={index} className="text-primary font-medium">
                    {word}{' '}
                  </span>
                ) : (
                  word + ' '
                )
              )}
            </p>
          </div>
        )}

        {/* Tagged Users */}
        {post.taggedUsers.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>với {post.taggedUsers.join(', ')}</span>
            </div>
          </div>
        )}

        {/* Location */}
        {post.location && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>tại {post.location}</span>
            </div>
          </div>
        )}

        {/* Media */}
        {post.media.length > 0 && (
          <div className="relative">
            {/* Violation Detection Ribbon */}
            {post.violationScore && post.violationScore > 0.7 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Nghi ngờ vi phạm
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nội dung này có thể vi phạm chính sách cộng đồng</p>
                    <p className="text-xs">Độ tin cậy: {Math.round((post.violationScore || 0) * 100)}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <div className="aspect-square bg-muted relative overflow-hidden">
              {post.media[currentMediaIndex].type === 'image' ? (
                <img
                  src={post.media[currentMediaIndex].url}
                  alt={post.media[currentMediaIndex].alt || 'Post media'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={post.media[currentMediaIndex].url}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              )}

              {/* Media Navigation */}
              {post.media.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white p-0"
                    onClick={prevMedia}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white p-0"
                    onClick={nextMedia}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Media Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {post.media.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentMediaIndex 
                            ? 'bg-white' 
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${post.isLiked ? 'text-red-500' : ''}`}
                onClick={() => handleAction('Like', onLike)}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={handleCommentClick}
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={handleShareClick}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${post.isBookmarked ? 'text-primary' : ''}`}
              onClick={() => handleAction('Bookmark', onBookmark)}
            >
              <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Likes Count */}
          {post.likesCount > 0 && (
            <div className="mb-2">
              <span className="font-semibold text-sm">
                {post.likesCount.toLocaleString()} lượt thích
              </span>
            </div>
          )}

          {/* Emoji Reaction Button */}
          <div className="mb-3 flex justify-center">
            <button
              onClick={handleOpenEmojiPicker}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
              title="Thêm phản ứng"
            >
              <Smile className="w-6 h-6" />
            </button>
          </div>

          {/* Comments Count */}
          {post.commentsCount > 0 && (
            <div className="mb-2">
              <button 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleCommentClick}
              >
                Xem tất cả {post.commentsCount} bình luận
              </button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Comment Dialog */}
      <CommentDialog
        isOpen={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        post={post}
        comments={comments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onReplyComment={handleReplyComment}
        onLikePost={onLike}
        onShare={onShare}
        isPostLiked={post.isLiked}
        onOpenShareDialog={onOpenShareDialog}
        isShareDialogOpen={isShareDialogOpen}
      />

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={handleCloseEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />
    </Card>
  );
};