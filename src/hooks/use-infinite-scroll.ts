import { useEffect, useCallback, useRef, RefObject } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  error?: string | null; // Add error handling
  root?: HTMLElement | null;
  rootRef?: RefObject<HTMLElement | null>;
}

interface UseInfiniteScrollReturn {
  lastElementRef: (node: HTMLElement | null) => void;
}

export const useInfiniteScroll = (
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn => {
  const {
    hasMore,
    isLoading,
    threshold = 100,
    error = null,
    root,
    rootRef,
  } = options;
  const observer = useRef<IntersectionObserver>();
  const isLoadingRef = useRef(isLoading);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) {
        observer.current.disconnect();
      }
      if (!node || error) return;

      const resolvedRoot = rootRef?.current ?? root ?? null;

      observer.current = new IntersectionObserver(
        (entries) => {
          // Only trigger if intersecting, has more data, and no error
          if (
            entries[0].isIntersecting &&
            hasMore &&
            !error &&
            !isLoadingRef.current
          ) {
            onLoadMoreRef.current();
          }
        },
        {
          root: resolvedRoot,
          rootMargin: `${threshold}px`,
        }
      );
      observer.current.observe(node);
    },
    [hasMore, threshold, error, root, rootRef]
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
