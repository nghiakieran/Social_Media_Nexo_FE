import { ReactNode } from "react";
import { useLazyLoading } from "@/hooks/use-lazy-loading";
import { LazyImage } from "./LazyImage";
import { SimpleVideoPreview } from "./SimpleVideoPreview";

interface LazyGridItem {
  id: string;
  thumbnail: string;
  type?: "photo" | "video" | "reel";
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  // For blur-to-sharp effect
  lowResThumbnail?: string;
  ref?: (node: HTMLElement | null) => void;
}

interface LazyGridProps {
  items: LazyGridItem[];
  onItemClick?: (item: LazyGridItem) => void;
  className?: string;
  itemClassName?: string;
  // Grid configuration
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  // Lazy loading options
  rootMargin?: string;
  threshold?: number;
  preloadNearby?: boolean;
  // Image options
  enableProgressiveLoading?: boolean;
  enableBlurToSharp?: boolean;
  // Custom overlay content
  renderOverlay?: (item: LazyGridItem, isVisible: boolean) => ReactNode;
  // Custom placeholder
  renderPlaceholder?: (item: LazyGridItem) => ReactNode;
}

export const LazyGrid = ({
  items,
  onItemClick,
  className = "",
  itemClassName = "",
  columns = 3,
  gap = "md",
  rootMargin = "200px",
  threshold = 0.1,
  preloadNearby = true,
  enableProgressiveLoading = true,
  enableBlurToSharp = false,
  renderOverlay,
  renderPlaceholder,
}: LazyGridProps) => {
  const { visibleItems, setItemRef, isVisible, isNearVisible } = useLazyLoading(
    items,
    { rootMargin, threshold, preloadNearby }
  );

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const gapClasses = {
    sm: "gap-1",
    md: "gap-1 md:gap-2",
    lg: "gap-2 md:gap-4",
  };

  const defaultOverlay = (item: LazyGridItem, isVisible: boolean) => {
    if (!isVisible) return null;

    return (
      <>
        {/* Video/Reel indicator */}
        {(item.type === "video" || item.type === "reel") && (
          <div className="absolute top-2 right-2">
            <div className="w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[3px] border-y-transparent ml-0.5" />
            </div>
          </div>
        )}

        {/* Hover overlay with stats */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5" />
              <span className="font-semibold">{item.likesCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5" />
              <span className="font-semibold">{item.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  const defaultPlaceholder = (item: LazyGridItem) => (
    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600" />
    </div>
  );

  return (
    <div
      className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}
    >
      {items.map((item) => {
        const itemVisible = isVisible(item.id);
        const itemNearVisible = isNearVisible(item.id, items);
        const shouldLoad = itemVisible || itemNearVisible;
        const hasThumbnail = Boolean(item.thumbnail);
        const shouldShowMedia = shouldLoad && hasThumbnail;
        const placeholderContent =
          renderPlaceholder?.(item) || defaultPlaceholder(item);

        return (
          <div
            key={item.id}
            ref={(el) => {
              setItemRef(item.id, el);
              if (item.ref) {
                item.ref(el);
              }
            }}
            data-item-id={item.id}
            className={`relative aspect-square bg-muted cursor-pointer group overflow-hidden ${itemClassName}`}
            onClick={() => onItemClick?.(item)}
          >
            {/* Media or placeholder */}
            {shouldShowMedia ? (
              item.type === "video" || item.type === "reel" ? (
                <SimpleVideoPreview
                  videoUrl={item.thumbnail}
                  className="w-full h-full"
                />
              ) : (
                <LazyImage
                  src={item.thumbnail}
                  alt={item.caption || "Post image"}
                  className="w-full h-full"
                  loading="lazy"
                  decoding="async"
                  enableProgressiveLoading={enableProgressiveLoading}
                  enableBlurToSharp={enableBlurToSharp}
                  lowResSrc={item.lowResThumbnail}
                  placeholder={renderPlaceholder?.(item)}
                />
              )
            ) : (
              placeholderContent
            )}

            {/* Overlay */}
            {shouldLoad &&
              hasThumbnail &&
              (renderOverlay?.(item, itemVisible) ||
                defaultOverlay(item, itemVisible))}
          </div>
        );
      })}
    </div>
  );
};
