import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";
import { HLSVideoPlayer } from "@/components/common/HLSVideoPlayer";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  alt?: string;
}

interface MediaSliderProps {
  media: MediaItem[];
  className?: string;
}

export const MediaSlider = ({
  media,
  className,
}: MediaSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
  const sliderRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  // Pause videos when they go out of view
  useEffect(() => {
    media.forEach((mediaItem, index) => {
      if (mediaItem.type === "video" && index !== currentIndex) {
        const video = videoRefs.current[mediaItem.id];
        if (video) {
          video.pause();
        }
      }
    });
  }, [currentIndex, media]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  // Touch/Swipe handling with improved sensitivity
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);

    const distance = touchStart - currentX;
    if (Math.abs(distance) > 10) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30; // Reduced threshold for better sensitivity
    const isRightSwipe = distance < -30;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setIsDragging(false);
  };

  if (!media || media.length === 0) return null;

  const isFullHeight = className?.includes('h-full');

  return (
    <div className={cn("relative", isFullHeight ? "w-full h-full" : "w-full")}>
      {/* Main Media Container */}
      <div
        ref={sliderRef}
        className={cn(
          "relative bg-black overflow-hidden group touch-pan-y",
          isFullHeight ? 'w-full h-full' : 'aspect-square rounded-lg w-full'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: 'translateZ(0)' }}
      >
        {media.map((mediaItem, index) => {
          // Only render current slide and adjacent slides for performance
          const shouldRender = Math.abs(index - currentIndex) <= 1;
          
          if (!shouldRender) {
            return null;
          }

          return (
            <div
              key={mediaItem.id}
              className={cn(
                "absolute inset-0 transition-transform duration-300 ease-out will-change-transform",
                index === currentIndex
                  ? "translate-x-0 z-10"
                  : index < currentIndex
                  ? "-translate-x-full z-0"
                  : "translate-x-full z-0"
              )}
            >
            {mediaItem.type === "image" ? (
              <img
                src={mediaItem.url}
                alt={mediaItem.alt || "Post media"}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <HLSVideoPlayer
                src={mediaItem.url}
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
                onLoadedData={() => {
                  setLoadedVideos(prev => new Set(prev).add(mediaItem.id));
                }}
                videoRef={
                  {
                    current: videoRefs.current[mediaItem.id] || null
                  } as React.RefObject<HTMLVideoElement>
                }
              />
            )}
            </div>
          );
        })}

        {/* Navigation Arrows - Only show if more than 1 media */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Media Indicators - Only show if more than 1 media and current is not video */}
        {media.length > 1 && media[currentIndex]?.type !== 'video' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  index === currentIndex 
                    ? "bg-white w-2 h-2" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to media ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(MediaSlider);
