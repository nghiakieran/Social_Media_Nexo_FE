import { useState, useEffect, useRef, useCallback, memo } from "react"
import { cn } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight, Flag, Share, UserMinus, Bookmark, Eye, Archive, Trash2 } from "lucide-react"
import { StoryViewerProps, Story } from "../types"
import { StoryThumbnail } from "./StoryThumbnail"
import { StoryProgressBar } from "./StoryProgressBar"
import { StoryHeader } from "./StoryHeader"
import { StoryContent } from "./StoryContent"
import { StoryActions } from "./StoryActions"
import { StorySkeleton } from "./StorySkeleton"
import { useAppDispatch } from "@/store"
import { deleteStoryThunk, archiveStoryThunk, viewStoryThunk, markStoryAsSeen, removeStoryContent } from "../storySlice"
import { useToast } from "@/hooks/use-toast"

export const StoryViewer = memo(({
  isOpen,
  onClose,
  stories,
  initialStoryIndex,
  initialContentIndex = 0,
  isArchivePage = false,
}: StoryViewerProps) => {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex)
  const [currentContentIndex, setCurrentContentIndex] = useState(initialContentIndex)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [replyText, setReplyText] = useState("")
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showQuickReply, setShowQuickReply] = useState(false)
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 100) + 50)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [showViewerList, setShowViewerList] = useState(false)
  const [, forceUpdate] = useState({}) // Force re-render helper
  
  const holdTimeoutRef = useRef<NodeJS.Timeout>()
  const progressInterval = useRef<NodeJS.Timeout>()
  // Track viewed stories in current session to prevent duplicate calls
  const viewedStoriesRef = useRef<Set<string>>(new Set())

  const currentStory = stories[currentStoryIndex]
  const currentContent = currentStory?.content[currentContentIndex]

  // Call View Story API when viewing a story
  useEffect(() => {
    // Only call view API if ALL conditions are met:
    // 1. Story exists
    // 2. Content exists
    // 3. NOT own story (don't track views on own stories)
    // 4. NOT already seen from API (isSeen = false or undefined)
    // 5. NOT already viewed in this session (prevent duplicate API calls)
    //
    // Example flow for user with 3 stories:
    // Story 1 (isSeen: false) → Call API ✓
    // Story 2 (isSeen: false) → Call API ✓
    // Story 3 (isSeen: true)  → Skip API ✗
    if (
      currentStory && 
      currentContent && 
      !currentStory.isOwnStory && 
      !currentContent.isSeen &&
      !viewedStoriesRef.current.has(currentContent.id)
    ) {
      const storyId = parseInt(currentContent.id)
      if (!isNaN(storyId)) {
        // Mark as viewed in session to prevent duplicate calls
        viewedStoriesRef.current.add(currentContent.id)
        
        // Call view API and update local state on success
        dispatch(viewStoryThunk(storyId))
          .unwrap()
          .then(() => {
            // Cập nhật state sau khi xem, không cần gọi lại API get list
            dispatch(markStoryAsSeen({ 
              userId: currentStory.id, 
              storyId: currentContent.id 
            }))
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
  }, [currentStory, currentContent, dispatch])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Loading simulation
  useEffect(() => {
    if (isOpen && currentStory && currentContent) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 800) // Simulate loading time
      return () => clearTimeout(timer)
    } else {
      setIsLoading(true)
    }
  }, [isOpen, currentStory, currentContent])

  // Progress management
  useEffect(() => {
    if (!isOpen || isPaused || !currentContent) return

    const duration = currentContent.duration * 1000
    const interval = 50

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (interval / duration) * 100

        if (newProgress >= 100) {
          if (currentContentIndex < currentStory.content.length - 1) {
            setCurrentContentIndex((prev) => prev + 1)
            return 0
          } else if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex((prev) => prev + 1)
            setCurrentContentIndex(0)
            return 0
          } else {
            onClose()
            return 100
          }
        }
        return newProgress
      })
    }, interval)

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isOpen, isPaused, currentContent, currentContentIndex, currentStoryIndex, stories.length, currentStory?.content.length, onClose])

  useEffect(() => {
    setProgress(0)
  }, [currentContentIndex, currentStoryIndex])

  // Simple navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex((prev) => prev - 1)
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1)
      setCurrentContentIndex(stories[currentStoryIndex - 1].content.length - 1)
    }
  }, [currentContentIndex, currentStoryIndex, stories])

  const handleNext = useCallback(() => {
    if (currentContentIndex < currentStory.content.length - 1) {
      setCurrentContentIndex((prev) => prev + 1)
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1)
      setCurrentContentIndex(0)
    } else {
      onClose()
    }
  }, [currentContentIndex, currentStoryIndex, currentStory?.content.length, stories.length, onClose])

  // Action handlers
  const handleReactionClick = useCallback((emoji: string) => {
    console.log(`Reacted with ${emoji} to ${currentStory.username}'s story`)
    setShowReactions(false)
  }, [currentStory?.username])

  const handleSendReply = useCallback(() => {
    if (replyText.trim()) {
      console.log(`Reply sent to ${currentStory.username}: ${replyText}`)
      setReplyText("")
    }
  }, [replyText, currentStory?.username])

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked)
    console.log(`${isLiked ? "Unliked" : "Liked"} ${currentStory.username}'s story`)
  }, [isLiked, currentStory?.username])

  const handleShare = useCallback(() => {
    console.log(`Shared ${currentStory.username}'s story`)
  }, [currentStory?.username])


  const handleQuickReply = useCallback((reply: string) => {
    console.log(`Quick reply sent to ${currentStory.username}: ${reply}`)
    setReplyText("")
  }, [currentStory?.username])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return

    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("input") || target.closest('[role="button"]')) {
      return
    }

    setIsHolding(true)
    holdTimeoutRef.current = setTimeout(() => {
      setIsPaused(true)
    }, 100)
  }, [isMobile])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile) return

    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current)
    }

    if (isHolding) {
      setIsHolding(false)
      if (isPaused) {
        setIsPaused(false)
      }
    }
  }, [isMobile, isHolding, isPaused])

  const handleStoryClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("input") || target.closest('[role="button"]')) {
      return
    }

    if (!isMobile) {
      setIsPaused(!isPaused)
    }
  }, [isMobile, isPaused])

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
      if (e.key === " ") {
        e.preventDefault()
        setIsPaused(!isPaused)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, isPaused, onClose, handlePrevious, handleNext])

  if (!isOpen || !currentStory || !currentContent) return null

  if (isLoading) {
    return <StorySkeleton isMobile={isMobile} showSideThumbnails={stories.length > 1} />
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full lg:w-[1298px] lg:h-[730px] lg:mx-auto lg:top-1/2 lg:-translate-y-1/2">
        {/* Left side thumbnails - desktop only */}
        <div className="hidden lg:block">
          {/* Near left thumbnail (closest to center) */}
          {currentStoryIndex > 0 && (
            <StoryThumbnail
              story={stories[currentStoryIndex - 1]}
              onClick={() => {
                setCurrentStoryIndex(currentStoryIndex - 1)
                setCurrentContentIndex(0)
              }}
              style={{
                height: "280px",
                left: "0px",
                top: "50%",
                transform: "translateX(calc(-50% + 328px)) translateY(-50%)",
                width: "158px",
              }}
              zIndex={20}
            />
          )}

          {/* Far left thumbnail (furthest from center) */}
          {currentStoryIndex > 1 && (
            <StoryThumbnail
              story={stories[currentStoryIndex - 2]}
              onClick={() => {
                setCurrentStoryIndex(currentStoryIndex - 2)
                setCurrentContentIndex(0)
              }}
              style={{
                height: "280px",
                left: "0px",
                top: "50%",
                transform: "translateX(calc(-50% + 125px)) translateY(-50%)",
                width: "158px",
              }}
              zIndex={10}
            />
          )}
        </div>

        {/* Main story container */}
        <div
          className={cn(
            "absolute inset-0 z-30",
            "w-full h-full",
            "lg:w-[394px] lg:h-[701px] lg:left-0 lg:top-0"
          )}
          style={isMobile ? {} : {
            height: "701px",
            left: "0px",
            position: "absolute",
            transform: "translateX(calc(-50% + 649px))",
            width: "394px",
          }}
        >
          <div className="relative w-full h-full">
            <StoryProgressBar
              content={currentStory.content}
              currentContentIndex={currentContentIndex}
              progress={progress}
            />

            <StoryHeader
              story={currentStory}
              isMuted={isMuted}
              isPaused={isPaused}
              isMobile={isMobile}
              onMuteToggle={() => setIsMuted(!isMuted)}
              onPauseToggle={() => setIsPaused(!isPaused)}
              onMenuToggle={() => {
                if (isMenuLoading) return
                setShowMenu(!showMenu)
              }}
              onClose={onClose}
            />

            <StoryContent
              content={currentContent}
              username={currentStory.username}
              onStoryClick={handleStoryClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />

            <StoryActions
              replyText={replyText}
              isLiked={isLiked}
              viewerCount={viewerCount}
              showReactions={showReactions}
              showQuickReply={showQuickReply}
              isOwnStory={currentStory.isOwnStory}
              isCloseFriend={currentStory.isCloseFriend}
              onReplyChange={setReplyText}
              onSendReply={handleSendReply}
              onLike={handleLike}
              onShare={handleShare}
              onReactionToggle={() => setShowReactions(!showReactions)}
              onQuickReply={handleQuickReply}
              onReactionClick={handleReactionClick}
              onViewerListToggle={() => setShowViewerList(!showViewerList)}
            />

            {/* Navigation arrows - desktop only */}
            <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 z-30">
              {currentStoryIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevious()
                  }}
                  className="p-3 text-white/80 hover:text-white transition-all duration-200 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 shadow-lg"
                  aria-label="Quay lại"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
            </div>

            <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 z-30">
              {currentStoryIndex < stories.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="p-3 text-white/80 hover:text-white transition-all duration-200 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 shadow-lg"
                  aria-label="Tiếp"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Mobile navigation areas */}
            <div
              className="lg:hidden absolute left-0 top-0 w-1/3 h-full z-20"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
            />
            <div
              className="lg:hidden absolute right-0 top-0 w-1/3 h-full z-20"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
            />
          </div>
        </div>

        {/* Right side thumbnails - desktop only */}
        <div className="hidden lg:block">
          {currentStoryIndex < stories.length - 1 && (
            <StoryThumbnail
              story={stories[currentStoryIndex + 1]}
              onClick={() => {
                setCurrentStoryIndex(currentStoryIndex + 1)
                setCurrentContentIndex(0)
              }}
              style={{
                height: "280px",
                left: "0px",
                top: "50%",
                transform: "translateX(calc(-50% + 970px)) translateY(-50%)",
                width: "158px",
              }}
              zIndex={20}
            />
          )}

          {currentStoryIndex < stories.length - 2 && (
            <StoryThumbnail
              story={stories[currentStoryIndex + 2]}
              onClick={() => {
                setCurrentStoryIndex(currentStoryIndex + 2)
                setCurrentContentIndex(0)
              }}
              style={{
                height: "280px",
                left: "0px",
                top: "50%",
                transform: "translateX(calc(-50% + 1174px)) translateY(-50%)",
                width: "158px",
              }}
              zIndex={10}
            />
          )}
        </div>

        {/* Close button - desktop only */}
        {!isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-4 right-4 z-40 p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 bg-black/30 backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
      )}

      {/* Menu */}
      {showMenu && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl py-2 min-w-[300px] z-50 shadow-2xl border border-gray-200 dark:border-gray-600 animate-in fade-in-0 zoom-in-95 duration-200">
          {currentStory.isOwnStory ? (
            // Own story menu
            <>
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  setIsMenuLoading(true)
                  
                  try {
                    const storyId = parseInt(currentContent.id)
                    const totalStories = currentStory.content.length
                    const currentIndex = currentContentIndex
                    
                    await dispatch(deleteStoryThunk(storyId)).unwrap()
                    
                    // Update local state - remove story content
                    dispatch(removeStoryContent({ 
                      userId: currentStory.id, 
                      storyId: currentContent.id,
                      fromArchive: isArchivePage
                    }))
                    
                    toast({
                      title: "Đã xóa tin",
                      description: "Tin của bạn đã được xóa thành công",
                    })

                    // Navigate based on remaining stories (no loading state needed)
                    if (totalStories <= 1) {
                      // No more stories left, close viewer
                      onClose()
                    } else if (currentIndex < totalStories - 1) {
                      // Story deleted is not the last one
                      // Just reset progress, React will re-render with new story automatically
                      setProgress(0)
                    } else if (currentIndex > 0) {
                      // Deleted last story, move to previous
                      setCurrentContentIndex(currentIndex - 1)
                      setProgress(0)
                    } else {
                      onClose()
                    }
                  } catch (error) {
                    const err = error as { message?: string }
                    toast({
                      title: "Lỗi",
                      description: err.message || "Không thể xóa tin",
                      variant: "destructive",
                    })
                  } finally {
                    setIsMenuLoading(false)
                  }
                }}
                className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tin
              </button>
              {!isArchivePage && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    setIsMenuLoading(true)
                    
                    try {
                      // Archive the CURRENT story content being viewed
                      const storyId = parseInt(currentContent.id)
                      const totalStories = currentStory.content.length
                      const currentIndex = currentContentIndex
                      
                      await dispatch(archiveStoryThunk(storyId)).unwrap()
                      
                      // Update local state - remove story content from active stories
                      dispatch(removeStoryContent({ 
                        userId: currentStory.id, 
                        storyId: currentContent.id 
                      }))
                      
                      toast({
                        title: "Đã lưu vào kho lưu trữ",
                        description: "Tin đã được chuyển vào kho lưu trữ",
                      })
                      
                      // Wait a bit for Redux state to update and propagate to props
                      setTimeout(() => {
                        // Force re-render to get updated stories from props
                        forceUpdate({})
                        
                        // Navigate based on remaining stories
                        if (totalStories <= 1) {
                          // No more stories left, close viewer
                          onClose()
                        } else if (currentIndex < totalStories - 1) {
                          // We archived a story that's not the last one
                          // Stay at same index (it will now show the next story)
                          setProgress(0)
                          setCurrentContentIndex(currentIndex)
                        } else if (currentIndex > 0) {
                          // We archived the last story, move to previous
                          setCurrentContentIndex(currentIndex - 1)
                          setProgress(0)
                        } else {
                          onClose()
                        }
                      }, 150)
                    } catch (error) {
                      const err = error as { message?: string }
                      toast({
                        title: "Lỗi",
                        description: err.message || "Không thể lưu trữ tin",
                        variant: "destructive",
                      })
                    } finally {
                      setIsMenuLoading(false)
                    }
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3"
                >
                  <Archive className="w-4 h-4" />
                  Lưu vào kho lưu trữ
                </button>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  setShowViewerList(true)
                }}
                className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3"
              >
                <Eye className="w-4 h-4" />
                Xem thông tin chi tiết
              </button>
            </>
          ) : (
            // Other user's story menu
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3"
              >
                <Flag className="w-4 h-4" />
                Báo cáo tin
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3"
              >
                <Share className="w-4 h-4" />
                Sao chép liên kết
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-3"
              >
                <UserMinus className="w-4 h-4" />
                Tắt tiếng {currentStory.username}
              </button>
            </>
          )}
        </div>
      )}

      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
})

StoryViewer.displayName = "StoryViewer"
