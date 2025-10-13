import { memo, useState, useEffect, useRef } from "react"
import { Heart, Send, Eye, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface StoryActionsProps {
  replyText: string
  isLiked: boolean
  viewerCount: number
  showReactions: boolean
  showQuickReply: boolean
  isOwnStory?: boolean
  isCloseFriend?: boolean
  onReplyChange: (text: string) => void
  onSendReply: () => void
  onLike: () => void
  onShare: () => void
  onReactionToggle: () => void
  onQuickReply: (reply: string) => void
  onReactionClick: (emoji: string) => void
  onViewerListToggle: () => void
}

interface Viewer {
  id: string
  name: string
  avatar: string
  viewedAt: string
  isCloseFriend?: boolean
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
  isCloseFriend = false,
  onReplyChange,
  onSendReply,
  onLike,
  onShare,
  onReactionToggle,
  onQuickReply,
  onReactionClick,
  onViewerListToggle
}: StoryActionsProps) => {
  const [showViewerModal, setShowViewerModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Mock viewer data
  const viewers: Viewer[] = Array.from({ length: Math.min(viewerCount, 50) }).map((_, index) => ({
    id: `viewer-${index}`,
    name: isCloseFriend ? `Bạn thân ${index + 1}` : `Người dùng ${index + 1}`,
    avatar: `https://i.pravatar.cc/40?img=${index + 1}`,
    viewedAt: `${Math.floor(Math.random() * 60)} phút trước`,
    isCloseFriend: isCloseFriend || Math.random() > 0.7,
  }))

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowViewerModal(false)
      }
    }

    if (showViewerModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showViewerModal])
  return (
    <>
      <div className="absolute bottom-20 left-4 right-4 z-30">
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

            {/* Action buttons - only show for other users' stories */}
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
        )}
      </div>

      {/* Viewer count - only show for own stories - Bottom left corner like Facebook */}
      {isOwnStory && (
        <div className="absolute bottom-4 left-4 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowViewerModal(true)
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

      {/* Viewer Modal */}
      {showViewerModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation()
            setShowViewerModal(false)
          }}
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lượt xem story</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{viewerCount} người đã xem</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowViewerModal(false)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Viewer List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {viewers.map((viewer, index) => (
                  <div
                    key={viewer.id}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {viewer.name.charAt(0)}
                      </div>
                      {viewer.isCloseFriend && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{viewer.name}</span>
                        {viewer.isCloseFriend && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                            Bạn thân
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{viewer.viewedAt}</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {isCloseFriend
                  ? "Chỉ bạn thân mới có thể xem story này"
                  : "Story này có thể được xem bởi tất cả mọi người"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

StoryActions.displayName = "StoryActions"

