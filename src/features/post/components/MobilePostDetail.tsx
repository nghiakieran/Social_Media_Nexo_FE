import { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MediaSlider } from './MediaSlider';
import { formatTimeAgo } from '@/utils/timeFormat';
import { useBookmark } from '@/features/saved/hooks/useBookmark';
import { navigateToProfile } from '@/utils/navigation';
import { LikeButton } from '@/features/interaction/components/LikeButton';
import { useNavigate } from 'react-router-dom';
import { ActionMenu, ActionMenuItem } from '@/components/common/ActionMenu';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  caption: string;
  media: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
  }>;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isActive?: boolean;
}

interface MobilePostDetailProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onLikeComment: (commentId: string) => void;
  onReplyComment: (commentId: string, content: string) => void;
  onLikePost: (postId: string) => void;
  isPostLiked: boolean;
  actionMenuItems?: ActionMenuItem[];
  onNavigateToProfile?: (userName: string) => void;
  onNavigateToPost?: (postId: string) => void;
  onPostLikeChange?: (isLiked: boolean, newCount: number) => void;
}

export const MobilePostDetail = ({
  isOpen,
  onClose,
  post,
  comments,
  onAddComment,
  onLikeComment,
  onReplyComment,
  onLikePost,
  isPostLiked,
  actionMenuItems = [],
  onNavigateToProfile,
  onNavigateToPost,
  onPostLikeChange,
}: MobilePostDetailProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; userName: string } | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const [isPostLikedLocal, setIsPostLikedLocal] = useState(isPostLiked);
  const [postLikesCount, setPostLikesCount] = useState(post.likesCount || 0);
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const navigate = useNavigate();

  // Sync post like state when prop changes
  useEffect(() => {
    setIsPostLikedLocal(isPostLiked);
    setPostLikesCount(post.likesCount || 0);
  }, [isPostLiked, post.likesCount]);

  const handlePostLikeChange = (newIsLiked: boolean, newCount: number) => {
    setIsPostLikedLocal(newIsLiked);
    setPostLikesCount(newCount);
    onLikePost(post.id);
    onPostLikeChange?.(newIsLiked, newCount);
  };

  // Close on back button (mobile)
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  const handleProfileClick = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile(post.userName);
    } else {
      navigateToProfile(navigate, post.userName);
    }
    onClose();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    if (replyingTo) {
      onReplyComment(replyingTo.id, newComment.trim());
      setReplyingTo(null);
    } else {
      onAddComment(newComment.trim());
    }
    
    setNewComment('');
  };

  const handleOpenActionMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setActionMenuPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
    setShowActionMenu(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-base font-semibold">Bài viết</h2>
          <div className="w-8" /> {/* Spacer for balance */}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Post Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar 
              className="w-10 h-10 cursor-pointer" 
              onClick={handleProfileClick}
            >
              <AvatarImage src={post.avatarUrl} alt={post.userName} />
              <AvatarFallback>{post.userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p 
                className="font-semibold text-sm cursor-pointer hover:underline truncate"
                onClick={handleProfileClick}
              >
                {post.userName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenActionMenu}
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="w-full">
            <MediaSlider
              media={post.media.map((m) => ({
                id: m.id,
                type: m.type,
                url: m.url,
                alt: `Post media ${m.id}`,
              }))}
              className="w-full"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <LikeButton
                targetId={parseInt(post.id)}
                targetType="post"
                isLiked={isPostLikedLocal}
                likesCount={postLikesCount}
                size="md"
                showCount={false}
                onLikeChange={handlePostLikeChange}
                className="touch-manipulation h-7 w-7 p-0"
              />
              <button className="touch-manipulation">
                <MessageCircle className="w-7 h-7 text-foreground" />
              </button>
              <button className="touch-manipulation">
                <Send className="w-7 h-7 text-foreground" />
              </button>
            </div>
            <button
              onClick={() => toggleBookmark(post.id)}
              className="touch-manipulation"
            >
              <Bookmark
                className={cn(
                  "w-7 h-7 transition-colors",
                  isBookmarked(post.id) ? "fill-foreground text-foreground" : "text-foreground"
                )}
              />
            </button>
          </div>

          {/* Likes Count */}
          {postLikesCount > 0 && (
            <p className="font-semibold text-sm mb-2">
              {postLikesCount.toLocaleString('vi-VN')} lượt thích
            </p>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="text-sm mb-2">
              <span 
                className="font-semibold mr-2 cursor-pointer hover:underline"
                onClick={handleProfileClick}
              >
                {post.userName}
              </span>
              <span className="whitespace-pre-wrap">{post.caption}</span>
            </div>
          )}

          {/* Time */}
          <p className="text-xs text-muted-foreground uppercase">
            {formatTimeAgo(post.createdAt)}
          </p>
        </div>

        {/* Comments Section */}
        <div className="px-4 py-3 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Chưa có bình luận nào</p>
              <p className="text-muted-foreground text-xs mt-1">Hãy là người đầu tiên bình luận</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.avatarUrl} alt={comment.userName} />
                    <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted/30 rounded-2xl px-3 py-2">
                      <p className="font-semibold text-sm">{comment.userName}</p>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 px-3">
                      <LikeButton
                        targetId={parseInt(comment.id)}
                        targetType="comment"
                        isLiked={comment.isLiked}
                        likesCount={comment.likesCount}
                        size="sm"
                        showCount={false}
                        onLikeChange={() => onLikeComment(comment.id)}
                        className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {comment.isLiked ? (
                          <span className="font-semibold text-primary">Đã thích</span>
                        ) : (
                          'Thích'
                        )}
                      </LikeButton>
                      <button
                        onClick={() => setReplyingTo({ id: comment.id, userName: comment.userName })}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Trả lời
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                      {comment.likesCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {comment.likesCount} lượt thích
                        </span>
                      )}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-3 ml-4 border-l-2 border-muted pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <Avatar className="w-7 h-7 flex-shrink-0">
                              <AvatarImage src={reply.avatarUrl} alt={reply.userName} />
                              <AvatarFallback>{reply.userName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-muted/30 rounded-2xl px-3 py-2">
                                <p className="font-semibold text-sm">{reply.userName}</p>
                                <p className="text-sm break-words">{reply.content}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-1 px-3">
                                <LikeButton
                                  targetId={parseInt(reply.id)}
                                  targetType="comment"
                                  isLiked={reply.isLiked}
                                  likesCount={reply.likesCount}
                                  size="sm"
                                  showCount={false}
                                  onLikeChange={() => onLikeComment(reply.id)}
                                  className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  {reply.isLiked ? (
                                    <span className="font-semibold text-primary">Đã thích</span>
                                  ) : (
                                    'Thích'
                                  )}
                                </LikeButton>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(reply.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment Input - Fixed at bottom */}
      <div className="sticky bottom-0 bg-background border-t border-border">
        {replyingTo && (
          <div className="px-4 py-2 bg-muted/30 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trả lời <span className="font-semibold text-foreground">@{replyingTo.userName}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2 p-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={post.avatarUrl} alt="Your avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-end gap-2">
            <Textarea
              placeholder={replyingTo ? `Trả lời @${replyingTo.userName}...` : "Thêm bình luận..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[40px] max-h-[120px] resize-none text-sm rounded-full px-4 py-2 border-muted"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              variant="ghost"
              size="sm"
              className="h-10 text-primary font-semibold disabled:opacity-30"
            >
              Đăng
            </Button>
          </div>
        </div>
      </div>

      {/* Action Menu */}
      <ActionMenu
        isOpen={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        position={actionMenuPosition}
        items={actionMenuItems}
      />
    </div>
  );
};

