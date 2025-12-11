import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { X } from 'lucide-react';

interface CreateCollectionStep1Props {
  onNext: (collectionName: string) => void;
  onClose: () => void;
}

export const CreateCollectionStep1: React.FC<CreateCollectionStep1Props> = ({
  onNext,
  onClose,
}) => {
  const [collectionName, setCollectionName] = useState('');

  const handleNext = () => {
    if (collectionName.trim()) {
      onNext(collectionName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="w-6" /> {/* Spacer for centering */}
          <h2 className="text-lg font-semibold">Bộ sưu tập mới</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Input
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Tên bộ sưu tập"
            className="w-full"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            onClick={handleNext}
            disabled={!collectionName.trim()}
            className="w-full"
          >
            Tiếp
          </Button>
        </div>
      </div>
    </div>
  );
};
