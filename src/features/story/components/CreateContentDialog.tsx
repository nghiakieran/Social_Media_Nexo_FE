import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Video, FileText, Film } from "lucide-react";
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

  const handleReelCreate = () => {
    onClose();
    navigate("/reels/create");
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
      <DialogContent className="max-w-[90vw] sm:max-w-md p-5 sm:p-6 border border-border/50 bg-card/95 backdrop-blur-md text-card-foreground shadow-2xl rounded-3xl gap-4">
        <DialogHeader className="pb-2 border-b border-border/30">
          <DialogTitle className="text-center text-lg sm:text-xl font-bold text-foreground">Tạo mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-1 py-1">
          {/* Create Post Option */}
          <button
            onClick={handlePostCreate}
            className={cn(
              "flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl",
              "hover:bg-muted/50 active:scale-[0.98] transition-all duration-200",
              "text-left group"
            )}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0 shadow-sm">
              <FileText className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-foreground">Bài viết</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Chia sẻ ảnh, video hoặc văn bản
              </p>
            </div>
          </button>

          {/* Create Story Option */}
          <button
            onClick={handleStoryCreate}
            className={cn(
              "flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl",
              "hover:bg-muted/50 active:scale-[0.98] transition-all duration-200",
              "text-left group"
            )}
          >
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-story shadow-md transition-shadow group-hover:shadow-lg flex-shrink-0">
              <ImageIcon className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-foreground">Tin</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Chia sẻ ảnh hoặc video (tối đa 60 giây) trong 24 giờ
              </p>
            </div>
          </button>

          {/* Create Reel Option */}
          <button
            onClick={handleReelCreate}
            className={cn(
              "flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl",
              "hover:bg-muted/50 active:scale-[0.98] transition-all duration-200",
              "text-left group"
            )}
          >
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary via-cyan-500 to-teal-600 shadow-md transition-shadow group-hover:shadow-lg flex-shrink-0">
              <Film className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-foreground">Reel</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Tạo video ngắn để chia sẻ với mọi người
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
