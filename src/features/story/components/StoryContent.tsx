import { memo } from "react"
import { StoryContent as StoryContentType } from "../types"

interface StoryContentProps {
  content: StoryContentType
  username: string
  onStoryClick: (e: React.MouseEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

export const StoryContent = memo(({ 
  content, 
  username, 
  onStoryClick, 
  onTouchStart, 
  onTouchEnd 
}: StoryContentProps) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center cursor-pointer"
      onClick={onStoryClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full h-full">
        <img
          src={content.url || "/placeholder.svg"}
          alt={`${username}'s story content`}
          className="w-full h-full object-cover pointer-events-none"
          crossOrigin="anonymous"
          loading="lazy"
        />
      </div>
    </div>
  )
})

StoryContent.displayName = "StoryContent"
