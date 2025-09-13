import { memo } from "react"
import { cn } from "@/lib/utils"

interface StoryProgressBarProps {
  content: Array<{ id: string; duration: number }>
  currentContentIndex: number
  progress: number
}

export const StoryProgressBar = memo(({ content, currentContentIndex, progress }: StoryProgressBarProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-30">
      <div className="flex gap-1">
        {content.map((_, index) => (
          <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-white transition-all duration-200 ease-out",
                index < currentContentIndex
                  ? "w-full"
                  : index === currentContentIndex
                    ? "w-0"
                    : "w-0",
              )}
              style={index === currentContentIndex ? { width: `${progress}%` } : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
})

StoryProgressBar.displayName = "StoryProgressBar"
