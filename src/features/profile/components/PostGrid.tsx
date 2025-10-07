import { useState, useMemo } from 'react';
import { Play, Heart, MessageCircle } from 'lucide-react';
import { ProfilePost } from '../profileSlice';
import { CommentDialog } from '@/features/post/components/CommentDialog';
import { ShareDialog } from '@/features/post/components/ShareDialog';
import { useAppSelector } from '@/store';
import { mockComments } from '@/features/interaction/__mocks__/comments';
import { useNavigate } from 'react-router-dom';
import { LazyGrid } from '@/components/common/LazyGrid';

interface PostGridProps {
  posts: ProfilePost[];
  onPostClick?: (post: ProfilePost) => void;
}

interface PostDetailProps {
  post: ProfilePost;
  onClose: () => void;
}

const PostDetail = ({ post, onClose }: PostDetailProps) => null;


export const PostGrid = ({ posts, onPostClick }: PostGridProps) => {
  const [selectedPost, setSelectedPost] = useState<ProfilePost | null>(null);
  const profile = useAppSelector((s) => s.profile.currentProfile);
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState<Record<string, boolean>>({});
  const [isBookmarkedById, setIsBookmarkedById] = useState<Record<string, boolean>>({});
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, CDComment[]>>({});

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

  const selectedComments = useMemo<CDComment[]>(() => {
    if (!selectedPost) return [];
    const mapReplies = (replies?: MockReply[]): CDComment[] | undefined => {
      if (!replies || replies.length === 0) return undefined;
      return replies.map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        avatarUrl: r.avatarUrl,
        content: r.content,
        likesCount: r.likesCount ?? 0,
        isLiked: r.isLiked ?? false,
        createdAt: r.createdAt,
      }));
    };
    return (mockComments as unknown as MockReply[])
      .filter((c) => c.postId === selectedPost.id)
      .map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.userName,
        avatarUrl: c.avatarUrl,
        content: c.content,
        likesCount: c.likesCount ?? 0,
        isLiked: c.isLiked ?? false,
        createdAt: c.createdAt,
        replies: mapReplies(c.replies),
      }));
  }, [selectedPost, mockComments]);

  const currentComments: CDComment[] = useMemo(() => {
    if (!selectedPost) return [];
    return commentsByPostId[selectedPost.id] ?? selectedComments;
  }, [commentsByPostId, selectedComments, selectedPost]);

  const ensureCommentsForSelected = () => {
    if (!selectedPost) return;
    setCommentsByPostId((prev) => prev[selectedPost.id] ? prev : ({ ...prev, [selectedPost.id]: selectedComments }));
  };

  const handlePostClick = (post: ProfilePost) => {
    setSelectedPost(post);
    onPostClick?.(post);
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-2 border-muted rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có bài viết</h3>
        <p className="text-muted-foreground text-center">
          Khi bạn chia sẻ ảnh và video, các bài viết sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <>
      <LazyGrid
        items={posts.map(post => ({
          id: post.id,
          thumbnail: post.thumbnail,
          type: post.type,
          caption: post.caption,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount
        }))}
        onItemClick={(item) => {
          const post = posts.find(p => p.id === item.id);
          if (post) handlePostClick(post);
        }}
        className="pb-4"
        columns={3}
        gap="md"
        enableProgressiveLoading={true}
        enableBlurToSharp={false}
        renderOverlay={(item, isVisible) => {
          if (!isVisible) return null;
          
          return (
            <>
              {/* Video/Reel indicator */}
              {(item.type === 'video' || item.type === 'reel') && (
                <div className="absolute top-2 right-2">
                  <Play className="w-4 h-4 text-white fill-current drop-shadow-lg" />
                </div>
              )}
              
              {/* Hover overlay with stats */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{item.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{item.commentsCount}</span>
                  </div>
                </div>
              </div>
            </>
          );
        }}
      />

      {selectedPost && (
        <CommentDialog
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={{
            id: selectedPost.id,
            userId: profile?.id || 'me',
            userName: profile?.username || 'me',
            avatarUrl: profile?.avatar || '',
            content: selectedPost.caption,
            media: [
              {
                id: 'media-1',
                type: selectedPost.type === 'photo' ? 'image' : 'video',
                url: selectedPost.url,
                alt: selectedPost.caption,
              },
            ],
            likesCount: selectedPost.likesCount,
            commentsCount: selectedPost.commentsCount,
            createdAt: selectedPost.createdAt,
          }}
          comments={currentComments}
          onAddComment={(content) => {
            if (!selectedPost) return;
            ensureCommentsForSelected();
            setCommentsByPostId((prev) => ({
              ...prev,
              [selectedPost.id]: [
                ...(
                  prev[selectedPost.id] ?? selectedComments
                ),
                {
                  id: `c-${Date.now()}`,
                  userId: profile?.id || 'me',
                  userName: profile?.username || 'me',
                  avatarUrl: profile?.avatar || '',
                  content,
                  likesCount: 0,
                  isLiked: false,
                  createdAt: new Date().toISOString(),
                }
              ]
            }));
          }}
          onLikeComment={(commentId) => {
            if (!selectedPost) return;
            ensureCommentsForSelected();
            setCommentsByPostId((prev) => ({
              ...prev,
              [selectedPost.id]: (prev[selectedPost.id] ?? selectedComments).map((c) =>
                c.id === commentId
                  ? { ...c, isLiked: !c.isLiked, likesCount: (c.likesCount || 0) + (c.isLiked ? -1 : 1) }
                  : {
                      ...c,
                      replies: c.replies?.map((r) =>
                        r.id === commentId
                          ? { ...r, isLiked: !r.isLiked, likesCount: (r.likesCount || 0) + (r.isLiked ? -1 : 1) }
                          : r
                      ),
                    }
              ),
            }));
          }}
          onReplyComment={(parentId, content) => {
            if (!selectedPost) return;
            ensureCommentsForSelected();
            setCommentsByPostId((prev) => ({
              ...prev,
              [selectedPost.id]: (prev[selectedPost.id] ?? selectedComments).map((c) =>
                c.id === parentId
                  ? {
                      ...c,
                      replies: [
                        ...(c.replies ?? []),
                        {
                          id: `r-${Date.now()}`,
                          userId: profile?.id || 'me',
                          userName: profile?.username || 'me',
                          avatarUrl: profile?.avatar || '',
                          content,
                          likesCount: 0,
                          isLiked: false,
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    }
                  : c
              ),
            }));
          }}
          onLikePost={(postId) => setIsPostLiked(prev => ({ ...prev, [postId]: !prev[postId] }))}
          isPostLiked={!!isPostLiked[selectedPost.id]}
          onOpenShareDialog={() => setIsShareOpen(true)}
          isShareDialogOpen={isShareOpen}
          // isBookmarked={!!isBookmarkedById[selectedPost.id]}
          // onToggleBookmark={(postId, next) => setIsBookmarkedById(prev => ({ ...prev, [postId]: next }))}
          actionMenuItems={[
            { label: 'Xóa', action: () => {} , isDestructive: true },
            { label: 'Chỉnh sửa', action: () => {} },
            { label: 'Ẩn số lượt thích với những người khác', action: () => {} },
            { label: 'Tắt tính năng bình luận', action: () => {} },
            { label: 'Đi đến bài viết', action: () => { navigate(`/comments/${selectedPost.id}`); } },
            { label: 'Giới thiệu về tài khoản này', action: () => {} },
            { label: 'Hủy', action: () => {} },
          ]}
        />
      )}

      {/* Share Dialog to match homepage behavior */}
      {selectedPost && (
        <ShareDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          post={{
            id: selectedPost.id,
            content: selectedPost.caption,
            media: [
              { url: selectedPost.url, type: selectedPost.type === 'photo' ? 'image' : 'video', alt: selectedPost.caption }
            ],
            userName: profile?.username || 'me',
            avatarUrl: profile?.avatar || '',
            createdAt: selectedPost.createdAt,
          }}
          onShare={(postId, userIds, message) => {
            // mock share success then close
            setIsShareOpen(false);
          }}
        />
      )}
    </>
  );
};