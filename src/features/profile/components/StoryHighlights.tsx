import { useMemo } from 'react';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VideoThumbnail } from '@/components/common/VideoThumbnail';
import { isVideoUrl } from '@/utils/mediaUtils';

interface HighlightItem {
  id: string;
  title: string;
  cover: string;
}

interface StoryHighlightsProps {
  highlights?: HighlightItem[];
  onAdd?: () => void;
  onOpen?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  canManage?: boolean; // Rename from canDelete to canManage
}

export const StoryHighlights = ({ highlights, onAdd, onOpen, onEdit, onDelete, canManage }: StoryHighlightsProps) => {
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
            <div className="w-[56px] h-[56px] sm:w-[77px] sm:h-[77px] rounded-full border-2 border-dashed border-muted flex items-center justify-center text-muted-foreground">
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7" fill="currentColor" aria-hidden>
                <path d="M21 11h-8V3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1 1 0 1 0 2 0v-8h8a1 1 0 1 0 0-2Z"></path>
              </svg>
            </div>
          </div>
          <span className="text-xs">Mới</span>
        </button>

        {/* Highlight items */}
        {items.map((hl) => {
          const isVideo = isVideoUrl(hl.cover);
          return (
            <div key={hl.id} className="relative group">
              <button
                onClick={() => onOpen?.(hl.id)}
                className="flex flex-col items-center gap-2 focus:outline-none"
                aria-label={hl.title}
              >
                <div className="w-[56px] h-[56px] sm:w-[77px] sm:h-[77px] rounded-full ring-1 ring-border overflow-hidden">
                  {isVideo ? (
                    <VideoThumbnail
                      videoUrl={hl.cover}
                      className="w-full h-full"
                      showPlayButton={false}
                    />
                  ) : (
                    <img
                      src={hl.cover}
                      alt={hl.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <span className="text-xs truncate max-w-[56px] sm:max-w-[77px]" title={hl.title}>{hl.title}</span>
              </button>

            {/* Management menu - only show for owner */}
            {canManage && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="absolute top-0 right-0 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Tùy chọn"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-primary/10 focus:text-primary dark:focus:bg-primary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(hl.id);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-500/10 dark:focus:bg-red-500/20 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(hl.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryHighlights;
