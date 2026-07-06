import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic } from "lucide-react";

interface MessageAudioPlayerProps {
  src: string;
  isOwn: boolean;
  createdAt: string;
}

export const MessageAudioPlayer: React.FC<MessageAudioPlayerProps> = ({
  src,
  isOwn,
  createdAt,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
      
      // Fallback: If duration is finite, update it. Otherwise, track maximum currentTime reached.
      if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      } else if (audio.currentTime > duration) {
        setDuration(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration === Infinity) {
        // Chrome webm duration hack: seek to end, then back to 0 to trigger duration calculation
        audio.currentTime = 1e9;
        const tempTimeUpdate = () => {
          audio.currentTime = 0;
          if (audio.duration && isFinite(audio.duration)) {
            setDuration(audio.duration);
          }
          audio.removeEventListener("timeupdate", tempTimeUpdate);
        };
        audio.addEventListener("timeupdate", tempTimeUpdate);
      } else if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    // Try to load metadata if already cached/loaded
    if (audio.readyState >= 1) {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      } else if (audio.duration === Infinity) {
        onLoadedMetadata();
      }
    }

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src, isDragging, duration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const calculateTimeFromX = (clientX: number) => {
    if (!progressBarRef.current || duration === 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const width = rect.width;
    const x = Math.max(0, Math.min(clientX - rect.left, width));
    return (x / width) * duration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const newTime = calculateTimeFromX(e.clientX);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !audioRef.current) return;
    const newTime = calculateTimeFromX(e.clientX);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const timeString = new Date(createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-1.5 w-[210px] sm:w-[250px] select-none">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Audio Control Row */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          type="button"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 ${
            isOwn
              ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              : "bg-primary text-primary-foreground hover:bg-primary/95"
          }`}
          title={isPlaying ? "Tạm dừng" : "Phát"}
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current text-current" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5 text-current" />
          )}
        </button>

        {/* Custom Progress Bar Track */}
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex-1 h-3 flex items-center relative cursor-pointer group"
        >
          {/* Timeline Track */}
          <div
            className={`w-full h-1.5 rounded-full relative overflow-visible ${
              isOwn ? "bg-primary-foreground/30" : "bg-muted-foreground/30"
            }`}
          >
            {/* Progress Fill */}
            <div
              className={`absolute top-0 left-0 h-full rounded-full ${
                isOwn ? "bg-primary-foreground" : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
            {/* Seeker Thumb */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full border shadow-sm transition-all scale-0 group-hover:scale-100 ${
                isOwn
                  ? "bg-primary-foreground border-primary"
                  : "bg-primary border-primary-foreground"
              }`}
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Time Text */}
        <span
          className={`text-[10px] font-semibold tabular-nums shrink-0 ${
            isOwn ? "text-primary-foreground/90" : "text-muted-foreground"
          }`}
        >
          {formatTime(currentTime)}
        </span>
      </div>

      {/* Info and Metadata Row */}
      <div
        className={`flex items-center justify-between border-t pt-1 ${
          isOwn
            ? "border-primary-foreground/20 text-primary-foreground/75"
            : "border-border/60 text-muted-foreground"
        }`}
      >
        <div className="flex items-center gap-1">
          <Mic className="h-3 w-3 shrink-0" />
          <span className="text-[9px] font-medium tracking-wide">
            {duration > 0 ? `${formatTime(duration)}` : "Tin nhắn thoại"}
          </span>
        </div>
        <span className="text-[9px]">
          {timeString}
        </span>
      </div>
    </div>
  );
};
