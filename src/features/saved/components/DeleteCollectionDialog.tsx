import React, { useState } from 'react';
import { useAppDispatch } from '../../../store';
import { deleteCollection } from '../savedSlice';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

interface DeleteCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  collectionName: string;
  onDeleted?: () => void;
}

export const DeleteCollectionDialog: React.FC<DeleteCollectionDialogProps> = ({
  isOpen,
  onClose,
  collectionId,
  collectionName,
  onDeleted,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      dispatch(deleteCollection(collectionId));
      onDeleted?.();
      onClose();
    } catch (error) {
      console.error('Error deleting collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[560px] mx-auto bg-background p-0 overflow-hidden">
        <DialogHeader className="relative border-b border-border p-3">
          <DialogTitle className="text-center text-base font-semibold">
            Xóa bộ sưu tập
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 p-3 pt-0">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Xóa "{collectionName}"?
            </h3>
            
            <p className="text-muted-foreground text-sm">
              Bộ sưu tập này sẽ bị xóa vĩnh viễn. Các bài viết trong bộ sưu tập sẽ được chuyển về "Tất cả bài viết".
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
