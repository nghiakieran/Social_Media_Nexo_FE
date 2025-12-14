import { useEffect, useState, useRef } from "react";
import { Play } from "lucide-react";
import { getVideoThumbnail } from "@/utils/videoUtils";
import Hls from "hls.js";

interface VideoThumbnailProps {
  videoUrl: string;
  className?: string;
  showPlayButton?: boolean;
}

export const VideoThumbnail = ({
  videoUrl,
  className = "",
  showPlayButton = true,
}: VideoThumbnailProps) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    let isMounted = true;

    const isHLS = videoUrl.includes(".m3u8") || videoUrl.includes("m3u8");

    if (isHLS) {
      // For HLS, use hls.js to load and capture thumbnail
      if (Hls.isSupported()) {
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;

        const hls = new Hls({
          enableWorker: true,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });

        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        const captureFrame = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
                if (isMounted) {
                  setThumbnail(thumbnailUrl);
                  setIsLoading(false);
                }
              }
            } catch (e) {
              // CORS error, fallback
              if (isMounted) {
                setIsLoading(false);
              }
            }
          }
        };

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Play briefly to load first frame (muted to avoid autoplay blocking)
          video.muted = true;
          video
            .play()
            .then(() => {
              // Wait for video to have data
              const onLoadedData = () => {
                setTimeout(() => {
                  video.pause();
                  captureFrame();
                  video.currentTime = 0;
                }, 100);
                video.removeEventListener("loadeddata", onLoadedData);
              };

              if (video.readyState >= 2) {
                onLoadedData();
              } else {
                video.addEventListener("loadeddata", onLoadedData);
              }
            })
            .catch(() => {
              // Play prevented, just stop loading
              if (isMounted) {
                setIsLoading(false);
              }
            });
        });

        hls.on(Hls.Events.ERROR, () => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

        return () => {
          isMounted = false;
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } else {
        // No HLS support
        setIsLoading(false);
        return () => {
          isMounted = false;
        };
      }
    } else {
      // For regular videos, use the utility function
      setIsLoading(true);
      getVideoThumbnail(videoUrl, 0.5)
        .then((thumbnailUrl) => {
          if (isMounted && thumbnailUrl) {
            setThumbnail(thumbnailUrl);
          }
        })
        .catch(() => {
          // Fallback
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [videoUrl]);

  // Fallback: Always show video element if no thumbnail after 3 seconds
  const showFallbackVideo = !thumbnail && !isLoading;

  return (
    <div className={`relative w-full h-full bg-gray-900 ${className}`}>
      {thumbnail ? (
        <img
          src={thumbnail}
          alt="Video preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-500 ml-1" />
          </div>
        </div>
      )}

      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all">
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
