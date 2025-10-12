import { useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

interface UseInfiniteScrollReturn {
  lastElementRef: (node: HTMLElement | null) => void;
}

export const useInfiniteScroll = (
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn => {
  const { hasMore, isLoading, threshold = 100 } = options;
  const observer = useRef<IntersectionObserver>();

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        {
          rootMargin: `${threshold}px`,
        }
      );
      
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore, threshold]
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
