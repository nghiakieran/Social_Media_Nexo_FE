import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { PrivacySelect } from "@/features/post/components/PrivacySelect";
import { VideoThumbnail } from "@/components/common/VideoThumbnail";
import { MediaViewer } from "@/features/post/components/MediaViewer";

interface MediaItem {
  id: string;
  type: "video";
  url: string;
  file: File;
}

interface ReelComposerProps {
  onSubmit: (data) => Promise<void>;
  isLoading?: boolean;
}

export const ReelComposer = ({
  onSubmit,
  isLoading = false,
}: ReelComposerProps) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [dragActive, setDragActive] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim() && !media) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập nội dung hoặc chọn video.",
      });
      return;
    }

    if (!media) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn video cho reel.",
      });
      return;
    }

    try {
      await onSubmit({
        content: content.trim(),
        media: [media.file],
        privacy,
      });

      // Reset form
      setContent("");
      setMedia(null);
      setPrivacy("public");
    } catch (error) {
      console.error("Reel submission error:", error);
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

  const handleFiles = (files: File[]) => {
    const file = files[0]; // Only take first file
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn file video.",
      });
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 100MB.",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    const newMedia: MediaItem = {
      id: Date.now().toString(),
      type: "video",
      url,
      file,
    };

    setMedia(newMedia);
  };

  const removeMedia = () => {
    if (media) {
      URL.revokeObjectURL(media.url);
      setMedia(null);
    }
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
                        <Video className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">Tạo Reel</p>
                  <PrivacySelect
                    value={privacy}
                    onChange={(value) =>
                      setPrivacy(value as "public" | "private")
                    }
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
                maxLength={2000}
              />
              <div className="text-right text-xs text-muted-foreground mt-1">
                {content.length}/2000
              </div>
            </div>

            {/* Media Upload Area */}
            {!media ? (
              <div
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group
                  ${
                    dragActive
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Video
                  className={`mx-auto h-16 w-16 mb-4 transition-colors ${
                    dragActive
                      ? "text-primary"
                      : "text-muted-foreground/60 group-hover:text-muted-foreground"
                  }`}
                />
                <div className="space-y-3">
                  <p className="text-lg font-medium text-foreground">
                    {dragActive ? "Thả video vào đây" : "Chọn video cho reel"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chỉ hỗ trợ file video (MP4, MOV, AVI...) • Tối đa 100MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div
                  className="rounded-xl h-96 overflow-hidden bg-muted shadow-md cursor-pointer"
                  onClick={() => setSelectedMedia(media)}
                >
                  <VideoThumbnail
                    videoUrl={media.url}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeMedia}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end pt-4 border-t border-border/50">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || (!content.trim() && !media)}
                className="bg-primary hover:bg-primary/90 px-8"
              >
                {isLoading ? "Đang tạo..." : "Chia sẻ Reel"}
              </Button>
            </div>
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
