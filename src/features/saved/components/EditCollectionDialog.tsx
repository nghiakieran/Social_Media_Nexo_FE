import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../../store";
import { updateCollection } from "../savedSlice";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface EditCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  currentName: string;
}

export const EditCollectionDialog: React.FC<EditCollectionDialogProps> = ({
  isOpen,
  onClose,
  collectionId,
  currentName,
}) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim() === currentName) {
      onClose();
      return;
    }

    setIsLoading(true);

    try {
      dispatch(
        updateCollection({
          id: collectionId,
          updates: { name: name.trim() },
        })
      );
      onClose();
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(currentName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[560px] mx-auto bg-background p-0 overflow-hidden">
        <DialogHeader className="relative border-b border-border p-3">
          <DialogTitle className="text-center text-base font-semibold">
            Chỉnh sửa bộ sưu tập
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 p-3 pt-0">
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên bộ sưu tập"
              className="w-full"
              autoFocus
              maxLength={50}
            />
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
              type="submit"
              disabled={
                !name.trim() || name.trim() === currentName || isLoading
              }
              className="flex-1"
            >
              {isLoading ? "Đang lưu..." : "Xong"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
