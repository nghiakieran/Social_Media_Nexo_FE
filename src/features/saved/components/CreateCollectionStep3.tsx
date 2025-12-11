import React from 'react';
import { useAppSelector } from '../../../store';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';

interface CreateCollectionStep3Props {
  collectionId: string;
  onBack: () => void;
  onViewCollection: (collectionId: string) => void;
  onClose: () => void;
}

export const CreateCollectionStep3: React.FC<CreateCollectionStep3Props> = ({
  collectionId,
  onBack,
  onViewCollection,
  onClose,
}) => {
  const { collections } = useAppSelector((state) => state.saved);
  const collection = collections.find(c => c.id === collectionId);

  if (!collection) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">{collection.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Bộ sưu tập đã được tạo!
          </h3>
          
          <p className="text-gray-600 mb-6">
            Bộ sưu tập "{collection.name}" đã được tạo với {collection.postsCount} bài viết.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => onViewCollection(collectionId)}
              className="w-full"
            >
              Xem bộ sưu tập
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
