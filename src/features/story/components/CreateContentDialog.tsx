import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Video, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CreateContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateContentDialog = ({
  isOpen,
  onClose,
}: CreateContentDialogProps) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handlePostCreate = () => {
    onClose();
    navigate("/create");
  };

  const handleStoryCreate = () => {
    // Trigger file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        onClose();
        // Navigate to story create with file
        navigate("/stories/create", { state: { file } });
      }
    };
    input.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">Tạo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {/* Create Post Option */}
          <button
            onClick={handlePostCreate}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl",
              "hover:bg-muted/50 transition-all duration-200",
              "text-left group"
            )}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">Bài viết</h3>
              <p className="text-sm text-muted-foreground">
                Chia sẻ ảnh, video hoặc văn bản
              </p>
            </div>
          </button>

          {/* Create Story Option */}
          <button
            onClick={handleStoryCreate}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl",
              "hover:bg-muted/50 transition-all duration-200",
              "text-left group"
            )}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <ImageIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">Tin</h3>
              <p className="text-sm text-muted-foreground">
                Chia sẻ ảnh hoặc video trong 24 giờ
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
