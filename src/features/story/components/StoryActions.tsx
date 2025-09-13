import { memo } from "react"
import { Heart, Send, Eye, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface StoryActionsProps {
  replyText: string
  isLiked: boolean
  viewerCount: number
  showReactions: boolean
  showQuickReply: boolean
  isOwnStory?: boolean
  showViewerList?: boolean
  onReplyChange: (text: string) => void
  onSendReply: () => void
  onLike: () => void
  onShare: () => void
  onReactionToggle: () => void
  onQuickReply: (reply: string) => void
  onReactionClick: (emoji: string) => void
  onViewerListToggle: () => void
}

const quickReactions = ["😂", "😮", "😍", "😢", "👏", "🔥", "🎉", "💯"]
const quickReplies = ["🔥", "😍", "Amazing!", "Love this!", "So cool!"]

export const StoryActions = memo(({
  replyText,
  isLiked,
  viewerCount,
  showReactions,
  showQuickReply,
  isOwnStory = false,
  showViewerList = false,
  onReplyChange,
  onSendReply,
  onLike,
  onShare,
  onReactionToggle,
  onQuickReply,
  onReactionClick,
  onViewerListToggle
}: StoryActionsProps) => {
  return (
    <>
      <div className="absolute bottom-20 left-4 right-4 z-30">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-b-lg pointer-events-none" />
        
        {showReactions && (
          <div className="mb-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-2xl">
              <h3 className="text-white text-lg font-semibold mb-4 text-center">Quick Reactions</h3>
              <div className="grid grid-cols-4 gap-3">
                {quickReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation()
                      onReactionClick(emoji)
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
                      e.stopPropagation()
                      onQuickReply(reply)
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-lg pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Send message"
              value={replyText}
              onChange={(e) => onReplyChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation()
                  onSendReply()
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 rounded-full bg-black/40 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/60 focus:bg-white/10 text-sm transition-all duration-200"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReactionToggle()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-black/30 backdrop-blur-sm rounded-full p-1"
            >
              😊
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onLike()
            }}
            className={cn(
              "p-2.5 transition-all duration-200 rounded-full bg-black/30 backdrop-blur-sm",
              isLiked
                ? "text-red-500 bg-red-500/20 scale-110"
                : "text-white/90 hover:text-red-500 hover:bg-white/10",
            )}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onShare()
            }}
            className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 bg-black/30 backdrop-blur-sm"
          >
            <Send className="w-6 h-6" />
          </button>

        </div>

        {/* Viewer count - only show for own stories */}
        {isOwnStory && (
          <div className="flex items-center justify-center mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onViewerListToggle()
              }}
              className="flex items-center gap-1 text-white/60 hover:text-white text-xs bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>{viewerCount} views</span>
            </button>
          </div>
        )}

        {/* Viewer List Modal */}
        {showViewerList && isOwnStory && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Story Views
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewerListToggle()
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {viewerCount} people viewed your story
                </p>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {Array.from({ length: Math.min(viewerCount, 20) }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {String.fromCharCode(65 + (index % 26))}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          User {index + 1}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.floor(Math.random() * 60)} minutes ago
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
})

StoryActions.displayName = "StoryActions"
