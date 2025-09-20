import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  // Instagram-style progressive loading
  enableProgressiveLoading?: boolean;
  // Blur-to-sharp effect
  enableBlurToSharp?: boolean;
  lowResSrc?: string;
}

export const LazyImage = ({
  src,
  alt,
  className,
  placeholder,
  onLoad,
  onError,
  loading = 'lazy',
  decoding = 'async',
  enableProgressiveLoading = true,
  enableBlurToSharp = false,
  lowResSrc
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showHighRes, setShowHighRes] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
    
    if (enableProgressiveLoading) {
      // Instagram-style fade in
      setTimeout(() => setShowHighRes(true), 50);
    }
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Default placeholder
  const defaultPlaceholder = (
    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600" />
    </div>
  );

  if (hasError) {
    return (
      <div className={cn("w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-gray-500 text-xs">Image</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Placeholder */}
      {!isLoaded && (placeholder || defaultPlaceholder)}
      
      {/* Low-res image for blur-to-sharp effect */}
      {enableBlurToSharp && lowResSrc && !showHighRes && (
        <img
          src={lowResSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          loading="eager"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          enableProgressiveLoading && !showHighRes && "opacity-0",
          enableProgressiveLoading && showHighRes && "opacity-100",
          enableBlurToSharp && lowResSrc && "absolute inset-0"
        )}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};
