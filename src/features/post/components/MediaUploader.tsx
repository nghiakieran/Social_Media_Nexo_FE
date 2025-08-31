import { useState, useRef } from 'react';
import { Upload, Image, Video, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
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
  maxFiles = 10 
}: MediaUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
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
        await new Promise(resolve => setTimeout(resolve, 500));

        const mediaItem: MediaItem = {
          id: `media_${Date.now()}_${i}`,
          type: file.type.startsWith('image/') ? 'image' : 'video',
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
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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

        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Đang tải lên...</p>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              <p className="text-xs text-muted-foreground">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Hỗ trợ ảnh và video, tối đa {maxFiles} file, mỗi file ≤ 50MB
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  JPG, PNG, GIF
                </div>
                <div className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  MP4, MOV, AVI
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Existing Media Preview */}
      {existingMedia.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Media đã chọn ({existingMedia.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {existingMedia.map((item) => (
              <div key={item.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updatedMedia = existingMedia.filter(m => m.id !== item.id);
                    onUpload(updatedMedia);
                  }}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          Hủy
        </Button>
        <Button onClick={onClose} disabled={uploading}>
          Xong
        </Button>
      </div>
    </div>
  );
};
