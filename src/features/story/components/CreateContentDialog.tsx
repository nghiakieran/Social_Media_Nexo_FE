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
import { useToast } from "@/hooks/use-toast";

interface CreateContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateContentDialog = ({
  isOpen,
  onClose,
}: CreateContentDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handlePostCreate = () => {
    onClose();
    navigate("/create");
  };

  // Validate video duration
  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      
      // Set timeout in case metadata never loads
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(video.src);
        toast({
          title: "Lỗi",
          description: "Không thể đọc thông tin video",
          variant: "destructive",
        });
        resolve(false);
      }, 10000); // 10 second timeout
      
      video.onloadedmetadata = () => {
        clearTimeout(timeoutId);
        const duration = video.duration;
        URL.revokeObjectURL(video.src);
        
        // Check if duration is valid
        if (isNaN(duration) || !isFinite(duration)) {
          toast({
            title: "Lỗi",
            description: "Không thể xác định độ dài video",
            variant: "destructive",
          });
          resolve(false);
          return;
        }
        
        // Max 60 seconds (1 minute)
        if (duration > 60) {
          toast({
            title: "Video quá dài",
            description: `Video story tối đa 60 giây (1 phút). Video của bạn dài ${Math.round(duration)} giây.`,
            variant: "destructive",
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      
      video.onerror = () => {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(video.src);
        toast({
          title: "Lỗi",
          description: "Không thể đọc video",
          variant: "destructive",
        });
        resolve(false);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleStoryCreate = async () => {
    // Trigger file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate video duration if it's a video
        if (file.type.startsWith("video/")) {
          const isValid = await validateVideoDuration(file);
          if (!isValid) {
            return; // Don't proceed if validation fails
          }
        }
        
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
                Chia sẻ ảnh hoặc video (tối đa 60 giây) trong 24 giờ
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
