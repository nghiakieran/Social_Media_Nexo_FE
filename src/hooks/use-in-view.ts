import { useEffect, useRef, useState, RefObject } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useInView = (
  ref: RefObject<HTMLElement>,
  options: UseInViewOptions = {}
) => {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = false } = options;
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsInView(isIntersecting);

        if (isIntersecting && !hasBeenInView) {
          setHasBeenInView(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin, hasBeenInView]);

  return {
    isInView,
    hasBeenInView: triggerOnce ? hasBeenInView : isInView,
  };
};
