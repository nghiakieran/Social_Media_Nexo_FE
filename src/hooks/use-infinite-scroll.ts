import { useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  error?: string | null; // Add error handling
}

interface UseInfiniteScrollReturn {
  lastElementRef: (node: HTMLElement | null) => void;
}

export const useInfiniteScroll = (
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn => {
  const { hasMore, isLoading, threshold = 100, error = null } = options;
  const observer = useRef<IntersectionObserver>();

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      // Don't trigger if loading or has error
      if (isLoading || error) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(
        (entries) => {
          // Only trigger if intersecting, has more data, and no error
          if (entries[0].isIntersecting && hasMore && !error) {
            onLoadMore();
          }
        },
        {
          rootMargin: `${threshold}px`,
        }
      );
      
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore, threshold, error]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return { lastElementRef };
};
