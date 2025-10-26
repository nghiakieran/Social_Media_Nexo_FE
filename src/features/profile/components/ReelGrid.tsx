import { Play, Heart, MessageCircle } from "lucide-react";
import { Reel } from "@/features/reel/types";
import { useAppSelector } from "@/store";
import { useNavigate } from "react-router-dom";
import { LazyGrid } from "@/components/common/LazyGrid";

interface ReelGridProps {
  reels: Reel[];
  onReelClick?: (reel: Reel) => void;
  lastElementRef?: (node: HTMLElement | null) => void;
}

export const ReelGrid = ({
  reels,
  onReelClick,
  lastElementRef,
}: ReelGridProps) => {
  const navigate = useNavigate();

  const handleReelClick = (reel: Reel) => {
    if (onReelClick) {
      onReelClick(reel);
    } else {
      navigate(`/reels/${reel.id}`);
    }
  };

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-2 border-muted rounded-full flex items-center justify-center mb-4">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có reel</h3>
        <p className="text-muted-foreground text-center">
          Khi bạn chia sẻ video, các reel sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <LazyGrid
      items={reels.map((reel, index) => ({
        id: reel.id,
        thumbnail: reel.mediaUrl, // Use mediaUrl as thumbnail for now
        type: "reel" as const,
        caption: reel.caption,
        likesCount: reel.likesCount,
        commentsCount: reel.commentsCount,
        ref: index === reels.length - 1 ? lastElementRef : undefined,
      }))}
      onItemClick={(item) => {
        const reel = reels.find((r) => r.id === item.id);
        if (reel) handleReelClick(reel);
      }}
      className="pb-4"
      columns={3}
      gap="md"
      enableProgressiveLoading={true}
      enableBlurToSharp={false}
      renderOverlay={(item, isVisible) => {
        if (!isVisible) return null;

        return (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">{item.likesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {item.commentsCount}
                </span>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
};
