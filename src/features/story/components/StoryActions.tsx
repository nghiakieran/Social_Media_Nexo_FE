import { memo } from "react";
import { Heart, Send, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryActionsProps {
  replyText: string;
  isLiked: boolean;
  viewerCount: number;
  isOwnStory?: boolean;
  isCloseFriend?: boolean;
  onReplyChange: (text: string) => void;
  onSendReply: () => void;
  onLike: () => void;
  onShare: () => void;
  onViewerListToggle: () => void;
}

export const StoryActions = memo(
  ({
    replyText,
    isLiked,
    viewerCount,
    isOwnStory = false,
    isCloseFriend = false,
    onReplyChange,
    onSendReply,
    onLike,
    onShare,
    onViewerListToggle,
  }: StoryActionsProps) => {
    return (
      <>
        <div className="absolute bottom-4 left-4 right-4 z-30">
          {/* Message input - only show for other users' stories */}
          {!isOwnStory && (
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Send message"
                  value={replyText}
                  onChange={(e) => onReplyChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      onSendReply();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-4 py-3 rounded-full bg-black/40 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/60 focus:bg-white/10 text-sm transition-all duration-200"
                />
              </div>

              {/* Action buttons - only show for other users' stories */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                className={cn(
                  "p-2.5 transition-all duration-200 rounded-full bg-black/30 backdrop-blur-sm",
                  isLiked
                    ? "text-red-500 bg-red-500/20 scale-110"
                    : "text-white/90 hover:text-red-500 hover:bg-white/10"
                )}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (replyText.trim()) {
                    onSendReply();
                  } else {
                    onShare();
                  }
                }}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-200 backdrop-blur-sm",
                  replyText.trim()
                    ? "bg-primary text-primary-foreground scale-105 shadow-md"
                    : "text-white/90 hover:text-white hover:bg-white/10 bg-black/30"
                )}
                title={replyText.trim() ? "Gửi" : "Chia sẻ"}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Viewer count - only show for own stories - Bottom left corner like Facebook */}
        {isOwnStory && (
          <div className="absolute bottom-4 left-4 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewerListToggle();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/20 hover:bg-black/60 hover:border-white/30 transition-all duration-200 hover:scale-105 shadow-lg group"
            >
              <Eye className="w-4 h-4 text-white" />
              <span className="font-medium text-white text-sm">
                {viewerCount} người xem
              </span>
            </button>
          </div>
        )}
      </>
    );
  }
);

StoryActions.displayName = "StoryActions";
