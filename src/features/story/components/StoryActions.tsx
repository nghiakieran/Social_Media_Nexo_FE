import { memo } from "react";
import { Heart, Send, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryActionsProps {
  replyText: string;
  isLiked: boolean;
  viewerCount: number;
  showReactions: boolean;
  showQuickReply: boolean;
  isOwnStory?: boolean;
  isCloseFriend?: boolean;
  onReplyChange: (text: string) => void;
  onSendReply: () => void;
  onLike: () => void;
  onShare: () => void;
  onReactionToggle: () => void;
  onQuickReply: (reply: string) => void;
  onReactionClick: (emoji: string) => void;
  onViewerListToggle: () => void;
  showSendButton?: boolean;
}

const quickReactions = ["😂", "😮", "😍", "😢", "👏", "🔥", "🎉", "💯"];
const quickReplies = ["🔥", "😍", "Amazing!", "Love this!", "So cool!"];

export const StoryActions = memo(
  ({
    replyText,
    isLiked,
    viewerCount,
    showReactions,
    showQuickReply,
    isOwnStory = false,
    isCloseFriend = false,
    onReplyChange,
    onSendReply,
    onLike,
    onShare,
    onReactionToggle,
    onQuickReply,
    onReactionClick,
    onViewerListToggle,
    showSendButton = false,
  }: StoryActionsProps) => {
    return (
      <>
        <div className="absolute bottom-20 left-4 right-4 z-30">
          {showReactions && (
            <div className="mb-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-2xl">
                <h3 className="text-white text-lg font-semibold mb-4 text-center">
                  Quick Reactions
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {quickReactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReactionClick(emoji);
                      }}
                      className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl hover:bg-white/20 hover:scale-110 transition-all duration-200 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showQuickReply && (
            <div className="mb-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-4 border border-white/10">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickReply(reply);
                      }}
                      className="px-4 py-2 bg-white/10 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

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
                {showSendButton ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendReply();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-blue-500 hover:bg-blue-600 transition-colors rounded-full p-1 flex items-center justify-center w-8 h-8"
                    disabled={!replyText.trim()}
                    tabIndex={0}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReactionToggle();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-black/30 backdrop-blur-sm rounded-full p-1"
                  >
                    😊
                  </button>
                )}
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
                  onShare();
                }}
                className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 bg-black/30 backdrop-blur-sm"
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
