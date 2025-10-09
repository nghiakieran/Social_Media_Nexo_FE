import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Loader2, Play } from 'lucide-react';
import { getVideoThumbnail } from '@/utils/videoUtils';

interface HLSVideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials';
  onClick?: () => void;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
  poster?: string;
  style?: React.CSSProperties;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export const HLSVideoPlayer = ({
  src,
  className = '',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = false,
  preload = 'metadata',
  crossOrigin,
  onClick,
  onLoadedData,
  onCanPlay,
  poster,
  style,
  videoRef: externalRef,
}: HLSVideoPlayerProps) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalRef || internalVideoRef;
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Generate thumbnail for video preview
  useEffect(() => {
    if (!src || poster) return;

    const isHLS = src.includes('.m3u8') || src.includes('m3u8');
    
    // For regular videos, generate thumbnail
    // For HLS, we'll rely on preload="metadata" to show first frame
    if (!isHLS) {
      getVideoThumbnail(src, 1).then((thumbnailUrl) => {
        if (thumbnailUrl) {
          setGeneratedPoster(thumbnailUrl);
        }
      }).catch(() => {
        // Ignore errors
      });
    }
  }, [src, poster]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Check if URL is HLS (.m3u8)
    const isHLS = src.includes('.m3u8') || src.includes('m3u8');

    if (isHLS) {
      // HLS format - use hls.js
      if (Hls.isSupported()) {
        // Cleanup previous HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          debug: false, // Set to true for debugging
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          // Firebase Storage CORS configuration
          xhrSetup: (xhr, url) => {
            xhr.withCredentials = false;
          },
        });

        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          
          if (autoPlay) {
            video.play().catch(() => {
              // Auto-play prevented
            });
          }
        });

        // Load first frame for preview (after fragment loaded)
        let firstFragLoaded = false;
        hls.on(Hls.Events.FRAG_LOADED, () => {
          if (!firstFragLoaded && !autoPlay && !hasStarted) {
            firstFragLoaded = true;
            // Wait for buffer to be ready
            setTimeout(() => {
              if (video.buffered.length > 0 && video.paused) {
                video.muted = true;
                video.currentTime = 0.001; // Tiny seek to load frame
              }
            }, 100);
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError(`Lỗi mạng: ${data.details}`);
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError(`Lỗi phát video: ${data.details}`);
                hls.recoverMediaError();
                break;
              default:
                setError(`Lỗi HLS: ${data.type} - ${data.details}`);
                hls.destroy();
                setIsLoading(false);
                break;
            }
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        
        const handleLoadedMetadata = () => {
          setIsLoading(false);
        };
        
        const handleError = () => {
          setError('Lỗi tải video');
          setIsLoading(false);
        };
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', handleError);
        
        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
        };
      } else {
        setError('Trình duyệt không hỗ trợ phát video HLS');
        setIsLoading(false);
      }
    } else {
      // Regular video formats (MP4, WebM, etc.)
      video.src = src;
      
      const handleLoadedMetadata = () => {
        setIsLoading(false);
      };
      
      const handleError = () => {
        setError('Lỗi tải video');
        setIsLoading(false);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoPlay]); // videoRef intentionally excluded to prevent infinite loop

  const handleLoadedData = () => {
    setIsLoading(false);
    onLoadedData?.();
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    onCanPlay?.();
  };

  const handleVideoClick = () => {
    if (onClick) {
      onClick();
    }
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

  const finalPoster = poster || generatedPoster || undefined;

  return (
    <div className="relative w-full h-full bg-black">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white p-4">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Play button overlay for videos */}
      {!hasStarted && !autoPlay && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className={className}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload="metadata"
        crossOrigin={crossOrigin}
        onClick={handleVideoClick}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onPlay={() => setHasStarted(true)}
        poster={finalPoster}
        style={style}
      />
    </div>
  );
};
