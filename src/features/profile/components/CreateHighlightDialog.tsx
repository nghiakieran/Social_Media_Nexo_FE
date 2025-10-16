import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/common/Loader';
import { getAllUserStories, createCollection } from '@/features/story/api/storyApi';
import { transformUserStoriesToStory } from '@/features/story/types';
import type { StoryContent } from '@/features/story/types';
import { useToast } from '@/hooks/use-toast';

interface CreateHighlightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess?: () => void;
}

export const CreateHighlightDialog = ({ isOpen, onClose, userId, onSuccess }: CreateHighlightDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [stories, setStories] = useState<StoryContent[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Infinite scroll states
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
      setStep(1);
      setName('');
      setStories([]);
      setSelected({});
      setCurrentPage(0);
      setHasMore(true);
      hasMoreRef.current = true;
      currentPageRef.current = 0;
      isLoadingRef.current = false;
    }
  }, [isOpen]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
  const canGoNext = name.trim().length > 0;
  const canCreate = selectedIds.length > 0;

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Load stories for a specific page
  const loadStories = useCallback(async (page: number) => {
    if (!userId) return;
    
    const response = await getAllUserStories({ userId, pageNo: page, pageSize: 10 });
    
    // Transform and flatten all stories content
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

  // Load initial stories when going to step 2
  const handleNext = async () => {
    if (!canGoNext) return;
    
    setIsLoading(true);
    try {
      const result = await loadStories(0);
      
      if (result) {
        setStories(result.stories);
        setHasMore(result.hasMore);
        setCurrentPage(0);
        
        // Initialize selected state
        const initialSelected: Record<string, boolean> = {};
        result.stories.forEach((story) => {
          initialSelected[story.id] = false;
        });
        setSelected(initialSelected);
      }
      
      setStep(2);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải stories",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Intersection Observer for infinite scroll - Setup ONCE
  useEffect(() => {
    if (step !== 2 || !observerTarget.current) return;

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
                        newSelected[story.id] = false;
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
  }, [step, loadStories, toast]); // Setup only once when step changes

  const handleCreate = async () => {
    if (!canCreate) return;
    
    setIsSaving(true);
    try {
      await createCollection({
        id: 0,
        userId,
        collectionName: name.trim(),
        storyList: selectedIds.map((id) => parseInt(id)),
      });
      
      toast({
        title: "Thành công!",
        description: "Đã tạo tin nổi bật mới",
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo tin nổi bật",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[560px] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center">
            {step === 1 ? 'Tin nổi bật mới' : `Chọn tin cho "${name}"`}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {step === 1 ? (
            // Step 1: Input name
            <>
              <div>
                <Input
                  placeholder="Tên tin nổi bật"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && canGoNext) {
                      handleNext();
                    }
                  }}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>Hủy</Button>
                <Button disabled={!canGoNext || isLoading} onClick={handleNext}>
                  {isLoading ? <Loader /> : 'Tiếp'}
                </Button>
              </div>
            </>
          ) : (
            // Step 2: Select stories
            <>
              {isLoading ? (
                <div className="h-[340px] flex items-center justify-center">
                  <Loader />
                </div>
              ) : stories.length === 0 && !isLoadingMore ? (
                <div className="h-[340px] flex items-center justify-center">
                  <p className="text-muted-foreground">Không có tin nào</p>
                </div>
              ) : (
                <div className="h-[340px] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {stories.map((story) => {
                      const isActive = !!selected[story.id];
                      return (
                        <button
                          key={story.id}
                          type="button"
                          onClick={() => toggle(story.id)}
                          className={`relative w-full pb-[100%] rounded-md overflow-hidden ring-1 ring-border ${isActive ? 'outline outline-2 outline-primary' : ''}`}
                          aria-pressed={isActive}
                        >
                          {story.type === 'video' ? (
                            <video
                              src={story.url}
                              className="absolute inset-0 w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={story.url}
                              alt="story"
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                          {isActive && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
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

              <div className="flex justify-between gap-2">
                <Button variant="ghost" onClick={handleBack} disabled={isSaving}>Quay lại</Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={onClose} disabled={isSaving}>Hủy</Button>
                  <Button disabled={!canCreate || isSaving} onClick={handleCreate}>
                    {isSaving ? <Loader /> : 'Lưu'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHighlightDialog;
