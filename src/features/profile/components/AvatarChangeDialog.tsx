import { useRef, useState } from 'react';
import { Camera, X, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface AvatarChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onRemove: () => void;
  currentAvatar?: string;
  userName?: string;
}

export const AvatarChangeDialog = ({
  isOpen,
  onClose,
  onUpload,
  onRemove,
  currentAvatar,
  userName = 'User'
}: AvatarChangeDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng chọn file ảnh hợp lệ',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Lỗi',
          description: 'Kích thước file không được vượt quá 10MB',
          variant: 'destructive',
        });
        return;
      }

      onUpload(file);
      onClose();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveClick = () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemove = () => {
    onRemove();
    setShowRemoveConfirm(false);
    onClose();
    toast({
      title: 'Đã gỡ ảnh đại diện',
      description: 'Ảnh đại diện đã được gỡ bỏ',
    });
  };

  const cancelRemove = () => {
    setShowRemoveConfirm(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              Thay đổi ảnh đại diện
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Avatar Display */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleUploadClick}
                className="w-full gap-2"
                variant="default"
              >
                <Upload className="w-4 h-4" />
                Tải ảnh lên
              </Button>

              {currentAvatar && (
                <Button
                  onClick={handleRemoveClick}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <X className="w-4 h-4" />
                  Gỡ ảnh hiện tại
                </Button>
              )}

              <Button
                onClick={onClose}
                className="w-full"
                variant="ghost"
              >
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">
                Gỡ ảnh đại diện?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Bạn có chắc muốn gỡ ảnh đại diện hiện tại? Ảnh sẽ bị xóa khỏi hồ sơ của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={cancelRemove}
              className="flex-1"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemove}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Gỡ ảnh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

