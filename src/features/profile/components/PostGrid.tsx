import { useState } from 'react';
import { Play, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { ProfilePost } from '../profileSlice';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PostGridProps {
  posts: ProfilePost[];
  onPostClick?: (post: ProfilePost) => void;
}

interface PostDetailProps {
  post: ProfilePost;
  onClose: () => void;
}

const PostDetail = ({ post, onClose }: PostDetailProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto bg-background">
      {/* Media */}
      <div className="relative bg-black flex items-center justify-center">
        {post.type === 'video' || post.type === 'reel' ? (
          <video
            src={post.url}
            controls
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted
          />
        ) : (
          <img
            src={post.url}
            alt="Post"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-instagram rounded-full" />
            <span className="font-semibold">nghialc81</span>
          </div>
          <button>
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Caption */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-instagram rounded-full flex-shrink-0" />
            <div>
              <span className="font-semibold">nghialc81</span>
              <span className="ml-2">{post.caption}</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0" />
            <div>
              <span className="font-semibold">nvaannhi</span>
              <span className="ml-2 text-sm">Anh Nghĩa đẹp trai</span>
              <div className="text-xs text-muted-foreground mt-1">228 tuần</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0" />
            <div>
              <span className="font-semibold">noinhiuey.2</span>
              <span className="ml-2 text-sm">Xàu thế</span>
              <div className="text-xs text-muted-foreground mt-1">230 tuần</div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0" />
            <div>
              <span className="font-semibold">th_hnaa</span>
              <span className="ml-2 text-sm">Mai đi học bơi nhaaaaaaaa</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>230 tuần</span>
                <span>1 lượt thích</span>
                <button className="hover:opacity-70">Trả lời</button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button className="hover:opacity-70 transition-opacity">
                <Heart className="w-6 h-6" />
              </button>
              <button className="hover:opacity-70 transition-opacity">
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-2">
            <div className="text-sm font-semibold">
              lt_n071 và 17 người khác đã thích
            </div>
            <div className="text-xs text-muted-foreground">30 Tháng 3 2021</div>
          </div>

          {/* Comment Input */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Bình luận..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              <button className="text-primary font-semibold text-sm">Đăng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PostGrid = ({ posts, onPostClick }: PostGridProps) => {
  const [selectedPost, setSelectedPost] = useState<ProfilePost | null>(null);

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
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {posts.map((post) => (
          <Dialog key={post.id}>
            <DialogTrigger asChild>
              <div
                className="relative aspect-square bg-muted cursor-pointer group overflow-hidden"
                onClick={() => handlePostClick(post)}
              >
                <img
                  src={post.thumbnail}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                
                {/* Video/Reel indicator */}
                {(post.type === 'video' || post.type === 'reel') && (
                  <div className="absolute top-2 right-2">
                    <Play className="w-4 h-4 text-white fill-current drop-shadow-lg" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <Heart className="w-5 h-5 fill-current" />
                      <span className="font-semibold">{post.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-5 h-5 fill-current" />
                      <span className="font-semibold">{post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-none w-full h-full p-0 bg-transparent border-none">
              {selectedPost && (
                <PostDetail 
                  post={selectedPost} 
                  onClose={() => setSelectedPost(null)} 
                />
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </>
  );
};