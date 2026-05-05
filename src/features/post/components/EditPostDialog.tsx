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
import { getMediaType } from "@/utils/mediaUtils";

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
  const [uploadMessage, setUploadMessage] = useState<string>("");

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

    // Set upload message for large files
    if (newFiles.length > 0) {
      const hasVideo = newFiles.some((file) => file.type.startsWith("video/"));
      const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
      const sizeMB = totalSize / (1024 * 1024);

      if (hasVideo && sizeMB > 50) {
        setUploadMessage("📹 Đang cập nhật bài viết... Video lớn có thể mất vài phút");
      } else if (hasVideo || sizeMB > 10) {
        setUploadMessage("📤 Đang cập nhật bài viết... Vui lòng chờ");
      } else {
        setUploadMessage("⏳ Đang cập nhật bài viết...");
      }
    } else {
      setUploadMessage("⏳ Đang cập nhật bài viết...");
    }

    onSave(newFiles, updateData);
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

  // Reset upload state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setUploadMessage("");
    }
  }, [isOpen]);

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
                      {name}
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
                  className="gap-2 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
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
                      visibility ===
                        (initialVisibility.toLowerCase() as "public" | "private") &&
                      media.length === initialMediaUrl.length &&
                      taggedFriendIds.length === 0)
                  }
                  className="px-6"
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

      {/* Loading Overlay with Upload Message */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full"></div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-foreground">
                  {uploadMessage || "Đang cập nhật..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vui lòng không tắt trang này
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
