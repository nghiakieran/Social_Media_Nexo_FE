import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Story {
  id: string
  username: string
  profileImage: string
  hasNewStory: boolean
  isViewed: boolean
  isOwnStory?: boolean
  isCloseFriend?: boolean
}

interface StoriesProps {
  stories: Story[]
  onStoryClick?: (story: Story) => void
}

export function Stories({ stories, onStoryClick }: StoriesProps) {
  const [hoveredStory, setHoveredStory] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    checkScrollPosition()
  }, [stories])

  return (
    <div className="w-full overflow-hidden bg-background py-4 relative">
      {/* Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-[58px] -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white shadow-lg rounded-full transition-all duration-200"
          aria-label="Cuộn trái"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-2 top-[58px] -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white shadow-lg rounded-full transition-all duration-200"
          aria-label="Cuộn phải"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto px-4 scrollbar-hide"
        onScroll={checkScrollPosition}
      >
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col items-center gap-2 min-w-fit cursor-pointer group p-0.5"
            onClick={() => onStoryClick?.(story)}
            onMouseEnter={() => setHoveredStory(story.id)}
            onMouseLeave={() => setHoveredStory(null)}
          >
            {/* Story Ring Container */}
            <div className="relative">
              {/* Outer Ring - Story Indicator */}
              <div
                className={cn(
                  "w-20 h-20 rounded-full p-0.5 transition-all duration-200",
                  story.hasNewStory && !story.isViewed
                    ? story.isCloseFriend
                      ? "bg-gradient-to-tr from-green-400 via-blue-500 to-purple-500" // Special gradient for close friends
                      : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500" // Bright gradient for unviewed
                    : story.isViewed
                    ? "bg-gray-400" // Gray for viewed stories
                    : "bg-muted", // Default muted color
                  hoveredStory === story.id && "scale-105",
                )}
              >
                {/* Inner Ring - White Border */}
                <div className="w-full h-full rounded-full bg-background p-0.5">
                  {/* Profile Picture */}
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                      src={story.profileImage || "/placeholder.svg"}
                      alt={`${story.username}'s profile picture`}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-200 group-hover:scale-110",
                        story.isViewed && "opacity-70" // Slightly dim viewed stories
                      )}
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>

              {/* New Story Indicator Dot */}
              {story.hasNewStory && !story.isViewed && (
                <div className={cn(
                  "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background animate-pulse",
                  story.isCloseFriend
                    ? "bg-gradient-to-r from-green-400 to-blue-500" // Special gradient for close friends
                    : "bg-gradient-to-r from-yellow-400 to-pink-500" // Default gradient
                )} />
              )}

              {/* Own Story Indicator */}
              {story.isOwnStory && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              )}

              {/* Close Friend Indicator */}
              {story.isCloseFriend && !story.isOwnStory && (
                <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-white text-xs font-bold">♥</span>
                </div>
              )}
            </div>

            {/* Username */}
            <span
              className={cn(
                "text-xs font-medium text-center max-w-[80px] truncate transition-colors duration-200",
                story.hasNewStory && !story.isViewed ? "text-foreground" : "text-muted-foreground",
                hoveredStory === story.id && "text-primary",
              )}
            >
              {story.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Custom scrollbar hide utility
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`

// Inject styles
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = scrollbarHideStyles
  document.head.appendChild(style)
}

