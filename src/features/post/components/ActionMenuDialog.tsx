import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ActionMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

export const ActionMenuDialog = ({
  isOpen,
  onClose,
  onAction,
}: ActionMenuDialogProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAction = (action: string) => {
    if (action === "delete") {
      setShowDeleteConfirm(true);
    } else {
      onAction(action);
      onClose();
    }
  };

  const handleDeleteConfirm = () => {
    onAction("delete");
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        {!showDeleteConfirm ? (
          // Main Action Menu
          <>
            <DialogTitle className="text-center">Tùy chọn bài viết</DialogTitle>
            <DialogDescription className="text-center">
              Chọn một tùy chọn cho bài viết này
            </DialogDescription>

            <div className="space-y-2 py-4">
              <Button
                variant="ghost"
                onClick={() => handleAction("delete")}
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 h-12"
              >
                Xóa
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAction("edit")}
                className="w-full justify-start h-12"
              >
                Chỉnh sửa
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAction("hideLikes")}
                className="w-full justify-start h-12"
              >
                Ẩn số lượt thích với những người khác
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAction("disableComments")}
                className="w-full justify-start h-12"
              >
                Tắt tính năng bình luận
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleAction("aboutAccount")}
                className="w-full justify-start h-12"
              >
                Giới thiệu về tài khoản này
              </Button>
            </div>
          </>
        ) : (
          // Delete Confirmation Dialog
          <>
            <DialogTitle className="text-center">Xóa bài viết?</DialogTitle>
            <DialogDescription className="text-center">
              Bạn có chắc chắn muốn xóa bài viết này không?
            </DialogDescription>

            <div className="flex gap-3 py-4">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                className="flex-1"
              >
                Xóa
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
