import { memo, useRef, useEffect, useState } from "react"
import { StoryContent as StoryContentType } from "../types"
import { HLSVideoPlayer } from "@/components/common/HLSVideoPlayer"
import { cn } from "@/lib/utils"

interface StoryContentProps {
  content: StoryContentType
  username: string
  isMuted: boolean
  isPaused: boolean
  onStoryClick: (e: React.MouseEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onVideoDurationDetected?: (duration: number) => void
  onVideoReady?: () => void // Callback when content (image/video) is ready
}

export const StoryContent = memo(({ 
  content, 
  username,
  isMuted,
  isPaused,
  onStoryClick, 
  onTouchStart, 
  onTouchEnd,
  onVideoDurationDetected,
  onVideoReady
}: StoryContentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [videoObjectFit, setVideoObjectFit] = useState<"contain" | "fill">("contain")

  // Control video playback based on isPaused state
  useEffect(() => {
    if (content.type === "video" && videoRef.current) {
      if (isPaused) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {
          // Auto-play might be blocked, ignore error
        })
      }
    }
  }, [isPaused, content.type])

  // Detect video duration and aspect ratio when video metadata is loaded
  useEffect(() => {
    if (content.type === "video" && videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        // Detect duration
        if (onVideoDurationDetected && video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
          onVideoDurationDetected(video.duration);
        }
        
        // Detect aspect ratio
        if (video.videoWidth && video.videoHeight) {
          // Portrait (height > width) → fill (stretch to fill)
          // Landscape/Square (width >= height) → contain (keep ratio)
          const isPortrait = video.videoHeight > video.videoWidth;
          setVideoObjectFit(isPortrait ? "fill" : "contain");
        }
      };
      
      const handleCanPlay = () => {
        // Video ready to play
        if (onVideoReady) {
          onVideoReady();
        }
      };
      
      if (video.readyState >= 1) {
        // Metadata already loaded
        handleLoadedMetadata();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
      
      if (video.readyState >= 3) {
        // Video already ready
        handleCanPlay();
      } else {
        video.addEventListener('canplay', handleCanPlay);
      }
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [content.type, onVideoDurationDetected, onVideoReady])

  // Detect when image is loaded
  useEffect(() => {
    if (content.type === "image" && imageRef.current) {
      const img = imageRef.current;
      
      const handleImageLoad = () => {
        // Image ready to display
        if (onVideoReady) {
          onVideoReady();
        }
      };
      
      if (img.complete && img.naturalWidth > 0) {
        // Image already loaded
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        return () => img.removeEventListener('load', handleImageLoad);
      }
    }
  }, [content.type, content.url, onVideoReady])

  return (
    <div
      className="absolute inset-0 flex items-center justify-center cursor-pointer"
      onClick={onStoryClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full h-full">
        {content.type === "image" ? (
          <img
            ref={imageRef}
            src={content.url || "/placeholder.svg"}
            alt={`${username}'s story content`}
            className="w-full h-full object-cover pointer-events-none"
            crossOrigin="anonymous"
            loading="lazy"
          />
        ) : (
          <HLSVideoPlayer
            src={content.url}
            className={cn(
              "w-full h-full transition-all duration-300",
              videoObjectFit === "fill" ? "object-fill" : "object-contain"
            )}
            controls={false}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            videoRef={videoRef}
          />
        )}
      </div>
    </div>
  )
})

StoryContent.displayName = "StoryContent"
