import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Image, Users, X, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { MediaUploader } from "./MediaUploader";
import { MediaViewer } from "./MediaViewer";
import { PrivacySelect } from "./PrivacySelect";
import { VideoThumbnail } from "@/components/common/VideoThumbnail";
import { TagFriends } from "./TagFriends";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  file: File;
}

interface TaggedUser {
  id: number;
  username: string;
}

interface PostComposerProps {
  onSubmit: (data) => Promise<void>;
  isLoading?: boolean;
}

export const PostComposer = ({
  onSubmit,
  isLoading = false,
}: PostComposerProps) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">(
    "public"
  );
  const [taggedFriends, setTaggedFriends] = useState<TaggedUser[]>([]);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showTagFriends, setShowTagFriends] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { mutualFollowers } = useAppSelector((state) => state.post);

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập nội dung hoặc thêm media.",
      });
      return;
    }

    try {
      const files = media.map((item) => item.file);

      await onSubmit({
        content: content.trim(),
        media: files,
        privacy,
        taggedUsers: taggedFriends.map((f) => f.id),
      });

      // Reset form
      setContent("");
      setMedia([]);
      setTaggedFriends([]);
      setPrivacy("public");
    } catch (error) {
      console.error("Post submission error:", error);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full">
      {/* Main Unified Composer Card */}
      <Card className="border border-border/50 shadow-xl bg-card/80 backdrop-blur-sm w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
        <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* User Avatar & Privacy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-0.5">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-background"></div>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-base sm:text-lg text-foreground">Tạo bài viết</p>
                <PrivacySelect
                  value={privacy}
                  onChange={setPrivacy}
                  className="w-auto h-auto p-0 text-xs sm:text-sm focus:outline-none focus:ring-0 focus:ring-offset-0 bg-transparent text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Content Input */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Bạn đang nghĩ gì?..."
              value={content}
              onChange={handleContentChange}
              className="resize-none text-sm sm:text-base p-0 min-h-[100px] sm:min-h-[120px] max-h-[300px] border-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
            />
            <div className="text-right text-[10px] sm:text-xs text-muted-foreground mt-1 select-none">
              {content.length}/2000
            </div>
          </div>

          {/* Tags Display */}
          {taggedFriends.length > 0 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap bg-muted/30 p-2.5 sm:p-3 rounded-xl border border-border/30">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground flex-shrink-0 font-medium">
                Gắn thẻ:
              </span>
              <div className="flex flex-wrap gap-1">
                {taggedFriends.map((friend, idx) => (
                  <span
                    key={friend.id}
                    className="font-bold text-foreground text-xs sm:text-sm"
                  >
                    {friend.username}
                    {idx < taggedFriends.length - 1 && ","}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs sm:text-sm text-foreground">
                  Media đã chọn ({media.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMedia([])}
                  className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
                >
                  Xóa tất cả
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {media.map((item) => (
                  <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border/50">
                    <div
                      className="w-full h-full cursor-pointer"
                      onClick={() => setSelectedMedia(item)}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt="Upload preview"
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
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full p-1 transition-all duration-200 shadow-md z-10"
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

          {/* Media Uploader */}
          {showMediaUploader && (
            <div className="pt-2">
              <MediaUploader
                onUpload={setMedia}
                onClose={() => setShowMediaUploader(false)}
                existingMedia={media}
              />
            </div>
          )}

          {/* Tag Friends section inline inside Card */}
          {showTagFriends && (
            <div className="pt-2">
              <TagFriends
                selectedFriends={taggedFriends.map((f) => f.id)}
                onSelectionChange={(ids) => {
                  const selectedUsers = ids.map((id) => {
                    const user = mutualFollowers.find((u) => u.userId === id);
                    return {
                      id,
                      username: user?.userName || `user_${id}`,
                    };
                  });
                  setTaggedFriends(selectedUsers);
                }}
                onClose={() => setShowTagFriends(false)}
              />
            </div>
          )}

          <Separator className="bg-border/50" />

          {/* Integrated Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMediaUploader(!showMediaUploader);
                  setShowTagFriends(false);
                }}
                className={cn(
                  "gap-2 hover:bg-primary/10 hover:text-primary transition-colors px-2.5 sm:px-3 h-9 rounded-xl",
                  showMediaUploader && "bg-primary/10 text-primary"
                )}
              >
                <Image className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">Ảnh/Video</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTagFriends(!showTagFriends);
                  setShowMediaUploader(false);
                }}
                className={cn(
                  "gap-2 transition-colors hover:bg-primary/10 hover:text-primary px-2.5 sm:px-3 h-9 rounded-xl",
                  showTagFriends && "bg-primary/10 text-primary"
                )}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">Gắn thẻ</span>
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && media.length === 0)}
              className="rounded-xl px-5 sm:px-8 h-9 sm:h-10 text-xs sm:text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đăng...</span>
                </div>
              ) : (
                "Đăng bài"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
