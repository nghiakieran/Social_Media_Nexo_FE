import { memo } from "react"
import { useNavigate } from "react-router-dom"
import { Volume2, VolumeX, MoreHorizontal, Pause, Play, X } from "lucide-react"
import { Story, StoryContent } from "../types"
import { LazyImage } from "@/components/common/LazyImage"
import { formatTimeAgo } from "@/utils/timeFormat"
import { navigateToProfile } from "@/utils/navigation"

interface StoryHeaderProps {
  story: Story
  currentContent: StoryContent
  isMuted: boolean
  isPaused: boolean
  isMobile: boolean
  onMuteToggle: () => void
  onPauseToggle: () => void
  onMenuToggle: () => void
  onClose?: () => void
}

export const StoryHeader = memo(({ 
  story,
  currentContent,
  isMuted, 
  isPaused, 
  isMobile, 
  onMuteToggle, 
  onPauseToggle, 
  onMenuToggle,
  onClose
}: StoryHeaderProps) => {
  const navigate = useNavigate()

  const handleProfileClick = () => {
    navigateToProfile(navigate, `${story.username}`);
  }

  return (
    <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between">  
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <LazyImage
              src={story.profileImage || "/placeholder.svg"}
              alt={`${story.username}'s profile`}
              className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-white/20"
              loading="lazy"
              decoding="async"
              enableProgressiveLoading
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm truncate drop-shadow-lg">
                {story.username}
              </span>
              {story.isVerified && (
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 40 40">
                  <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" />
                </svg>
              )}
              <span className="text-white/80 text-sm flex-shrink-0 drop-shadow-lg">
                {currentContent.createdAt ? formatTimeAgo(currentContent.createdAt) : formatTimeAgo(story.timeAgo)}
              </span>
            </div>
            {story.isCloseFriend && (
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg backdrop-blur-sm border border-white/20 w-fit">
                <span className="text-xs animate-bounce">♥</span>
                <span>Bạn thân</span>
              </div>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Mute/Unmute - Only show for video content */}
        {currentContent.type === "video" && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMuteToggle()
            }}
            className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 bg-black/30 backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}

        {!isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPauseToggle()
            }}
            className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 bg-black/30 backdrop-blur-sm"
            title={isPaused ? "Phát" : "Tạm dừng"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation()
            onMenuToggle()
          }}
          className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 bg-black/30 backdrop-blur-sm"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {/* Close button for mobile */}
        {isMobile && onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 bg-black/30 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
})

StoryHeader.displayName = "StoryHeader"
