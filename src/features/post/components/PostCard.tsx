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
  Smile,
  EyeOff,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarUrl, getAvatarInitials } from '@/utils/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CommentDialog } from './CommentDialog';
import { LazyImage } from '@/components/common/LazyImage';
import { HLSVideoPlayer } from '@/components/common/HLSVideoPlayer';
import { ShareDialog } from './ShareDialog';
import { EmojiPicker } from '@/components/common/EmojiPicker';
import { useToast } from '@/hooks/use-toast';
import { LikesDialog } from './LikesDialog';
import { ActionMenu } from '@/components/common/ActionMenu';
import { useBookmark } from '@/features/saved/hooks/useBookmark';
import { useNavigate } from 'react-router-dom';
import { navigateToPost, navigateToProfile } from '@/utils/navigation';
import { formatTimeAgoShort } from '@/utils/timeFormat';
import { useAppDispatch } from '@/store';
import { togglePostActiveThunk } from '../postSlice';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface TaggedUser {
  userId: number;
  userName: string;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  caption: string;
  media: MediaItem[];
  visibility: 'public' | 'private';
  taggedUsers: TaggedUser[];
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isActive: boolean;
  violationScore?: number;
  violationType?: string;
}

interface CommentType {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: CommentType[];
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string) => void;
  onShare?: (postId: string, userIds: string[], message: string) => void;
  onOpenShareDialog?: () => void;
  isShareDialogOpen?: boolean;
  comments?: CommentType[];
  onAddComment?: (postId: string, content: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyComment?: (commentId: string, content: string) => void;
  isOwnPost?: boolean; // Để biết có phải post của mình không
  isInProfilePage?: boolean; // Để biết có đang ở profile page không
}

export const PostCard = ({ 
  post, 
  onLike, 
  onEdit, 
  onDelete, 
  onReport,
  onShare,
  onOpenShareDialog,
  isShareDialogOpen = false,
  comments = [],
  onAddComment,
  onLikeComment,
  onReplyComment,
  isOwnPost = false,
  isInProfilePage = false
}: PostCardProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const { toast } = useToast();
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [inlineComment, setInlineComment] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Use bookmark hook
  const { isBookmarked, toggleBookmark } = useBookmark();

  const privacyIcons = {
    public: Globe,
    private: Lock,
  };

  const PrivacyIcon = privacyIcons[post.visibility] || Globe;

  const handleProfileClick = () => {
    navigateToProfile(navigate, post.userName);
  };

  const handleTagClick = (userName: string) => {
    navigateToProfile(navigate, userName);
  };

  const handleGoToPost = (postId: string) => {
    navigateToPost(navigate, postId);
  };

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

  const handleOpenLikesDialog = () => {
    setShowLikesDialog(true);
  };

  const handleCloseLikesDialog = () => {
    setShowLikesDialog(false);
  };

  const handleSubmitInlineComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineComment.trim()) return;
    if (onAddComment) {
      onAddComment(post.id, inlineComment.trim());
    }
    setInlineComment('');
  };

  const handleOpenActionMenu = () => {
    setActionMenuPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
    setShowActionMenu(true);
  };

  const handleCloseActionMenu = () => setShowActionMenu(false);

  const handlePostAction = async (action: string) => {
    switch (action) {
      case 'toggleHidePost':
        try {
          await dispatch(togglePostActiveThunk(parseInt(post.id))).unwrap();
          const isNowHidden = !post.isActive;
          toast({
            title: isNowHidden ? "Đã ẩn bài viết" : "Đã hiển thị bài viết",
            description: isNowHidden 
              ? "Bài viết sẽ không hiển thị trên trang cá nhân của bạn." 
              : "Bài viết đã được hiển thị lại trên trang cá nhân.",
          });
        } catch (error) {
          toast({
            title: "Lỗi",
            description: "Không thể thay đổi trạng thái bài viết.",
            variant: "destructive"
          });
        }
        break;
      case 'report':
        onReport(post.id);
        break;
      case 'goToPost':
        handleGoToPost(post.id);
        break;
      case 'share':
        if (onOpenShareDialog) onOpenShareDialog();
        break;
      case 'copyLink':
        navigator.clipboard?.writeText(window.location.href).catch(() => {});
        break;
      case 'embed':
        break;
      case 'aboutAccount':
        break;
      default:
        break;
    }
    handleCloseActionMenu();
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
            <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleProfileClick}>
              <AvatarImage src={getAvatarUrl(post.avatarUrl)} alt={post.userName} />
              <AvatarFallback>{getAvatarInitials(post.userName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="font-semibold text-foreground text-sm cursor-pointer hover:underline"
                  onClick={handleProfileClick}
                >
                  {post.userName}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatTimeAgoShort(post.updatedAt)}</span>
                <span>•</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PrivacyIcon className="w-3 h-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{post.visibility === 'public' ? 'Công khai' : 'Riêng tư'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleOpenActionMenu} aria-label="Lựa chọn khác">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {post.caption && (
          <div className="px-4 pb-3">
            <p className="text-sm leading-relaxed">
              {post.caption.split(' ').map((word, index) => 
                word.startsWith('#') ? (
                  <span key={index} className="text-primary font-medium">
                    {word}{' '}
                  </span>
                ) : (
                  word + ' '
                )
              )}
            </p>
            
            {/* Tagged Users */}
            {post.taggedUsers && post.taggedUsers.length > 0 && (
              <div className="mt-2 flex items-center gap-1 flex-wrap">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">với</span>
                {post.taggedUsers.map((tag, index) => (
                  <span key={index} className="text-xs">
                    <span 
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => handleTagClick(tag.userName)}
                    >
                      {tag.userName}
                    </span>
                    {index < post.taggedUsers.length - 1 && <span className="text-muted-foreground">, </span>}
                  </span>
                ))}
              </div>
            )}
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
                <LazyImage
                  src={post.media[currentMediaIndex].url}
                  alt={post.media[currentMediaIndex].alt || 'Post media'}
                  className="w-full h-full"
                  loading="lazy"
                  decoding="async"
                  enableProgressiveLoading
                />
              ) : (
                <HLSVideoPlayer
                  src={post.media[currentMediaIndex].url}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  playsInline
                  preload="metadata"
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                className={`h-9 w-9 inline-flex items-center justify-center select-none touch-manipulation transition-all duration-150 ${post.isLiked ? 'text-red-500' : 'text-foreground hover:opacity-80 active:opacity-60'}`}
                onClick={() => handleAction('Like', onLike)}
                aria-label="Thích bài viết"
                type="button"
              >
                <Heart className={`w-6 h-6 transition-transform ${post.isLiked ? 'fill-current scale-105' : ''}`} />
              </button>
              <button 
                className="h-9 w-9 inline-flex items-center justify-center select-none touch-manipulation text-foreground hover:opacity-80 active:opacity-60 transition-opacity"
                onClick={handleCommentClick}
                aria-label="Bình luận"
                type="button"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <button 
                className="h-9 w-9 inline-flex items-center justify-center select-none touch-manipulation text-foreground hover:opacity-80 active:opacity-60 transition-opacity"
                onClick={handleShareClick}
                aria-label="Chia sẻ"
                type="button"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button
              className={`h-9 w-9 inline-flex items-center justify-center select-none touch-manipulation transition-opacity ${isBookmarked(post.id) ? 'text-foreground' : 'text-foreground hover:opacity-80 active:opacity-60'}`}
              onClick={() => toggleBookmark(post.id)}
              aria-label="Lưu bài viết"
              type="button"
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked(post.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Likes summary like Instagram */}
          {post.likesCount > 0 && (
            <button type="button" onClick={handleOpenLikesDialog} className="mt-1 text-left text-sm w-full">
              <span className="font-medium hover:underline">
                {comments[0]?.userName || 'someone'}
              </span>
              <span className="text-gray-600 dark:text-gray-300"> và </span>
              <span className="font-medium hover:underline">những người khác</span>
              <span className="text-gray-600 dark:text-gray-300"> đã thích</span>
            </button>
          )}

          {/* Comments Count */}
          {post.commentsCount > 0 && (
            <div className="mb-2">
              <button 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleCommentClick}
              >
                Xem tất cả {post.commentsCount.toLocaleString('vi-VN')} bình luận
              </button>
            </div>
          )}

          {/* Comments Preview (latest 2) */}
          {comments && comments.length > 0 && (
            <ul className="mb-2 space-y-1">
              {comments.slice(-2).map((c) => (
                <li key={c.id} className="text-sm">
                  <button
                    type="button"
                    className="font-medium mr-2 hover:underline"
                    onClick={handleCommentClick}
                  >
                    {c.userName}
                  </button>
                  <span className="align-middle break-words">{c.content}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Inline comment input */}
          <form onSubmit={handleSubmitInlineComment} className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowEmojiPicker(true);
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Biểu tượng cảm xúc"
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              value={inlineComment}
              onChange={(e) => setInlineComment(e.target.value)}
              placeholder="Bình luận..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!inlineComment.trim()}
              className={`text-sm font-semibold ${inlineComment.trim() ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 cursor-default'}`}
            >
              Đăng
            </button>
          </form>
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
        isAuthorFollowed={false}
        onToggleFollowAuthor={(userId, next) => {}}
      />

      {/* Likes Dialog */}
      <LikesDialog
        isOpen={showLikesDialog}
        onClose={handleCloseLikesDialog}
        title="Lượt thích"
        infoText={undefined}
        users={(comments.slice(0, 10).map((c) => ({ id: c.id, name: c.userName, avatar: c.avatarUrl, subtitle: undefined, isVerified: false, isFollowing: false })))}
      />

      {/* Action Menu */}
      <ActionMenu
        isOpen={showActionMenu}
        onClose={handleCloseActionMenu}
        position={actionMenuPosition}
        items={[
          // Show "Hide/Show Post" only for own posts in profile page
          ...(isOwnPost && isInProfilePage ? [{
            label: post.isActive ? '🙈 Ẩn bài viết khỏi trang cá nhân' : '👁️ Hiển thị bài viết',
            action: () => handlePostAction('toggleHidePost')
          }] : []),
          { label: 'Báo cáo', action: () => handlePostAction('report'), isDestructive: true },
          { label: 'Đi đến bài viết', action: () => handlePostAction('goToPost') },
          { label: 'Chia sẻ lên...', action: () => handlePostAction('share') },
          { label: 'Sao chép liên kết', action: () => handlePostAction('copyLink') },
          { label: 'Nhúng', action: () => handlePostAction('embed') },
          { label: 'Giới thiệu về tài khoản này', action: () => handlePostAction('aboutAccount') },
          { label: 'Hủy', action: handleCloseActionMenu }
        ]}
      />

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={(emoji) => {
          setInlineComment((prev) => prev + emoji);
          setShowEmojiPicker(false);
        }}
        position={emojiPickerPosition}
      />
    </Card>
  );
};