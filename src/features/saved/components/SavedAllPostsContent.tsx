import React from 'react';
import { useAppSelector } from '../../../store';
import { LazyGrid } from '../../../components/common/LazyGrid';
import { Bookmark } from 'lucide-react';

interface SavedAllPostsContentProps {
  onBack: () => void;
}

export const SavedAllPostsContent: React.FC<SavedAllPostsContentProps> = ({ onBack }) => {
  const { posts } = useAppSelector((state) => state.saved);
  
  const handlePostClick = (item: { id: string; thumbnail: string; type?: string; caption?: string; likesCount?: number; commentsCount?: number }) => {
    // Post click handled by Link in SavedPostCard
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"/>
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <Bookmark className="w-6 h-6 text-gray-900" />
          <h1 className="text-xl font-semibold text-gray-900">
            Tất cả bài viết
          </h1>
        </div>
      </div>

      {/* Content */}
      {posts.length > 0 ? (
        <LazyGrid
          items={posts.map(post => ({
            id: post.id,
            thumbnail: post.post.media[0]?.url || '/placeholder.svg',
            type: post.post.media[0]?.type === 'image' ? 'photo' : (post.post.media[0]?.type || 'photo'),
            caption: post.post.content,
            likesCount: post.post.likesCount,
            commentsCount: post.post.commentsCount
          }))}
          onItemClick={handlePostClick}
          className="pb-4"
          columns={3}
          gap="md"
          enableProgressiveLoading={true}
          enableBlurToSharp={false}
          renderOverlay={(item, isVisible) => {
            if (!isVisible) return null;
            
            const post = posts.find(p => p.id === item.id);
            if (!post) return null;
            
            const isVideo = post.post.media[0]?.type === 'video' || post.post.media[0]?.type === 'reel';
            const isCarousel = post.post.media.length > 1;
            
            return (
              <>
                {/* Video/Reel indicator */}
                {isVideo && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
                
                {/* Carousel indicator */}
                {isCarousel && (
                  <div className="absolute top-2 left-2">
                    <svg className="w-4 h-4 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
                
                {/* Hover overlay with stats */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="font-semibold">{item.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                      </svg>
                      <span className="font-semibold">{item.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </>
            );
          }}
        />
      ) : (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có bài viết nào được lưu
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu lưu các bài viết yêu thích để xem lại sau
          </p>
        </div>
      )}
    </div>
  );
};
