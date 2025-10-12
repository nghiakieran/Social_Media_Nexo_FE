import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import type { UpdatePostRequest, MutualUser } from "../types";
import { Image, Users, X } from "lucide-react";
import { PrivacySelect } from "./PrivacySelect";
import { TagFriends } from "./TagFriends";
import { VideoThumbnail } from "@/components/common/VideoThumbnail";
import { MediaViewer } from "./MediaViewer";
import { HLSVideoPlayer } from "@/components/common/HLSVideoPlayer";
import { useAppSelector } from "@/store";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  file?: File; // Optional, only for new uploads
  isExisting: boolean; // Track if it's from existing mediaUrl or newly uploaded
}

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  userId: number;
  initialContent: string;
  initialVisibility: "PUBLIC" | "PRIVATE";
  initialMediaUrl: string[];
  onSave: (files: File[], updateData: UpdatePostRequest) => void;
}

// Helper to detect media type from URL
const getMediaType = (url: string): "image" | "video" => {
  const videoExtensions = [
    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".avi",
    ".mkv",
    ".m3u8",
    ".mpd",
    ".ts",
  ];
  const lowerUrl = url.toLowerCase();

  if (
    lowerUrl.includes(".m3u8") ||
    lowerUrl.includes(".mpd") ||
    lowerUrl.includes("m3u8")
  ) {
    return "video";
  }

  return videoExtensions.some((ext) => lowerUrl.includes(ext))
    ? "video"
    : "image";
};

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
  const [visibility, setVisibility] = useState<"public" | "private">(
    initialVisibility.toLowerCase() as "public" | "private"
  );
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [taggedFriendIds, setTaggedFriendIds] = useState<number[]>([]);
  const [showTagFriends, setShowTagFriends] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { mutualFollowers } = useAppSelector((state) => state.post);

  // Initialize form when dialog opens (only once when opening)
  useEffect(() => {
    if (isOpen) {
      // Set content and visibility
      setContent(initialContent);
      setVisibility(initialVisibility.toLowerCase() as "public" | "private");
      setTaggedFriendIds([]);
      setShowTagFriends(false);

      // Initialize media from initialMediaUrl (only on open)
      const existingMedia: MediaItem[] = initialMediaUrl.map((url, index) => ({
        id: `existing_${index}_${url}`,
        type: getMediaType(url),
        url,
        isExisting: true,
      }));
      setMedia(existingMedia);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen to prevent resetting media when user interacts

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newMediaItems: MediaItem[] = [];

    files.forEach((file, index) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB

      if (!isImage && !isVideo) {
        toast({
          variant: "destructive",
          title: "File không hỗ trợ",
          description: `${file.name} không phải là file ảnh hoặc video.`,
        });
        return;
      }

      if (!isValidSize) {
        toast({
          variant: "destructive",
          title: "File quá lớn",
          description: `${file.name} vượt quá 50MB.`,
        });
        return;
      }

      const mediaItem: MediaItem = {
        id: `new_${Date.now()}_${index}`,
        type: file.type.startsWith("image/") ? "image" : "video",
        url: URL.createObjectURL(file),
        file,
        isExisting: false,
      };

      newMediaItems.push(mediaItem);
    });

    if (media.length + newMediaItems.length > 10) {
      toast({
        variant: "destructive",
        title: "Quá nhiều file",
        description: "Chỉ có thể có tối đa 10 media.",
      });
      return;
    }

    setMedia((prev) => [...prev, ...newMediaItems]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Lỗi",
        description: "Nội dung bài viết không được để trống.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Get all new files (files that were uploaded, not existing URLs)
    const newFiles = media
      .filter((item) => !item.isExisting && item.file)
      .map((item) => item.file!);

    // Get remaining existing media URLs (URLs that weren't removed)
    const remainingExistingUrls = media
      .filter((item) => item.isExisting)
      .map((item) => item.url);

    // Prepare tag string (comma-separated user IDs)
    const tagString =
      taggedFriendIds.length > 0 ? taggedFriendIds.join(",") : "";

    const updateData: UpdatePostRequest = {
      postId,
      userId,
      caption: content.trim(),
      visibility: visibility.toUpperCase() as "PUBLIC" | "PRIVATE",
      tag: tagString,
      mediaUrl: remainingExistingUrls, // Only existing URLs that weren't removed
    };

    // Show upload message for large files
    if (newFiles.length > 0) {
      const hasVideo = newFiles.some((file) => file.type.startsWith("video/"));
      const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
      const sizeMB = totalSize / (1024 * 1024);

      if (hasVideo && sizeMB > 50) {
        toast({
          title: "Đang cập nhật bài viết...",
          description: "Video lớn có thể mất vài phút. Vui lòng đợi.",
          duration: 5000,
        });
      } else if (hasVideo || sizeMB > 10) {
        toast({
          title: "Đang cập nhật bài viết...",
          description: "Vui lòng đợi upload hoàn tất.",
          duration: 5000,
        });
      }
    }

    onSave(newFiles, updateData);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    // Clean up object URLs for newly uploaded files
    media.forEach((item) => {
      if (!item.isExisting && item.url) {
        URL.revokeObjectURL(item.url);
      }
    });

    setContent(initialContent);
    setMedia([]);
    setTaggedFriendIds([]);
    setShowTagFriends(false);
    onClose();
  };

  // Get tagged friend names for display
  const taggedFriendNames = mutualFollowers
    .filter((user) => taggedFriendIds.includes(user.userId))
    .map((user) => user.userName);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-2xl font-bold text-center">
            Chỉnh sửa bài viết
          </DialogTitle>
          <DialogDescription className="text-center">
            Cập nhật nội dung, media hoặc quyền riêng tư của bài viết
          </DialogDescription>

          <div className="space-y-6 py-4">
            {/* Privacy Selection */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quyền riêng tư:</span>
              <PrivacySelect
                value={visibility}
                onChange={(val) => setVisibility(val as "public" | "private")}
                className="w-auto"
              />
            </div>

            {/* Content Input */}
            <div>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Viết gì đó..."
                className="min-h-[150px] max-h-[300px] resize-none text-base focus-visible:ring-0 scrollbar-thin"
                maxLength={2000}
              />
              <div className="text-right text-xs text-muted-foreground mt-1">
                {content.length}/2000
              </div>
            </div>

            {/* Tagged Friends Display */}
            {taggedFriendNames.length > 0 && (
              <div className="flex items-center gap-2 text-sm p-3 bg-muted/30 rounded-lg">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Gắn thẻ:</span>
                <div className="flex flex-wrap gap-2">
                  {taggedFriendNames.map((name, idx) => (
                    <span
                      key={idx}
                      className="font-medium text-foreground px-2 py-1 bg-primary/10 rounded-full text-xs"
                    >
                      @{name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Media Preview */}
            {media.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">
                    Media ({media.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMedia([])}
                    className="text-muted-foreground"
                    disabled={isSubmitting}
                  >
                    Xóa tất cả
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {media.map((item) => (
                    <div key={item.id} className="relative group">
                      <div
                        className="aspect-square rounded-xl overflow-hidden bg-muted shadow-md cursor-pointer"
                        onClick={() => setSelectedMedia(item)}
                      >
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt="Media preview"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        ) : item.url.includes(".m3u8") ||
                          item.url.includes("index.m3u8") ? (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <VideoThumbnail
                              videoUrl={item.url}
                              className="w-full h-full"
                            />
                          </div>
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
                          removeMedia(item.id);
                        }}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {item.type === "image" ? "📷" : "🎥"}
                        {!item.isExisting && (
                          <span className="text-green-400">Mới</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Friends */}
            {showTagFriends && (
              <div className="border rounded-xl p-4 bg-muted/20">
                <TagFriends
                  selectedFriends={taggedFriendIds}
                  onSelectionChange={setTaggedFriendIds}
                  onClose={() => setShowTagFriends(false)}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 hover:bg-primary/10 hover:text-primary"
                  disabled={isSubmitting || media.length >= 10}
                >
                  <Image className="w-5 h-5" />
                  <span className="hidden sm:inline">Thêm media</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTagFriends(!showTagFriends)}
                  className="gap-2 hover:bg-accent/10 hover:text-accent"
                  disabled={isSubmitting}
                >
                  <Users className="w-5 h-5" />
                  <span className="hidden sm:inline">Gắn thẻ</span>
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    isSubmitting ||
                    !content.trim() ||
                    (content === initialContent &&
                      media.length === initialMediaUrl.length &&
                      taggedFriendIds.length === 0)
                  }
                  className="px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang lưu...
                    </div>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </>
  );
};
