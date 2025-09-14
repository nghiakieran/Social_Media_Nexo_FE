import { memo } from "react"

interface StoryThumbnailSkeletonProps {
  style: React.CSSProperties
  zIndex: number
}

export const StoryThumbnailSkeleton = memo(({ style, zIndex }: StoryThumbnailSkeletonProps) => {
  return (
    <div className="absolute animate-pulse" style={{ ...style, zIndex }}>
      <div className="w-full h-full rounded-xl overflow-hidden relative">
        <div className="w-full h-full bg-gray-700" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-center items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gray-600" />
          </div>
          <div className="h-4 w-20 bg-gray-600 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-600 rounded" />
        </div>
      </div>
    </div>
  )
})

StoryThumbnailSkeleton.displayName = "StoryThumbnailSkeleton"

