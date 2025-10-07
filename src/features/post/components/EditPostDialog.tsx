import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { UpdatePostRequest } from "../types";

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  userId: number;
  initialContent: string;
  initialVisibility: 'PUBLIC' | 'PRIVATE';
  initialMediaUrl: string[];
  onSave: (files: File[], updateData: UpdatePostRequest) => void;
}

export const EditPostDialog = ({
  isOpen,
  onClose,
  postId,
  userId,
  initialContent,
  initialVisibility,
  initialMediaUrl,
  onSave,
}: EditPostDialogProps) => {
  const [content, setContent] = useState(initialContent);
  const { toast } = useToast();

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Lỗi",
        description: "Nội dung bài viết không được để trống.",
        variant: "destructive",
      });
      return;
    }

    const updateData: UpdatePostRequest = {
      postId,
      userId,
      caption: content.trim(),
      visibility: initialVisibility,
      tag: "", // Can be enhanced later to support tag editing
      mediaUrl: initialMediaUrl, // Keep existing media URLs
    };

    // For now, pass empty files array since we're only editing text content
    // In the future, this could be enhanced to support media editing
    const files: File[] = [];

    onSave(files, updateData);
    toast({
      title: "Thành công",
      description: "Bài viết đã được cập nhật.",
    });
    onClose();
  };

  const handleClose = () => {
    setContent(initialContent); // Reset to original content
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
        <DialogDescription>
          Chỉnh sửa nội dung bài viết của bạn
        </DialogDescription>

        <div className="space-y-4 py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết gì đó..."
            className="min-h-[200px] max-h-[400px] resize-none text-base"
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={!content.trim() || content === initialContent}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
