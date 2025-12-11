import React from 'react';
import { Link } from 'react-router-dom';
import { LazyImage } from '../../../components/common/LazyImage';
import { SavedPost } from '../types';
import { Play, RotateCcw } from 'lucide-react';

interface SavedPostCardProps {
  post: SavedPost;
}

export const SavedPostCard: React.FC<SavedPostCardProps> = ({ post }) => {
  const isVideo = post.post.media[0]?.type === 'video' || post.post.media[0]?.type === 'reel';
  const isCarousel = post.post.media.length > 1;

  return (
    <Link
      to={`/comments/${post.post.id}`}
      className="block group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
    >
      <LazyImage
        src={post.post.media[0]?.url || '/placeholder.svg'}
        alt={post.post.media[0]?.alt || post.post.content}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        enableProgressiveLoading={true}
      />
      
      {/* Video/Reel indicator */}
      {isVideo && (
        <div className="absolute top-2 right-2">
          <Play className="w-4 h-4 text-white fill-current drop-shadow-lg" />
        </div>
      )}
      
      {/* Carousel indicator */}
      {isCarousel && (
        <div className="absolute top-2 left-2">
          <RotateCcw className="w-4 h-4 text-white fill-current drop-shadow-lg" />
        </div>
      )}
      
      {/* Hover overlay with stats */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="font-semibold">{post.post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            <span className="font-semibold">{post.post.commentsCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};


