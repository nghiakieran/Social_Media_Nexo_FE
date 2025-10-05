import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [globalMuteState, setGlobalMuteState] = useState(true); // Global mute state
  const sliderRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  // Auto-play video when component mounts or currentIndex changes
  useEffect(() => {
    const currentMedia = media[currentIndex];
    if (currentMedia?.type === "video") {
      const video = videoRefs.current[currentMedia.id];
      if (video) {
        video.play().catch(() => {
          // Auto-play failed, user interaction required
        });
      }
    }
  }, [currentIndex, media]);

  // Auto-play first video on mount
  useEffect(() => {
    const firstVideo = media.find((item) => item.type === "video");
    if (firstVideo) {
      const video = videoRefs.current[firstVideo.id];
      if (video) {
        setTimeout(() => {
          video.play().catch(() => {
            // Auto-play failed, user interaction required
          });
        }, 100);
      }
    }
  }, [media]);

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

  const handleVideoPlayPause = (mediaId: string) => {
    const video = videoRefs.current[mediaId];
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleVideoMuteToggle = () => {
    const newMuteState = !globalMuteState;
    setGlobalMuteState(newMuteState);

    // Update all videos mute state
    media.forEach((mediaItem) => {
      if (mediaItem.type === "video") {
        const video = videoRefs.current[mediaItem.id];
        if (video) {
          video.muted = newMuteState;
        }
      }
    });

  };

  const handleVideoClick = (mediaId: string) => {
    handleVideoPlayPause(mediaId);
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

  return (
    <div className={cn("relative w-full", className)}>
      {/* Main Media Container */}
      <div
        ref={sliderRef}
        className="relative aspect-square bg-black rounded-lg overflow-hidden group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {media.map((mediaItem, index) => (
          <div
            key={mediaItem.id}
            className={cn(
              "absolute inset-0 transition-transform duration-300 ease-in-out",
              index === currentIndex
                ? "translate-x-0"
                : index < currentIndex
                ? "-translate-x-full"
                : "translate-x-full"
            )}
          >
            {mediaItem.type === "image" ? (
              <img
                src={mediaItem.url}
                alt={mediaItem.alt || "Post media"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[mediaItem.id] = el;
                  }}
                  src={mediaItem.url}
                  className="w-full h-full object-cover cursor-pointer"
                  muted={globalMuteState} // Use global mute state
                  loop
                  playsInline
                  onClick={() => handleVideoClick(mediaItem.id)}
                />

                {/* Mute Button - Inside video, bottom right corner */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVideoMuteToggle();
                  }}
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 p-0"
                >
                  {globalMuteState ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows - Only show if more than 1 media */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Indicators - Only show if more than 1 media */}
      {media.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
