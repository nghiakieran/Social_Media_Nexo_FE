import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Loader2,
  Maximize2,
  Pause,
  Play,
  Share2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HLSVideoPlayer } from "@/components/common/HLSVideoPlayer";
// Utility functions for video optimization
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getLoadingMessage = (fileSizeBytes: number): string => {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  if (fileSizeMB > 100) {
    return "Video lớn đang được tải... Có thể mất vài phút";
  } else if (fileSizeMB > 50) {
    return "Video đang được tải... Vui lòng chờ";
  } else {
    return "Đang tải video...";
  }
};

// Fullscreen API types for cross-browser compatibility
interface FullscreenElement extends Element {
  webkitRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  msRequestFullscreen?: () => void;
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => void;
  mozCancelFullScreen?: () => void;
  msExitFullscreen?: () => void;
}

interface MediaViewerProps {
  media: {
    id: string;
    type: "image" | "video";
    url: string;
    file?: File;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const MediaViewer = ({ media, isOpen, onClose }: MediaViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const [videoQuality, setVideoQuality] = useState<
    "auto" | "low" | "medium" | "high"
  >("auto");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen && media.type === "video") {
      setIsVideoLoading(true);
      setIsVideoPlaying(false);
      setIsVideoLoaded(false);
      setVideoProgress(0);
      setCurrentTime(0);
      setBufferedProgress(0);
    }
  }, [isOpen, media.type]);

  // Auto-play when modal opens
  useEffect(() => {
    if (isOpen && media.type === "video" && videoRef.current) {
      const video = videoRef.current;

      // ✅ Check if video is already ready
      if (video.readyState >= 2) {
        // HAVE_CURRENT_DATA
        setIsVideoLoading(false);
        setIsVideoLoaded(true);
        setBufferedProgress(100);
        video.play().catch(() => {});
      }

      // ✅ Fallback: Hide loading after 3 seconds regardless
      const fallbackTimer = setTimeout(() => {
        setIsVideoLoading(false);
        setIsVideoLoaded(true);
        setBufferedProgress(100);
      }, 3000);

      const handleLoadedData = () => {
        clearTimeout(fallbackTimer); // Clear fallback timer
        setIsVideoLoading(false);
        setIsVideoLoaded(true);

        // ✅ Set duration if valid
        if (
          video.duration &&
          !isNaN(video.duration) &&
          isFinite(video.duration)
        ) {
          setVideoDuration(video.duration);
        }

        // ✅ Mark as fully buffered if we can play (fix for local videos)
        setBufferedProgress(100);

        // Auto-play after loading
        video
          .play()
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch(() => {
            setIsVideoPlaying(false);
          });
      };

      const handleTimeUpdate = () => {
        if (video.duration && !isNaN(video.duration) && video.duration > 0) {
          const currentTime = video.currentTime || 0;
          if (!isNaN(currentTime) && isFinite(currentTime)) {
            setVideoProgress((currentTime / video.duration) * 100);
            setCurrentTime(currentTime);
          }
        }
      };

      const handleProgress = () => {
        if (video.buffered.length > 0 && video.duration) {
          try {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            setBufferedProgress((bufferedEnd / video.duration) * 100);
          } catch (e) {
            // Fallback: if we can't read buffer, assume it's loaded
            setBufferedProgress(100);
          }
        }
      };

      const handleWaiting = () => {
        setIsVideoLoading(true);
      };

      const handleCanPlay = () => {
        clearTimeout(fallbackTimer); // Clear fallback timer
        setIsVideoLoading(false);
        setIsVideoLoaded(true);
        // ✅ Also mark as fully buffered when video can play
        setBufferedProgress(100);
      };

      const handleCanPlayThrough = () => {
        // Video can play through without buffering
        setIsVideoLoading(false);
        setIsVideoLoaded(true);
        setBufferedProgress(100);
      };

      const handleLoadedMetadata = () => {
        if (
          video.duration &&
          !isNaN(video.duration) &&
          isFinite(video.duration)
        ) {
          setVideoDuration(video.duration);
        }
      };

      const handlePlay = () => setIsVideoPlaying(true);
      const handlePause = () => setIsVideoPlaying(false);

      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("progress", handleProgress);
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("canplaythrough", handleCanPlayThrough);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        clearTimeout(fallbackTimer); // Clear fallback timer on cleanup
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("progress", handleProgress);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("canplaythrough", handleCanPlayThrough);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }
  }, [isOpen, media.type]);

  const handleVideoPlayPause = () => {
    if (videoRef.current) {
      // Show play/pause icon animation
      setShowPlayPauseIcon(true);
      setTimeout(() => setShowPlayPauseIcon(false), 1000);

      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsVideoPlaying(true);
      }
    }
  };

  const handleVideoMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      const video = videoRef.current as FullscreenElement;
      const doc = document as FullscreenDocument;

      if (!document.fullscreenElement) {
        // Try to enter fullscreen
        if (video.requestFullscreen) {
          video
            .requestFullscreen()
            .then(() => {
              setIsFullscreen(true);
            })
            .catch(() => {});
        } else if (video.webkitRequestFullscreen) {
          // Safari
          video.webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if (video.mozRequestFullScreen) {
          // Firefox
          video.mozRequestFullScreen();
          setIsFullscreen(true);
        } else if (video.msRequestFullscreen) {
          // IE/Edge
          video.msRequestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document
            .exitFullscreen()
            .then(() => {
              setIsFullscreen(false);
            })
            .catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
          setIsFullscreen(false);
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
          setIsFullscreen(false);
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
          setIsFullscreen(false);
        }
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && videoDuration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * videoDuration;

      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) {
      return "0:00";
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = media.url;
    link.download = media.file?.name || `media_${media.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share && media.file) {
      try {
        await navigator.share({
          title: "Media từ Social Media Nexo",
          text: "Xem media này",
          files: [media.file],
        });
      } catch (error) {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(media.url);
          // You could show a toast here
        } catch (error) {
          // Handle clipboard error
        }
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(media.url);
        // You could show a toast here
      } catch (error) {
        // Handle clipboard error
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black border-0">
        <DialogTitle className="sr-only">
          {media.type === "image" ? "Xem ảnh" : "Xem video"} -{" "}
          {media.file?.name || "Media"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {media.type === "image"
            ? `Ảnh ${media.file?.name || "Media"}${
                media.file
                  ? ` với kích thước ${formatFileSize(media.file.size)}`
                  : ""
              }`
            : `Video ${media.file?.name || "Media"}${
                media.file
                  ? ` với kích thước ${formatFileSize(media.file.size)}`
                  : ""
              } và thời lượng ${formatTime(videoDuration)}`}
        </DialogDescription>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full h-10 w-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Media Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: "calc(90vh - 80px)" }}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Loading State - only show when actually loading */}
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="text-center max-w-sm">
                      <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                      <p className="text-white text-lg mb-2">
                        {media.file
                          ? getLoadingMessage(media.file.size)
                          : "Đang tải video..."}
                      </p>
                      <p className="text-gray-300 text-sm mb-3">
                        {media.file && formatFileSize(media.file.size)} • Chất
                        lượng: {videoQuality}
                      </p>
                      {bufferedProgress > 0 && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className="h-2 rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${bufferedProgress}%` }}
                          />
                        </div>
                      )}
                      <p className="text-gray-400 text-xs">
                        {isVideoLoaded
                          ? bufferedProgress < 100
                            ? `${Math.round(bufferedProgress)}% đã tải`
                            : "Hoàn tất"
                          : "Đang tải metadata..."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <HLSVideoPlayer
                    videoRef={videoRef}
                    src={media.url}
                    className="max-w-full max-h-full object-contain cursor-pointer"
                    style={{ maxHeight: "calc(90vh - 80px)" }}
                    controls={false}
                    muted={isVideoMuted}
                    loop
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                    onClick={handleVideoPlayPause}
                    onLoadedData={() => {
                      setIsVideoLoading(false);
                      setIsVideoLoaded(true);
                      setBufferedProgress(100);
                      if (videoRef.current) {
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    onCanPlay={() => {
                      setIsVideoLoading(false);
                      setIsVideoLoaded(true);
                      setBufferedProgress(100);
                    }}
                  />

                  {/* Play/Pause Icon Overlay */}
                  {showPlayPauseIcon && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="bg-black/60 rounded-full p-6 transform scale-100 animate-ping">
                        <div className="bg-black/80 rounded-full p-4">
                          {isVideoPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Video Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  {/* Progress Bar */}
                  <div
                    className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer relative"
                    onClick={handleSeek}
                  >
                    {/* Buffered Progress */}
                    <div
                      className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
                      style={{ width: `${bufferedProgress}%` }}
                    />
                    {/* Current Progress */}
                    <div
                      className="h-full bg-white rounded-full transition-all duration-150 relative z-10"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between bg-black/70 rounded-full px-4 py-2">
                    <div className="flex items-center gap-2"></div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleVideoMuteToggle}
                        className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                      >
                        {isVideoMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFullscreen}
                        className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full h-10 px-4 gap-2"
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full h-10 px-4 gap-2"
            >
              <Share2 className="w-4 h-4" />
              Chia sẻ
            </Button>
          </div>

          {/* Media Info */}
          {media.file && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
              <p className="text-sm font-medium">{media.file.name}</p>
              <p className="text-xs text-gray-300">
                {formatFileSize(media.file.size)}
                {media.type === "video" && (
                  <span className="ml-2">
                    • {videoQuality === "auto" ? "Tự động" : videoQuality}
                  </span>
                )}
              </p>
              {media.type === "video" && videoDuration > 0 && (
                <p className="text-xs text-gray-400">
                  {formatTime(videoDuration)} •
                  {isVideoLoading
                    ? " Đang tải..."
                    : bufferedProgress > 0
                    ? ` ${Math.round(bufferedProgress)}% đã tải`
                    : ""}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
