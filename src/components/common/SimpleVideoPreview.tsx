/**
 * Simple video preview component for grid views
 * Shows first frame of video (including HLS) without playing
 */
import { useRef, useEffect, useState } from "react";
import Hls from "hls.js";

interface SimpleVideoPreviewProps {
  videoUrl: string;
  className?: string;
}

export const SimpleVideoPreview = ({
  videoUrl,
  className = "",
}: SimpleVideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isHLS =
      videoUrl && (videoUrl.includes(".m3u8") || videoUrl.includes("m3u8"));

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      let loaded = false;
      const loadPreviewFrame = () => {
        if (loaded || !video.paused) return;
        loaded = true;

        const onCanPlay = () => {
          video.currentTime = 0.5;
          video.removeEventListener("canplay", onCanPlay);
        };

        const onSeeked = () => {
          setIsLoaded(true);
          video.removeEventListener("seeked", onSeeked);
        };

        video.addEventListener("canplay", onCanPlay);
        video.addEventListener("seeked", onSeeked);
      };

      hls.on(Hls.Events.MANIFEST_PARSED, loadPreviewFrame);
      hls.on(Hls.Events.FRAG_LOADED, loadPreviewFrame);

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    } else {
      // Regular video
      video.currentTime = 0.5;
      video.addEventListener("seeked", () => setIsLoaded(true));
    }
  }, [videoUrl]);

  return (
    <div className={`w-full h-full ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl && !videoUrl.includes(".m3u8") ? videoUrl : undefined}
        className="w-full h-full object-cover"
        preload="auto"
        muted
        playsInline
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
