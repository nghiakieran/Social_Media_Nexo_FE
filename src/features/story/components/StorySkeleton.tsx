import { memo } from "react"
import { cn } from "@/lib/utils"

interface StorySkeletonProps {
  isMobile?: boolean
}

export const StorySkeleton = memo(({ isMobile = false }: StorySkeletonProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full lg:w-[1298px] lg:h-[730px] lg:mx-auto lg:top-1/2 lg:-translate-y-1/2">
        {/* Left side thumbnails skeleton - desktop only */}
        <div className="hidden lg:block">
          <div
            className="absolute z-10 animate-pulse"
            style={{
              height: "280px",
              left: "0px",
              top: "50%",
              transform: "translateX(calc(-50% + 150px)) translateY(-50%)",
              width: "158px",
            }}
          >
            <div className="w-full h-full rounded-xl bg-gray-700" />
          </div>
          <div
            className="absolute z-20 animate-pulse"
            style={{
              height: "280px",
              left: "0px",
              top: "50%",
              transform: "translateX(calc(-50% + 350px)) translateY(-50%)",
              width: "158px",
            }}
          >
            <div className="w-full h-full rounded-xl bg-gray-700" />
          </div>
        </div>

        {/* Main story container skeleton */}
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
            {/* Progress bars skeleton */}
            <div className="absolute top-4 left-4 right-4 z-30">
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex-1 h-0.5 bg-gray-700 rounded-full animate-pulse" />
                ))}
              </div>
            </div>

            {/* Header skeleton */}
            <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
              </div>
            </div>

            {/* Main content skeleton */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gray-700 animate-pulse" />
            </div>

            {/* Bottom actions skeleton */}
            <div className="absolute bottom-4 left-4 right-4 z-30">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-12 bg-gray-700 rounded-full animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
              </div>
              <div className="flex items-center justify-center mt-3">
                <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Navigation arrows skeleton - desktop only */}
            <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-30">
              <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
            </div>
            <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 z-30">
              <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right side thumbnails skeleton - desktop only */}
        <div className="hidden lg:block">
          <div
            className="absolute z-20 animate-pulse"
            style={{
              height: "280px",
              left: "0px",
              top: "50%",
              transform: "translateX(calc(-50% + 970px)) translateY(-50%)",
              width: "158px",
            }}
          >
            <div className="w-full h-full rounded-xl bg-gray-700" />
          </div>
          <div
            className="absolute z-10 animate-pulse"
            style={{
              height: "280px",
              left: "0px",
              top: "50%",
              transform: "translateX(calc(-50% + 1174px)) translateY(-50%)",
              width: "158px",
            }}
          >
            <div className="w-full h-full rounded-xl bg-gray-700" />
          </div>
        </div>

        {/* Close button skeleton */}
        <div className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
      </div>
    </div>
  )
})

StorySkeleton.displayName = "StorySkeleton"

