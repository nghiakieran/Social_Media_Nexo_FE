import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Image, Play, Upload, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { MediaViewer } from "./MediaViewer";

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
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${
            dragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
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

        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-lg">
            {uploading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary/30 border-t-primary"></div>
            ) : (
              <Upload className="w-10 h-10 text-primary" />
            )}
          </div>

          {uploading ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold">Đang tải lên...</p>
              <Progress
                value={uploadProgress}
                className="w-full max-w-md mx-auto h-2"
              />
              <p className="text-sm text-muted-foreground">
                {Math.round(uploadProgress)}% hoàn thành
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-muted-foreground">
                  Hỗ trợ ảnh và video, tối đa {maxFiles} file, mỗi file ≤ 50MB
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                  <Image className="w-5 h-5" />
                  <span className="font-medium">JPG, PNG, GIF</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                  <Video className="w-5 h-5" />
                  <span className="font-medium">MP4, MOV, AVI</span>
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
            <p className="text-sm font-semibold text-foreground">
              Media đã chọn ({existingMedia.length})
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpload([])}
              className="text-xs text-muted-foreground hover:text-destructive"
              disabled={uploading}
            >
              Xóa tất cả
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {existingMedia.map((item) => (
              <div key={item.id} className="relative group">
                <div
                  className="aspect-square rounded-xl overflow-hidden bg-muted shadow-md cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt="Preview"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
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
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {item.type === "image" ? "📷" : "🎥"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={uploading}
          className="rounded-xl"
        >
          Hủy
        </Button>
        <Button
          onClick={onClose}
          disabled={uploading}
          className="rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
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
