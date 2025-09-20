import { useMemo } from 'react';

interface HighlightItem {
  id: string;
  title: string;
  cover: string;
}

interface StoryHighlightsProps {
  highlights?: HighlightItem[];
  onAdd?: () => void;
  onOpen?: (id: string) => void;
}

export const StoryHighlights = ({ highlights, onAdd, onOpen }: StoryHighlightsProps) => {
  const items = useMemo<HighlightItem[]>(() => {
    if (highlights && highlights.length > 0) return highlights;
    return [];
  }, [highlights]);

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {/* Add new highlight */}
        <button
          onClick={onAdd}
          className="flex flex-col items-center gap-2 focus:outline-none"
          aria-label="Thêm mục nổi bật"
        >
          <div className="relative">
            <div className="w-[77px] h-[77px] rounded-full border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
                <path d="M21 11h-8V3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1 1 0 1 0 2 0v-8h8a1 1 0 1 0 0-2Z"></path>
              </svg>
            </div>
          </div>
          <span className="text-xs">Mới</span>
        </button>

        {/* Highlight items */}
        {items.map((hl) => (
          <button
            key={hl.id}
            onClick={() => onOpen?.(hl.id)}
            className="flex flex-col items-center gap-2 focus:outline-none"
            aria-label={hl.title}
          >
            <div className="w-[77px] h-[77px] rounded-full ring-1 ring-border overflow-hidden">
              <img
                src={hl.cover}
                alt={hl.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="text-xs truncate max-w-[77px]" title={hl.title}>{hl.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoryHighlights;

