import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Type,
  Sticker,
  Smile,
  Music,
  ArrowLeft,
  Download,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppSelector, useAppDispatch } from "@/store";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { StoryTextEditor } from "../components/StoryTextEditor";
import { EmojiPicker } from "@/components/common/EmojiPicker";
import { createStoryThunk } from "../storySlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const StoryCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { isUploading, uploadProgress } = useAppSelector((state) => state.story);

  const [file, setFile] = useState<File | null>(
    location.state?.file || null
  );
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isVideo, setIsVideo] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [isCloseFriend, setIsCloseFriend] = useState(false);
  const [textOverlays, setTextOverlays] = useState<Array<{
    id: number;
    text: string;
    style: {
      color: string;
      backgroundColor: string;
      size: string;
    };
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }>>([]);
  const [stickers, setStickers] = useState<Array<{
    id: number;
    type: string;
    content: string;
    x: number;
    y: number;
    size: number;
    scale: number;
    rotation: number;
  }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsVideo(file.type.startsWith("video/"));

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Draw image on canvas
  useEffect(() => {
    if (previewUrl && !isVideo && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Set canvas size to match viewport
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        const aspectRatio = width / height;
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = previewUrl;
    }
  }, [previewUrl, isVideo]);

  const handleClose = () => {
    navigate(-1);
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

  const handleFileSelect = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = async (e) => {
      const selectedFile = (e.target as HTMLInputElement).files?.[0];
      if (selectedFile) {
        // Validate video duration if it's a video
        if (selectedFile.type.startsWith("video/")) {
          const isValid = await validateVideoDuration(selectedFile);
          if (!isValid) {
            return; // Don't proceed if validation fails
          }
        }
        
        setFile(selectedFile);
      }
    };
    input.click();
  };

  const handleDownload = () => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name || "story-file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Đã tải xuống",
      description: "File đã được tải về máy",
    });
  };

  const handleAddText = (text: string, style: {
    color: string;
    backgroundColor: string;
    size: string;
  }) => {
    const newOverlay = {
      id: Date.now(),
      text,
      style,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setSelectedId(newOverlay.id);
  };

  const handleAddEmoji = (emoji: string) => {
    const newSticker = {
      id: Date.now(),
      type: "emoji",
      content: emoji,
      x: 50,
      y: 50,
      size: 60,
      scale: 1,
      rotation: 0,
    };
    setStickers([...stickers, newSticker]);
    setSelectedId(newSticker.id);
    setShowEmojiPicker(false);
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      setTextOverlays(textOverlays.filter((o) => o.id !== selectedId));
      setStickers(stickers.filter((s) => s.id !== selectedId));
      setSelectedId(null);
    }
  };

  // Keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        setTextOverlays((prev) => prev.filter((o) => o.id !== selectedId));
        setStickers((prev) => prev.filter((s) => s.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, setTextOverlays, setStickers]);

  // Compose final image with overlays
  const composeStoryImage = async (): Promise<Blob | null> => {
    try {
      // Create composition canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Get source image
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Draw text overlays
      textOverlays.forEach((overlay) => {
        ctx.save();

        // Position
        const x = (overlay.x / 100) * canvas.width;
        const y = (overlay.y / 100) * canvas.height;

        ctx.translate(x, y);
        ctx.scale(overlay.scale, overlay.scale);
        ctx.rotate((overlay.rotation * Math.PI) / 180);

        // Text style
        const fontSize = overlay.style.size === "small" ? 32 : overlay.style.size === "medium" ? 48 : 64;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = overlay.style.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Text shadow
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(overlay.text, 0, 0);
        ctx.restore();
      });

      // Draw stickers/emojis
      stickers.forEach((sticker) => {
        ctx.save();

        const x = (sticker.x / 100) * canvas.width;
        const y = (sticker.y / 100) * canvas.height;

        ctx.translate(x, y);
        ctx.scale(sticker.scale, sticker.scale);
        ctx.rotate((sticker.rotation * Math.PI) / 180);

        ctx.font = `${sticker.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(sticker.content, 0, 0);
        ctx.restore();
      });

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
      });
    } catch (error) {
      console.error("Error composing story:", error);
      return null;
    }
  };

  const handleShare = async () => {
    if (!file || !currentUser) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ảnh hoặc video",
        variant: "destructive",
      });
      return;
    }

    try {
      let finalFile = file;

      // If there are overlays, compose them into the image
      if (!isVideo && (textOverlays.length > 0 || stickers.length > 0)) {
        toast({
          title: "Đang xử lý...",
          description: "Đang tạo story của bạn",
        });

        const composedBlob = await composeStoryImage();
        if (composedBlob) {
          finalFile = new File([composedBlob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        }
      }

      // Call API to create story
      await dispatch(
        createStoryThunk({
          file: finalFile,
          storyData: {
            storyId: 0,
            userId: currentUser.id,
            isClosedFriend: isCloseFriend,
            isArchive: false,
          },
        })
      ).unwrap();

      toast({
        title: "Đã chia sẻ tin",
        description: "Tin của bạn đã được đăng thành công",
      });

      navigate(-1);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: "Lỗi",
        description: err.message || "Không thể tạo story",
        variant: "destructive",
      });
    }
  };

  if (!file) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <header className="border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Tạo tin</h1>
          <div className="w-9" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mb-6">
            <Download className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Chọn ảnh hoặc video</h2>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
            Chia sẻ khoảnh khắc của bạn với bạn bè trong 24 giờ
          </p>
          <Button onClick={handleFileSelect} size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Chọn file
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Preview Canvas */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center pb-[70px] pt-2">
        {isVideo ? (
          <video
            ref={videoRef}
            src={previewUrl}
            className="max-w-full max-h-full object-contain"
            controls
            autoPlay
            loop
            muted
          />
        ) : (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Text Overlays */}
        {textOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className={cn(
              "absolute cursor-move select-none",
              selectedId === overlay.id && "ring-2 ring-white/50 rounded-lg"
            )}
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
            }}
            draggable
            onClick={() => setSelectedId(overlay.id)}
            onDragStart={() => {
              setSelectedId(overlay.id);
              setShowDeleteZone(true);
            }}
            onDrag={(e) => {
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (rect && e.clientY > 0) {
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                // Show delete zone when near bottom
                setShowDeleteZone(y > 80);
              }
            }}
            onDragEnd={(e) => {
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (rect) {
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                // Delete if dragged outside or to delete zone
                if (x < 0 || x > 100 || y < 0 || y > 100 || y > 85) {
                  setTextOverlays(textOverlays.filter((o) => o.id !== overlay.id));
                  setSelectedId(null);
                } else {
                  setTextOverlays(
                    textOverlays.map((o) =>
                      o.id === overlay.id ? { ...o, x, y } : o
                    )
                  );
                }
              }
              setShowDeleteZone(false);
            }}
            onWheel={(e) => {
              if (selectedId === overlay.id) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setTextOverlays(
                  textOverlays.map((o) =>
                    o.id === overlay.id
                      ? { ...o, scale: Math.max(0.5, Math.min(3, o.scale + delta)) }
                      : o
                  )
                );
              }
            }}
          >
            <div
              className={cn(
                "px-4 py-2 font-bold text-center",
                overlay.style.size === "small" && "text-2xl",
                overlay.style.size === "medium" && "text-4xl",
                overlay.style.size === "large" && "text-6xl"
              )}
              style={{
                color: overlay.style.color,
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              {overlay.text}
            </div>
          </div>
        ))}

        {/* Stickers/Emojis */}
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            className={cn(
              "absolute cursor-move select-none",
              selectedId === sticker.id && "ring-2 ring-white/50 rounded-lg"
            )}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              fontSize: `${sticker.size}px`,
            }}
            draggable
            onClick={() => setSelectedId(sticker.id)}
            onDragStart={() => {
              setSelectedId(sticker.id);
              setShowDeleteZone(true);
            }}
            onDrag={(e) => {
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (rect && e.clientY > 0) {
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setShowDeleteZone(y > 80);
              }
            }}
            onDragEnd={(e) => {
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (rect) {
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                // Delete if dragged outside or to delete zone
                if (x < 0 || x > 100 || y < 0 || y > 100 || y > 85) {
                  setStickers(stickers.filter((s) => s.id !== sticker.id));
                  setSelectedId(null);
                } else {
                  setStickers(
                    stickers.map((s) =>
                      s.id === sticker.id ? { ...s, x, y } : s
                    )
                  );
                }
              }
              setShowDeleteZone(false);
            }}
            onWheel={(e) => {
              if (selectedId === sticker.id) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setStickers(
                  stickers.map((s) =>
                    s.id === sticker.id
                      ? { ...s, scale: Math.max(0.5, Math.min(3, s.scale + delta)) }
                      : s
                  )
                );
              }
            }}
          >
            {sticker.content}
          </div>
        ))}

        {/* Header with tools */}
        <header className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
          <TooltipProvider>
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleClose}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Đóng</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowTextEditor(true)}
                      className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                      <Type className="w-6 h-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Thêm văn bản</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 text-white hover:bg-white/20 rounded-full transition-colors opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <Sticker className="w-6 h-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Sticker (Sắp ra mắt)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                      <Smile className="w-6 h-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Thêm emoji</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 text-white hover:bg-white/20 rounded-full transition-colors opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <Music className="w-6 h-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Nhạc (Sắp ra mắt)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </header>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute top-20 right-4 z-20">
            <EmojiPicker
              isOpen={showEmojiPicker}
              onEmojiSelect={handleAddEmoji}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

        {/* Delete Zone */}
        {showDeleteZone && (
          <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-center">
            <div className="bg-red-500/90 backdrop-blur-sm px-8 py-4 rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-white font-semibold">Kéo vào đây để xóa</span>
            </div>
          </div>
        )}

        {/* Footer with share button */}
        <footer className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent -z-10" />
          <TooltipProvider>
            <div className="flex items-center justify-between p-4 pointer-events-auto">
              <button
                onClick={handleShare}
                disabled={isUploading}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-full",
                  "bg-white text-black hover:bg-gray-100 transition-colors",
                  "font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage
                    src={getAvatarUrl(currentUser?.avatar)}
                    alt={currentUser?.username || "User"}
                  />
                  <AvatarFallback>
                    {getAvatarInitials(
                      currentUser?.fullName || currentUser?.username || "U"
                    )}
                  </AvatarFallback>
                </Avatar>
                <span>{isUploading ? `Đang tải... ${uploadProgress}%` : "Chia sẻ tin"}</span>
              </button>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsCloseFriend(!isCloseFriend)}
                      disabled={isUploading}
                      className={cn(
                        "p-3 rounded-full transition-all disabled:opacity-50",
                        isCloseFriend
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-white/20 hover:bg-white/30 text-white"
                      )}
                    >
                      <Users className="w-6 h-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isCloseFriend ? "Bỏ chỉ bạn thân" : "Chỉ bạn thân"}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleDownload}
                      disabled={isUploading}
                      className="p-3 text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Tải xuống</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </footer>
      </div>

      {/* Text Editor Modal */}
      {showTextEditor && (
        <StoryTextEditor
          onClose={() => setShowTextEditor(false)}
          onSave={handleAddText}
        />
      )}
    </div>
  );
};
