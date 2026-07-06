import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/common/Loader';
import { getAllUserStories, updateCollection, getCollectionDetail } from '@/features/story/api/storyApi';
import { transformUserStoriesToStory } from '@/features/story/types';
import type { StoryContent } from '@/features/story/types';
import { useToast } from '@/hooks/use-toast';
import { VideoThumbnail } from '@/components/common/VideoThumbnail';

interface EditHighlightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  collectionId: number;
  initialName: string;
  onSuccess?: () => void;
}

export const EditHighlightDialog = ({ 
  isOpen, 
  onClose, 
  userId, 
  collectionId,
  initialName,
  onSuccess 
}: EditHighlightDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [stories, setStories] = useState<StoryContent[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [collectionStoryIds, setCollectionStoryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Infinite scroll states
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Use refs for observer to prevent re-setup
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentPageRef = useRef(0);

  // Sync refs with states
  useEffect(() => {
    hasMoreRef.current = hasMore;
    currentPageRef.current = currentPage;
    isLoadingRef.current = isLoadingMore;
  }, [hasMore, currentPage, isLoadingMore]);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName(initialName);
      setStories([]);
      setSelected({});
      setCollectionStoryIds([]);
      setCurrentPage(0);
      setHasMore(true);
      hasMoreRef.current = true;
      currentPageRef.current = 0;
      isLoadingRef.current = false;
    }
  }, [isOpen, initialName]);

  // Load initial data when dialog opens
  useEffect(() => {
    if (!isOpen || !collectionId) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load collection detail to get current stories
        const collectionResponse = await getCollectionDetail(collectionId);
        const currentStoryIds = collectionResponse.data.stories.map(s => s.storyId.toString());
        setCollectionStoryIds(currentStoryIds);

        // Load all user stories
        const storiesResponse = await getAllUserStories({ userId, pageNo: 0, pageSize: 10 });
        
        const allStoryContents: StoryContent[] = [];
        storiesResponse.data.content.forEach((userStory) => {
          const transformed = transformUserStoriesToStory(userStory, userId);
          allStoryContents.push(...transformed.content);
        });
        
        setStories(allStoryContents);
        setHasMore(!storiesResponse.data.last);
        setCurrentPage(0);
        
        // Initialize selected state with current stories in collection
        const initialSelected: Record<string, boolean> = {};
        allStoryContents.forEach((story) => {
          initialSelected[story.id] = currentStoryIds.includes(story.id);
        });
        setSelected(initialSelected);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Không thể tải dữ liệu",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isOpen, collectionId, userId, toast]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
  const canSave = name.trim().length > 0 && selectedIds.length > 0;

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Load stories for a specific page
  const loadStories = useCallback(async (page: number) => {
    if (!userId) return;
    
    const response = await getAllUserStories({ userId, pageNo: page, pageSize: 10 });
    
    const allStoryContents: StoryContent[] = [];
    response.data.content.forEach((userStory) => {
      const transformed = transformUserStoriesToStory(userStory, userId);
      allStoryContents.push(...transformed.content);
    });
    
    // If no stories returned, consider it as no more data
    const hasMoreData = !response.data.last && allStoryContents.length > 0;
    
    return {
      stories: allStoryContents,
      hasMore: hasMoreData,
    };
  }, [userId]);

  // Intersection Observer for infinite scroll - Setup ONCE
  useEffect(() => {
    if (!isOpen || !observerTarget.current) return;

    const currentTarget = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        // Use refs to always get latest values
        if (entries[0].isIntersecting && !isLoadingRef.current && hasMoreRef.current) {
          // Load more inline to avoid dependency issues
          isLoadingRef.current = true;
          setIsLoadingMore(true);
          
          const nextPage = currentPageRef.current + 1;
          loadStories(nextPage)
            .then((result) => {
              if (result) {
                // Update refs immediately FIRST to prevent duplicate calls
                hasMoreRef.current = result.hasMore;
                currentPageRef.current = nextPage;
                
                // Only update stories if we got new data
                if (result.stories.length > 0) {
                  setStories((prev) => [...prev, ...result.stories]);
                  setCurrentPage(nextPage);
                  
                  // Add new stories to selected state using functional update
                  setSelected((prevSelected) => {
                    const newSelected = { ...prevSelected };
                    result.stories.forEach((story) => {
                      if (!(story.id in newSelected)) {
                        newSelected[story.id] = collectionStoryIds.includes(story.id);
                      }
                    });
                    return newSelected;
                  });
                }
                
                // Always update hasMore state
                setHasMore(result.hasMore);
              }
            })
            .catch((error) => {
              toast({
                variant: "destructive",
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Không thể tải thêm stories",
              });
            })
            .finally(() => {
              setIsLoadingMore(false);
            });
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isOpen, isLoading, collectionStoryIds, loadStories, toast]); // Re-setup when loading state or collectionStoryIds changes

  const handleSave = async () => {
    if (!canSave) return;
    
    setIsSaving(true);
    try {
      await updateCollection({
        id: collectionId,
        userId,
        collectionName: name.trim(),
        storyList: selectedIds.map((id) => parseInt(id)),
      });
      
      toast({
        title: "Thành công!",
        description: "Đã cập nhật tin nổi bật",
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật tin nổi bật",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[480px] sm:max-w-[560px] p-0 overflow-hidden max-h-[90vh] rounded-xl">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center">Chỉnh sửa tin nổi bật</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Name input */}
          <div>
            <Input
              placeholder="Tên tin nổi bật"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Stories grid */}
          {isLoading ? (
            <div className="h-[340px] flex items-center justify-center">
              <Loader />
            </div>
          ) : stories.length === 0 && !isLoadingMore ? (
            <div className="h-[340px] flex items-center justify-center">
              <p className="text-muted-foreground">Không có tin nào</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto p-0.5">
              <div className="grid grid-cols-3 gap-2">
                {stories.map((story) => {
                  const isActive = !!selected[story.id];
                  const isVideo = story.type === 'video';
                  return (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => toggle(story.id)}
                      className={`relative aspect-[9/16] w-full rounded-md overflow-hidden ring-1 ring-border ${isActive ? 'outline outline-2 outline-primary' : ''}`}
                      aria-pressed={isActive}
                    >
                      {isVideo ? (
                        <VideoThumbnail
                          videoUrl={story.url}
                          className="w-full h-full"
                          showPlayButton={!isActive}
                        />
                      ) : (
                        <img
                          src={story.url}
                          alt="story"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      
                      {/* Selected Checkmark */}
                      {isActive && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Loading more indicator */}
              {hasMore && (
                <div ref={observerTarget} className="w-full py-4 flex justify-center">
                  {isLoadingMore && <Loader />}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-primary/10 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Hủy
            </Button>
            <Button disabled={!canSave || isSaving} onClick={handleSave}>
              {isSaving ? <Loader /> : 'Lưu'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditHighlightDialog;
