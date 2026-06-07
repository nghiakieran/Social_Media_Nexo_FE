import React, { useState } from 'react';
import { useAppSelector } from '../../../store';
import { Button } from '../../../components/ui/button';
import { X, ArrowLeft, Check } from 'lucide-react';

interface CreateCollectionStep2Props {
  collectionName: string;
  onBack: () => void;
  onComplete: (selectedPostIds: string[]) => void;
  onClose: () => void;
}

export const CreateCollectionStep2: React.FC<CreateCollectionStep2Props> = ({
  collectionName,
  onBack,
  onComplete,
  onClose,
}) => {
  const { posts } = useAppSelector((state) => state.saved);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  const handlePostSelect = (postId: string) => {
    setSelectedPostIds(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleComplete = () => {
    onComplete(selectedPostIds);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Thêm từ mục Đã lưu</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square cursor-pointer group"
                  onClick={() => handlePostSelect(post.id)}
                >
                  {/* Post Image */}
                  <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                    {post.post.media[0] && (
                      <img
                        src={post.post.media[0].url}
                        alt={post.post.media[0].alt}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Selection Overlay */}
                  {selectedPostIds.includes(post.id) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có bài viết nào đã lưu</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            onClick={handleComplete}
            className="w-full"
          >
            Xong
          </Button>
        </div>
      </div>
    </div>
  );
};
