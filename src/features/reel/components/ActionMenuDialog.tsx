import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface ActionMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  isOwnReel?: boolean;
  isReelHidden?: boolean; // isActive = false
}

export const ActionMenuDialog = ({
  isOpen,
  onClose,
  onAction,
  isOwnReel = true,
  isReelHidden = false,
}: ActionMenuDialogProps) => {
  const handleDeleteConfirm = () => {
    onAction("delete");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogTitle className="text-center">Xóa reel?</DialogTitle>
        <DialogDescription className="text-center">
          Bạn có chắc chắn muốn xóa reel này không?
        </DialogDescription>

        <div className="flex gap-3 py-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
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
      </DialogContent>
    </Dialog>
  );
};
