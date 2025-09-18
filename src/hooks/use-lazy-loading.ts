import { useState, useRef, useEffect, useCallback } from 'react';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  preloadNearby?: boolean;
}

interface UseLazyLoadingReturn<T> {
  visibleItems: Set<string>;
  setItemRef: (id: string, element: HTMLElement | null) => void;
  isVisible: (id: string) => boolean;
  isNearVisible: (id: string, items: T[]) => boolean;
}

export const useLazyLoading = <T extends { id: string }>(
  items: T[],
  options: UseLazyLoadingOptions = {}
): UseLazyLoadingReturn<T> => {
  const {
    rootMargin = '200px',
    threshold = 0.1,
    preloadNearby = true
  } = options;

  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const setItemRef = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  const isVisible = useCallback((id: string) => {
    return visibleItems.has(id);
  }, [visibleItems]);

  const isNearVisible = useCallback((id: string, items: T[]) => {
    if (!preloadNearby) return false;
    
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return false;

    const prevItem = items[currentIndex - 1];
    const nextItem = items[currentIndex + 1];
    
    return (prevItem && visibleItems.has(prevItem.id)) || 
           (nextItem && visibleItems.has(nextItem.id));
  }, [visibleItems, preloadNearby]);

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const itemId = entry.target.getAttribute('data-item-id');
          if (itemId && entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, itemId]));
            // Unobserve after loading to improve performance
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold
      }
    );

    // Observe all item elements
    itemRefs.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items, rootMargin, threshold]);

  return {
    visibleItems,
    setItemRef,
    isVisible,
    isNearVisible
  };
};
