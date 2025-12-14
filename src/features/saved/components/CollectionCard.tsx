import React from 'react';
import { LazyImage } from '../../../components/common/LazyImage';
import { SavedCollection } from '../types';

interface CollectionCardProps {
  collection: SavedCollection;
  onClick: (collectionId: string) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onClick }) => {
  return (
    <button
      onClick={() => onClick(collection.id)}
      className="block group w-full text-left"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <LazyImage
          src={collection.coverImage || '/placeholder.svg'}
          alt={`${collection.name} collection`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          enableProgressiveLoading={true}
        />
        
        {/* Posts count overlay */}
        {collection.postsCount > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {collection.postsCount}
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-foreground transition-colors text-sm">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {collection.description}
          </p>
        )}
      </div>
    </button>
  );
};
