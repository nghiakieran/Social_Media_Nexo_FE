import { useState, useRef, useEffect } from 'react';
import { X, Heart, MoreHorizontal, Smile, MessageCircle, Send, Bookmark, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { EmojiPicker } from '@/components/common/EmojiPicker';
import { ActionMenu } from '@/components/common/ActionMenu';

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
  emojiReactions?: Array<{
    emoji: string;
    count: number;
    isReacted: boolean;
  }>;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  media: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    alt?: string;
  }>;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  emojiReactions?: Array<{
    emoji: string;
    count: number;
    isReacted: boolean;
  }>;
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onLikeComment: (commentId: string) => void;
  onReplyComment: (commentId: string, content: string) => void;
  onLikePost: (postId: string) => void;
  onShare?: (postId: string, userIds: string[], message: string) => void;
  onOpenShareDialog?: () => void;
  isShareDialogOpen?: boolean;
  isPostLiked: boolean;
  onAddEmojiReaction?: (commentId: string, emoji: string) => void;
  onAddPostEmojiReaction?: (postId: string, emoji: string) => void;
}

export const CommentDialog = ({
  isOpen,
  onClose,
  post,
  comments,
  onAddComment,
  onLikeComment,
  onReplyComment,
  onLikePost,
  onShare,
  onOpenShareDialog,
  isShareDialogOpen = false,
  isPostLiked,
  onAddEmojiReaction,
  onAddPostEmojiReaction
}: CommentDialogProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const [currentCommentForEmoji, setCurrentCommentForEmoji] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const [currentCommentForAction, setCurrentCommentForAction] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if ShareDialog is open
      if (isShareDialogOpen) return;
      
      // Don't close if emoji picker is open
      if (showEmojiPicker) return;
      
      // Don't close if ActionMenu is open
      if (showActionMenu) return;
      
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isShareDialogOpen, showEmojiPicker, showActionMenu]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim() && replyingTo) {
      onReplyComment(replyingTo, replyContent.trim());
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleOpenShareDialog = () => {
    if (onOpenShareDialog) {
      onOpenShareDialog();
    }
  };

  const handleOpenEmojiPicker = (commentId: string | null, event: React.MouseEvent) => {
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
    setCurrentCommentForEmoji(commentId);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (currentCommentForEmoji && onAddEmojiReaction) {
      // Add emoji reaction to comment
      onAddEmojiReaction(currentCommentForEmoji, emoji);
    } else if (!currentCommentForEmoji && onAddPostEmojiReaction) {
      // Add emoji reaction to post
      onAddPostEmojiReaction(post.id, emoji);
    } else {
      // Add emoji to comment input
      if (replyingTo) {
        setReplyContent(prev => prev + emoji);
      } else {
        setNewComment(prev => prev + emoji);
      }
      
      // Focus back to textarea after adding emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Move cursor to end of text
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 100);
    }
    setShowEmojiPicker(false);
    setCurrentCommentForEmoji(null);
  };

  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
    setCurrentCommentForEmoji(null);
  };

  const handleOpenActionMenu = (commentId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Position at center of screen
    const position = {
      top: window.innerHeight / 2,
      left: window.innerWidth / 2
    };
    
    setActionMenuPosition(position);
    setCurrentCommentForAction(commentId);
    setShowActionMenu(true);
    
    // Prevent dialog from closing when ActionMenu is open
    event.stopPropagation();
  };

  const handleCloseActionMenu = () => {
    setShowActionMenu(false);
    setCurrentCommentForAction(null);
  };

  const handleCommentAction = (action: string) => {
    if (!currentCommentForAction) return;
    
    switch (action) {
      case 'report':
        // Handle report comment
        break;
      case 'delete':
        // Handle delete comment
        break;
      case 'edit':
        // Handle edit comment
        break;
      default:
        break;
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

  if (!isOpen) return null;

  // Mobile version - simple and clean
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[40] flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pt-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-lg">Comments</h1>
          <div className="w-8"></div>
        </div>

        {/* Post Content */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.userAvatar} alt={post.userName} />
              <AvatarFallback>{post.userName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{post.userName}</span>
              </div>
              <p className="text-sm leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => onLikePost(post.id)}
                  className={cn(
                    "text-sm hover:text-gray-600 transition-colors",
                    isPostLiked ? "text-red-500" : "text-gray-500"
                  )}
                >
                  {isPostLiked ? "Liked" : "Like"}
                </button>
                <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm leading-relaxed mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => onLikeComment(comment.id)}
                          className={cn(
                            "text-xs hover:text-gray-600 transition-colors",
                            comment.isLiked ? "text-red-500" : "text-gray-500"
                          )}
                        >
                          {comment.isLiked ? "Liked" : "Like"}
                        </button>
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Replies for mobile */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-11 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                            <AvatarFallback>{reply.userName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs">{reply.userName}</span>
                              <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                            </div>
                            <p className="text-xs leading-relaxed mb-2">{reply.content}</p>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => onLikeComment(reply.id)}
                                className={cn(
                                  "text-xs hover:text-gray-600 transition-colors",
                                  reply.isLiked ? "text-red-500" : "text-gray-500"
                                )}
                              >
                                {reply.isLiked ? "Liked" : "Like"}
                              </button>
                              <button
                                onClick={() => setReplyingTo(comment.id)}
                                className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comment Form */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pb-24">
            {replyingTo ? (
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Reply to comment</span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Add a reply..."
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 resize-none"
                  rows={2}
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        style={{ 
          maxHeight: '682px', 
          maxWidth: '1023px',
          width: '100%',
          height: '90vh'
        }}
      >
        {/* Left side - Post Image */}
        <div className="bg-black flex items-center justify-center relative" style={{ 
          aspectRatio: '1440 / 1920',
          flexBasis: '511.5px',
          minWidth: '511.5px'
        }}>
          {post.media.length > 0 && (
            <div className="relative w-full h-full">
              {post.media[0].type === 'image' ? (
                <img
                  src={post.media[0].url}
                  alt={post.media[0].alt || 'Post image'}
                  className="w-full h-full object-cover"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <video
                  src={post.media[0].url}
                  className="w-full h-full object-cover"
                  controls
                  muted
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Right side - Comments */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
          {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.userAvatar} alt={post.userName} />
                    <AvatarFallback>{post.userName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-semibold text-sm">{post.userName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenActionMenu('post', e);
                  }}
                  className="text-gray-500 hover:text-gray-600 transition-colors p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

          {/* Post Content */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.userAvatar} alt={post.userName} />
                  <AvatarFallback>{post.userName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{post.userName}</span>
                </div>
                <p className="text-sm leading-relaxed mb-2">{post.content}</p>
                
                {/* Post Emoji Reactions */}
                {post.emojiReactions && post.emojiReactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.emojiReactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(reaction.emoji)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-150 hover:scale-105",
                          reaction.isReacted 
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        )}
                      >
                        <span className="text-sm">{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto">
            <ul className="p-4 space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onLikeComment(comment.id)}
                        className={cn(
                          "text-xs hover:text-gray-600 transition-colors",
                          comment.isLiked ? "text-red-500" : "text-gray-500"
                        )}
                      >
                        {comment.isLiked ? "Đã thích" : "Thích"}
                      </button>
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
                      >
                        Trả lời
                      </button>
                      <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    
                    {/* Emoji Reactions */}
                    {comment.emojiReactions && comment.emojiReactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {comment.emojiReactions.map((reaction, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiSelect(reaction.emoji)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-150 hover:scale-105",
                              reaction.isReacted 
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            )}
                          >
                            <span className="text-sm">{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {(comment.likesCount > 0 || (comment.emojiReactions && comment.emojiReactions.some(r => r.count > 0))) && (
                      <div className="flex items-center gap-2 mt-2">
                        {comment.likesCount > 0 && (
                          <p className="text-xs text-gray-500">
                            {comment.likesCount} lượt thích
                          </p>
                        )}
                        {comment.emojiReactions && comment.emojiReactions.some(r => r.count > 0) && (
                          <div className="flex items-center gap-1">
                            {comment.emojiReactions
                              .filter(r => r.count > 0)
                              .slice(0, 3)
                              .map((reaction, index) => (
                                <span key={index} className="text-sm">{reaction.emoji}</span>
                              ))}
                            {comment.emojiReactions.filter(r => r.count > 0).length > 3 && (
                              <span className="text-xs text-gray-500">+{comment.emojiReactions.filter(r => r.count > 0).length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                                <AvatarFallback>{reply.userName?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-xs">{reply.userName}</span>
                                <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-xs leading-relaxed mb-2">{reply.content}</p>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => onLikeComment(reply.id)}
                                  className={cn(
                                    "text-xs hover:text-gray-600 transition-colors",
                                    reply.isLiked ? "text-red-500" : "text-gray-500"
                                  )}
                                >
                                  {reply.isLiked ? "Đã thích" : "Thích"}
                                </button>
                                <button
                                  onClick={() => setReplyingTo(comment.id)}
                                  className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
                                >
                                  Trả lời
                                </button>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => handleOpenActionMenu(reply.id, e)}
                              className="text-gray-500 hover:text-gray-600 transition-colors p-1"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleOpenActionMenu(comment.id, e)}
                    className="text-gray-500 hover:text-gray-600 transition-colors p-1"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Post Time */}
          <div className="px-4 py-2">
            <div className="text-xs text-gray-500">
              <time>{formatTimeAgo(post.createdAt)}</time>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => onLikePost(post.id)}
                className={cn(
                  "transition-colors",
                  isPostLiked ? "text-red-500" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Heart className={cn("w-6 h-6", isPostLiked && "fill-current")} />
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button 
                onClick={handleOpenShareDialog}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Send className="w-6 h-6" />
              </button>
              <div className="flex-1"></div>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>

            {/* Comment Form */}
            {replyingTo ? (
              <form onSubmit={handleSubmitReply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Trả lời</span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Hủy
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={(e) => handleOpenEmojiPicker(null, e)}
                    className="emoji-button text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <Textarea
                    ref={textareaRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Thêm trả lời..."
                    className="flex-1 min-h-[40px] resize-none border-0 focus:ring-0 focus:outline-none"
                    rows={1}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyContent.trim()}
                    className="px-4 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                    variant="ghost"
                  >
                    Gửi
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <button 
                  type="button"
                  onClick={(e) => handleOpenEmojiPicker(null, e)}
                  className="emoji-button text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Thêm bình luận..."
                  className="flex-1 min-h-[40px] resize-none border-0 focus:ring-0 focus:outline-none"
                  rows={1}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim()}
                  className="px-4 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                  variant="ghost"
                >
                  Gửi
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={handleCloseEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />

      {/* Action Menu */}
      <ActionMenu
        isOpen={showActionMenu}
        onClose={handleCloseActionMenu}
        position={actionMenuPosition}
        items={currentCommentForAction === 'post' ? [
          {
            label: 'Unfollow',
            action: () => handleCommentAction('unfollow')
          },
          {
            label: 'Add to favorites',
            action: () => handleCommentAction('favorite')
          },
          {
            label: 'Go to post',
            action: () => handleCommentAction('goToPost')
          },
          {
            label: 'Share to...',
            action: () => handleCommentAction('share')
          },
          {
            label: 'Copy link',
            action: () => handleCommentAction('copyLink')
          },
          {
            label: 'Embed',
            action: () => handleCommentAction('embed')
          },
          {
            label: 'About this account',
            action: () => handleCommentAction('aboutAccount')
          },
          {
            label: 'Cancel',
            action: handleCloseActionMenu
          }
        ] : [
          {
            label: 'Report',
            action: () => handleCommentAction('report'),
            isDestructive: true
          },
          {
            label: 'Cancel',
            action: handleCloseActionMenu
          }
        ]}
      />
    </div>
  );
};
