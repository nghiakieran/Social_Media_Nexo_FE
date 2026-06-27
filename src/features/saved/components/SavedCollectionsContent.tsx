import React, { useState } from 'react';
import { useAppSelector } from '../../../store';
import { CollectionCard } from './CollectionCard';
import { CreateCollectionDialog } from './CreateCollectionDialog';
import { SavedAllPostsContent } from './SavedAllPostsContent';
import { SavedCollectionDetailContent } from './SavedCollectionDetailContent';
import { Plus, Bookmark } from 'lucide-react';
import { Button } from '../../../components/ui/button';

type SavedView = 'collections' | 'all-posts' | 'collection-detail';

export const SavedCollectionsContent: React.FC = () => {
  const { collections } = useAppSelector((state) => state.saved);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<SavedView>('collections');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');

  const handleCollectionClick = (collectionId: string) => {
    if (collectionId === 'all-posts') {
      setCurrentView('all-posts');
    } else {
      setSelectedCollectionId(collectionId);
      setCurrentView('collection-detail');
    }
  };

  const handleViewCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    setCurrentView('collection-detail');
  };

  const handleBack = () => {
    setCurrentView('collections');
    setSelectedCollectionId('');
  };

  // Render different views based on currentView
  if (currentView === 'all-posts') {
    return <SavedAllPostsContent onBack={handleBack} />;
  }

  if (currentView === 'collection-detail') {
    return <SavedCollectionDetailContent collectionId={selectedCollectionId} onBack={handleBack} />;
  }

  return (
    <div className="px-4 py-4">
      {/* Create Collection Button */}
      <div className="mb-5">
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors text-foreground"
        >
          <Plus className="w-4 h-4" />
          Bộ sưu tập mới
        </button>
      </div>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            // Show "Tất cả bài viết" first like Instagram
            ...collections.filter(c => c.isDefault),
            ...collections.filter(c => !c.isDefault)
          ].map((collection) => (
            <CollectionCard 
              key={collection.id} 
              collection={collection} 
              onClick={handleCollectionClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Chưa có bộ sưu tập nào
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Tạo bộ sưu tập đầu tiên để tổ chức các bài viết đã lưu
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo bộ sưu tập
          </Button>
        </div>
      )}

      {/* Create Collection Dialog */}
      <CreateCollectionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onViewCollection={handleViewCollection}
      />
    </div>
  );
};
