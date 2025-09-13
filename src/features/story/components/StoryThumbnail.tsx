import { memo } from "react"
import { cn } from "@/lib/utils"
import { Story } from "../types"

interface StoryThumbnailProps {
  story: Story
  onClick: () => void
  style: React.CSSProperties
  zIndex: number
}

export const StoryThumbnail = memo(({ story, onClick, style, zIndex }: StoryThumbnailProps) => {
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
            : "ring-2 ring-yellow-400" // Unviewed stories have bright ring
        )}
      >
        <img
          src={story.content[0].url || "/placeholder.svg"}
          alt="Story thumbnail"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          loading="lazy"
        />
        <div className={cn(
          "absolute inset-0 transition-colors",
          story.isViewed 
            ? "bg-black/30 group-hover:bg-black/20" // Viewed stories are darker
            : "bg-black/10 group-hover:bg-black/5" // Unviewed stories are brighter
        )} />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-3 mb-2">
            <img
              src={story.profileImage || "/placeholder.svg"}
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-white/30"
              crossOrigin="anonymous"
              loading="lazy"
            />
          </div>
          <div className="text-white text-sm font-medium truncate">
            {story.username}
          </div>
          <div className="text-white/80 text-xs">
            {story.timeAgo === "Sponsored" ? (
              <div className="bg-white/20 px-2 py-1 rounded text-xs inline-block">Sponsored</div>
            ) : (
              story.timeAgo
            )}
          </div>
        </div>
      </button>
    </div>
  )
})

StoryThumbnail.displayName = "StoryThumbnail"
