import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Image, MapPin, Users, X } from "lucide-react";
import { useRef, useState } from "react";
import { MediaUploader } from "./MediaUploader";
import { MediaViewer } from "./MediaViewer";
import { PrivacySelect } from "./PrivacySelect";
import { VideoThumbnail } from "@/components/common/VideoThumbnail";
import { TagFriends } from "./TagFriends";
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
      const files = media.map(item => item.file);
      
      await onSubmit({
        content: content.trim(),
        media: files,
        privacy,
        taggedUsers: taggedFriends.map(f => f.id)
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
    <div className="w-full space-y-6">
      {/* Main Composer Card */}
      <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm w-full">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* User Avatar & Privacy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 p-0.5">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                        DU
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">Demo User</p>
                  <PrivacySelect
                    value={privacy}
                    onChange={setPrivacy}
                    className="w-auto h-auto p-1 pl-0 text-sm focus:outline-none focus:ring-0 focus:ring-offset-0"
                  />
                </div>
              </div>
            </div>

            {/* Content Input */}
            <div>
              <Textarea
                ref={textareaRef}
                placeholder="Bạn đang nghĩ gì?..."
                value={content}
                onChange={handleContentChange}
                className="resize-none text-base p-1 min-h-[120px] max-h-[300px] focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50"
              />
              <div className="text-right text-xs text-muted-foreground mt-1">
                {content.length}/2000
              </div>
            </div>

            {/* Tags and Mentions Display */}
            <div className="space-y-3">
              {/* Tagged Friends */}
              {taggedFriends.length > 0 && (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground flex-shrink-0">Gắn thẻ:</span>
                  <div className="flex flex-wrap gap-1">
                    {taggedFriends.map((friend) => (
                      <span key={friend.id} className="font-medium text-foreground">
                        {friend.username}
                        {taggedFriends.indexOf(friend) < taggedFriends.length - 1 && ","}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Media Preview */}
            {media.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">
                    Media đã chọn ({media.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMedia([])}
                    className="text-muted-foreground hover:text-accent-foreground"
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
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
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

            {/* Media Uploader */}
            {showMediaUploader && (
              <MediaUploader
                onUpload={setMedia}
                onClose={() => setShowMediaUploader(false)}
                existingMedia={media}
              />
            )}

            {/* Tag Friends */}
            {showTagFriends && (
              <TagFriends
                selectedFriends={taggedFriends.map(f => f.id)}
                onSelectionChange={(ids) => {
                  const selectedUsers = ids.map(id => {
                    const user = mutualFollowers.find(u => u.userId === id);
                    return {
                      id,
                      username: user?.userName || `user_${id}`
                    };
                  });
                  setTaggedFriends(selectedUsers);
                }}
                onClose={() => setShowTagFriends(false)}
              />
            )}
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

      {/* Action Bar */}
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaUploader(!showMediaUploader)}
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Image className="w-5 h-5" />
                <span className="hidden sm:inline">Ảnh/Video</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTagFriends(!showTagFriends)}
                className="gap-2 hover:bg-accent/10 hover:text-accent transition-colors"
              >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">Gắn thẻ</span>
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && media.length === 0)}
              className="px-8 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang đăng...
                </div>
              ) : (
                "Đăng bài"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
