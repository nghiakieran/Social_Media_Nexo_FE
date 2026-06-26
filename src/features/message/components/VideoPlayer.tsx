import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  stream: MediaStream;
  isLocal?: boolean;
  className?: string;
  muted?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, isLocal = false, className, muted = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      // Check if it's already the same stream to avoid blinking
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal || muted}
      className={cn("bg-zinc-950 object-cover", className)}
    />
  );
};
