import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Archive as ArchiveIcon } from "lucide-react";
import { StoryViewer } from "../components/StoryViewer";
import { cn } from "@/lib/utils";
import type { Story } from "../types";
import { useAppDispatch, useAppSelector } from "@/store";
import { getAllUserStoriesThunk } from "../storySlice";
import { Loader } from "@/components/common/Loader";
import { formatArchiveDate } from "@/utils/timeFormat";

export const ArchivePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { archivedStories, isLoading, archivedHasMore, archivedCurrentPage } = useAppSelector((state) => state.story);
  
  const [openViewer, setOpenViewer] = useState(false);
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);
  
  const lastElementRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentPageRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Sync refs with Redux state
  useEffect(() => {
    hasMoreRef.current = archivedHasMore;
    currentPageRef.current = archivedCurrentPage;
    isLoadingRef.current = isLoading;
  }, [archivedHasMore, archivedCurrentPage, isLoading]);

  // Load archived stories on mount
  useEffect(() => {
    if (user) {
      dispatch(getAllUserStoriesThunk({ userId: user.id, pageNo: 0, pageSize: 10 }));
    }
  }, [dispatch, user]);

  // Intersection Observer for infinite scroll - Setup ONCE
  useEffect(() => {
    if (!user) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Use refs to always get latest values
        if (
          entries[0].isIntersecting && 
          !isLoadingRef.current && 
          hasMoreRef.current
        ) {
          const nextPage = currentPageRef.current + 1;
          
          dispatch(getAllUserStoriesThunk({ userId: user.id, pageNo: nextPage, pageSize: 10 }));
        }
      },
      { threshold: 0.8 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [user, dispatch]); // Setup only once

  const handleOpenArchive = (story: Story) => {
    // Find the index in the grouped stories
    const storyIndex = archivedStories.findIndex(s => s.id === story.id);
    setInitialStoryIndex(storyIndex >= 0 ? storyIndex : 0);
    setOpenViewer(true);
  };

  // Group archived stories by date (day level) - memoized to prevent re-compute
  const groupedStories = useMemo(() => {
    const groups: { [key: string]: Story } = {};
    
    archivedStories.forEach(story => {
      if (!story.content || story.content.length === 0) return;
      
      // Use first content's date to represent the group
      const dateStr = story.content[0]?.createdAt || story.timeAgo;
      const date = new Date(dateStr);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!groups[dateKey]) {
        groups[dateKey] = story;
      } else {
        // Merge content from same day
        groups[dateKey] = {
          ...groups[dateKey],
          content: [...groups[dateKey].content, ...story.content]
        };
      }
    });
    
    return Object.values(groups);
  }, [archivedStories]);

  // Attach/detach observer when ref or conditions change
  useEffect(() => {
    const currentRef = lastElementRef.current;
    const observer = observerRef.current;
    
    if (currentRef && observer) {
      observer.observe(currentRef);
      return () => {
        observer.unobserve(currentRef);
      };
    }
  }, [groupedStories.length]); // Re-attach when stories change

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-accent rounded-full transition-colors"
                aria-label="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Kho lưu trữ</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-6">
            <button
              className={cn(
                "py-3 px-1 text-sm font-medium border-b-2 border-primary transition-colors",
                "flex items-center gap-2"
              )}
            >
              <ArchiveIcon className="w-3 h-3" />
              <span>Tin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Tin đã lưu trữ chỉ hiển thị với mình bạn, trừ khi bạn chọn chia sẻ.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && archivedStories.length === 0 && (
          <div className="flex justify-center py-16">
            <Loader />
          </div>
        )}

        {/* Archive Grid */}
        {!isLoading && archivedStories.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2">
            {groupedStories.map((story, index) => {
              const isLastItem = index === groupedStories.length - 1;
              const shouldAttachRef = isLastItem && archivedHasMore && !isLoading;
              const firstContent = story.content[0];
              const dateToFormat = firstContent?.createdAt || story.timeAgo;
              const { day, month, year, showYear } = formatArchiveDate(dateToFormat);
              const contentLength = story.content?.length || 0;

              return (
                <div
                  key={`${story.id}-${index}`}
                  ref={shouldAttachRef ? lastElementRef : null}
                >
                  <button
                    onClick={() => handleOpenArchive(story)}
                    className="relative aspect-[9/16] group cursor-pointer overflow-hidden rounded-sm hover:opacity-90 transition-opacity w-full"
                  >
                  {/* Thumbnail */}
                  <img
                    src={firstContent?.url || "/placeholder.svg"}
                    alt={`Archive from ${dateToFormat}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Date Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-left">
                    <div className="text-lg font-bold leading-none">{day}</div>
                    <div className="text-[10px] leading-none mt-0.5">{month}</div>
                    {showYear && (
                      <div className="text-[10px] leading-none opacity-80">
                        {year}
                      </div>
                    )}
                  </div>

                  {/* Multiple Stories Indicator */}
                  {contentLength > 1 && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/60 rounded-full px-2 py-1">
                        <span className="text-white text-xs font-bold">
                          {contentLength}
                        </span>
                      </div>
                    </div>
                  )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading More Indicator */}
        {isLoading && archivedStories.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && archivedStories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ArchiveIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có tin nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Tin bạn lưu trữ sẽ xuất hiện ở đây
            </p>
          </div>
        )}
      </div>

      {/* Story Viewer */}
      {openViewer && (
        <StoryViewer
          isOpen={openViewer}
          onClose={() => setOpenViewer(false)}
          stories={archivedStories}
          initialStoryIndex={initialStoryIndex}
          isArchivePage={true}
        />
      )}
    </div>
  );
};

