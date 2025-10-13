import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { LazyImage } from "@/components/common/LazyImage"
import { useNavigate } from "react-router-dom"

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
  showCreateButton?: boolean
  currentUserAvatar?: string
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

export function Stories({ 
  stories, 
  onStoryClick, 
  showCreateButton = false, 
  currentUserAvatar,
  onLoadMore,
  hasMore = false,
  isLoading = false
}: StoriesProps) {
  const navigate = useNavigate()
  const [hoveredStory, setHoveredStory] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastStoryRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false) // Prevent duplicate calls

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

  // Debounced load more handler
  const debouncedLoadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMore || isLoading) return
    
    isLoadingRef.current = true
    onLoadMore?.()
    
    // Reset after a delay to prevent rapid calls
    setTimeout(() => {
      isLoadingRef.current = false
    }, 1000)
  }, [onLoadMore, hasMore, isLoading])

  // Reset loading ref when isLoading changes
  useEffect(() => {
    if (!isLoading) {
      isLoadingRef.current = false
    }
  }, [isLoading])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Don't setup observer if conditions aren't met
    if (!onLoadMore || !hasMore || isLoading || !lastStoryRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Only trigger if intersecting and not already loading
        if (entries[0].isIntersecting && !isLoadingRef.current) {
          debouncedLoadMore()
        }
      },
      { threshold: 0.5, rootMargin: '50px' }
    )

    const currentRef = lastStoryRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [onLoadMore, hasMore, isLoading, stories.length, debouncedLoadMore])

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
        {/* Create Story Button - Desktop only */}
        {showCreateButton && (
          <div
            className="hidden md:flex flex-col items-center gap-2 min-w-fit cursor-pointer group p-0.5"
            onClick={() => navigate('/stories/create')}
          >
            {/* Story Ring Container */}
            <div className="relative">
              {/* Outer Ring with Gradient */}
              <div className="w-20 h-20 rounded-full p-0.5 transition-all duration-200 bg-gradient-to-tr from-purple-400 via-pink-500 to-orange-400 group-hover:scale-105">
                {/* Inner Ring - White Border */}
                <div className="w-full h-full rounded-full bg-background p-0.5">
                  {/* Profile Picture or Placeholder */}
                  <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {currentUserAvatar ? (
                      <LazyImage
                        src={currentUserAvatar}
                        alt="Your profile"
                        className="w-full h-full rounded-full"
                        loading="lazy"
                        decoding="async"
                        enableProgressiveLoading
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Plus Icon */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Label */}
            <span className="text-xs font-medium text-center max-w-[80px] truncate text-foreground group-hover:text-primary transition-colors duration-200">
              Tạo tin
            </span>
          </div>
        )}

        {stories.map((story, index) => {
          const isLastStory = index === stories.length - 1
          return (
            <div
              key={story.id}
              ref={isLastStory ? lastStoryRef : null}
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
                    <LazyImage
                      src={story.profileImage || "/placeholder.svg"}
                      alt={`${story.username}'s profile picture`}
                      className={cn(
                        "w-full h-full rounded-full",
                        story.isViewed && "opacity-70"
                      )}
                      loading="lazy"
                      decoding="async"
                      enableProgressiveLoading
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
        )})}

        {/* Loading More Indicator */}
        {isLoading && stories.length > 0 && (
          <div className="flex items-center justify-center min-w-fit px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        )}
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
