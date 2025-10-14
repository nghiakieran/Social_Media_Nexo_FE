import { memo } from "react"
import { cn } from "@/lib/utils"
import { Story } from "../types"
import { LazyImage } from "@/components/common/LazyImage"
import { formatTimeAgo } from "@/utils/timeFormat"

interface StoryThumbnailProps {
  story: Story
  onClick: () => void
  style: React.CSSProperties
  zIndex: number
}

export const StoryThumbnail = memo(({ story, onClick, style, zIndex }: StoryThumbnailProps) => {
  // Safe check for content
  const firstContent = story.content?.[0];
  if (!firstContent) {
    return null; // Don't render if no content
  }

  return (
    <div className="absolute" style={{ ...style, zIndex }}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className={cn(
          "w-full h-full rounded-xl overflow-hidden relative group",
          story.isViewed 
            ? "ring-2 ring-gray-400" // Viewed stories have gray ring
            : story.isCloseFriend
            ? "ring-2 ring-green-400" // Close friends have green ring
            : "ring-2 ring-yellow-400" // Unviewed stories have bright ring
        )}
      >
        <LazyImage
          src={firstContent.url || "/placeholder.svg"}
          alt="Story thumbnail"
          className="w-full h-full"
          loading="lazy"
          decoding="async"
          enableProgressiveLoading
        />
        <div className={cn(
          "absolute inset-0 transition-colors",
          story.isViewed 
            ? "bg-black/30 group-hover:bg-black/20" // Viewed stories are darker
            : "bg-black/10 group-hover:bg-black/5" // Unviewed stories are brighter
        )} />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-center items-center space-x-3 mb-2">
            <div className="relative">
              <LazyImage
                src={story.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-white/30"
                loading="lazy"
                decoding="async"
                enableProgressiveLoading
              />
              {/* Close Friend Indicator */}
              {story.isCloseFriend && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">♥</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-white text-sm font-medium truncate">
            {story.username}
          </div>
          <div className="text-white/80 text-xs">
            {story.timeAgo === "Sponsored" ? (
              <div className="bg-white/20 px-2 py-1 rounded text-xs inline-block">Sponsored</div>
            ) : (
              formatTimeAgo(story.timeAgo)
            )}
          </div>
        </div>
      </button>
    </div>
  )
})

StoryThumbnail.displayName = "StoryThumbnail"
