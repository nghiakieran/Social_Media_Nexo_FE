import { useEffect, useRef, useCallback } from "react";
import { useBookmark } from "./useBookmark";
import { useInView } from "react-intersection-observer";

export const useLazyBookmarkCheck = (postIds: string[]) => {
  const { checkSavedStatus } = useBookmark();
  const { ref: observerRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (inView && !hasCheckedRef.current && postIds.length > 0) {
      checkSavedStatus(postIds);
      hasCheckedRef.current = true;
    }
  }, [inView, postIds, checkSavedStatus]);

  // Return a callback ref that works with both cardRef and observer
  const callbackRef = useCallback(
    (el: HTMLElement | null) => {
      observerRef(el);
    },
    [observerRef],
  );

  return callbackRef;
};
