import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Image, Upload, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { MediaViewer } from "./MediaViewer";
import { VideoThumbnail } from "@/components/common/VideoThumbnail";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  file: File;
}

interface MediaUploaderProps {
  onUpload: (media: MediaItem[]) => void;
  onClose: () => void;
  existingMedia: MediaItem[];
  maxFiles?: number;
}

export const MediaUploader = ({
  onUpload,
  onClose,
  existingMedia,
  maxFiles = 10,
}: MediaUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB

      if (!isImage && !isVideo) {
        toast({
          variant: "destructive",
          title: "File không hỗ trợ",
          description: `${file.name} không phải là file ảnh hoặc video.`,
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          variant: "destructive",
          title: "File quá lớn",
          description: `${file.name} vượt quá 50MB.`,
        });
        return false;
      }

      return true;
    });

    if (existingMedia.length + validFiles.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Quá nhiều file",
        description: `Chỉ có thể tải lên tối đa ${maxFiles} file.`,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const newMediaItems: MediaItem[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const progress = ((i + 1) / validFiles.length) * 100;
        setUploadProgress(progress);

        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mediaItem: MediaItem = {
          id: `media_${Date.now()}_${i}`,
          type: file.type.startsWith("image/") ? "image" : "video",
          url: URL.createObjectURL(file),
          file,
        };

        newMediaItems.push(mediaItem);
      }

      onUpload([...existingMedia, ...newMediaItems]);

      toast({
        title: "Tải lên thành công!",
        description: `Đã tải lên ${validFiles.length} file.`,
      });

      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi tải lên",
        description: "Có lỗi xảy ra khi tải file. Vui lòng thử lại.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center transition-all duration-300
          ${
            dragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border/50 hover:border-primary/50 hover:bg-muted/20"
          }
          ${uploading ? "pointer-events-none opacity-50" : "cursor-pointer"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-4 sm:space-y-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-lg">
            {uploading ? (
              <div className="h-7 w-7 sm:h-10 sm:w-10 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
            ) : (
              <Upload className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
            )}
          </div>

          {uploading ? (
            <div className="space-y-3">
              <p className="text-base sm:text-lg font-bold text-foreground">Đang tải lên...</p>
              <Progress
                value={uploadProgress}
                className="w-full max-w-xs sm:max-w-md mx-auto h-1.5 sm:h-2"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {Math.round(uploadProgress)}% hoàn thành
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <p className="text-sm sm:text-lg font-bold text-foreground leading-snug">
                  <span className="hidden sm:inline">Kéo thả file vào đây hoặc </span>
                  <span>Nhấp để chọn ảnh/video</span>
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tối đa {maxFiles} file, mỗi file ≤ 50MB
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/20">
                  <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="font-semibold text-foreground text-[10px] sm:text-xs">JPG, PNG, GIF</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/20">
                  <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="font-semibold text-foreground text-[10px] sm:text-xs">MP4, MOV, AVI</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Existing Media Preview */}
      {existingMedia.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-semibold text-foreground">
              Media đã chọn ({existingMedia.length})
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpload([])}
              className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
              disabled={uploading}
            >
              Xóa tất cả
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {existingMedia.map((item) => (
              <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border/50">
                <div
                  className="w-full h-full cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt="Preview"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <VideoThumbnail
                      videoUrl={item.url}
                      className="hover:scale-105 transition-transform duration-200"
                    />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedMedia = existingMedia.filter(
                      (m) => m.id !== item.id
                    );
                    onUpload(updatedMedia);
                  }}
                  className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full p-1 shadow-md z-10"
                  disabled={uploading}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {item.type === "image" ? "📷" : "🎥"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={uploading}
          className="rounded-xl h-9 text-xs sm:text-sm px-4"
        >
          Hủy
        </Button>
        <Button
          onClick={onClose}
          disabled={uploading}
          className="rounded-xl h-9 text-xs sm:text-sm px-5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-md hover:shadow-lg"
        >
          Xong
        </Button>
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
};
