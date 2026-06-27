import { useEffect, useState, useCallback } from "react";
import { UserCheck, UserX, Clock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FollowRequestUser } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { formatTimeAgoShort } from "@/utils/timeFormat";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchFollowRequestsAsync } from "../profileSlice";

interface FollowRequestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  followRequests: FollowRequestUser[];
  onAccept: (username: string) => void;
  onReject: (username: string) => void;
  isLoading?: boolean;
}

export const FollowRequestsDialog = ({
  isOpen,
  onClose,
  followRequests,
  onAccept,
  onReject,
  isLoading = false,
}: FollowRequestsDialogProps) => {
  const dispatch = useAppDispatch();
  const [localRequests, setLocalRequests] = useState(followRequests);
  const { toast } = useToast();

  // Get pagination state from store
  const { requestsHasMore, requestsPage } = useAppSelector(
    (state) => state.profile
  );

  useEffect(() => {
    if (isOpen) {
      setLocalRequests(followRequests);
    }
  }, [isOpen, followRequests]);

  // Load more handler for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!requestsHasMore || isLoading) return;

    const nextPage = requestsPage + 1;
    dispatch(fetchFollowRequestsAsync({ pageNo: nextPage, pageSize: 10 }));
  }, [requestsHasMore, isLoading, requestsPage, dispatch]);

  // Use infinite scroll hook
  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: requestsHasMore,
    isLoading,
    threshold: 100,
  });

  const handleAccept = (username: string) => {
    onAccept(username);
    setLocalRequests((prev) =>
      prev.filter((request) => request.userName !== username)
    );

    const user = localRequests.find((r) => r.userName === username);
    toast({
      title: "Đã chấp nhận",
      description: `Bạn đã chấp nhận ${user?.userName} theo dõi`,
    });
  };

  const handleReject = (username: string) => {
    onReject(username);
    setLocalRequests((prev) =>
      prev.filter((request) => request.userName !== username)
    );

    const user = localRequests.find((r) => r.userName === username);
    toast({
      title: "Đã từ chối",
      description: `Bạn đã từ chối ${user?.userName} theo dõi`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[560px] mx-auto bg-background p-0 overflow-hidden">
        <DialogHeader className="relative border-b border-border p-3">
          <DialogTitle className="text-center text-base font-semibold">
            Yêu cầu theo dõi
          </DialogTitle>
        </DialogHeader>

        <div className="p-3">
          {localRequests.length === 0 ? (
            <div className="h-[340px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Không có yêu cầu theo dõi nào</p>
              </div>
            </div>
          ) : (
            <div className="h-[340px] overflow-y-auto space-y-1.5">
              {localRequests.map((request, index) => {
                const isLastItem = index === localRequests.length - 1;

                return (
                  <div
                    key={request.userName}
                    ref={isLastItem ? lastElementRef : null}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-primary/10 dark:hover:bg-primary/15 border-b border-border/40 sm:border-none"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                      <Avatar className="w-11 h-11 shrink-0">
                        <AvatarImage
                          src={request.avatar}
                          alt={request.userName}
                        />
                        <AvatarFallback>
                          {request.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm leading-5 truncate">
                          {request.userName}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {request.fullName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto grid grid-cols-2 sm:flex">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAccept(request.userName)}
                        disabled={isLoading}
                        className="text-xs gap-1 w-full justify-center"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(request.userName)}
                        disabled={isLoading}
                        className="text-xs gap-1 w-full justify-center"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Từ chối
                      </Button>
                    </div>
                  </div>

                );
              })}

              {/* Loading indicator */}
              {isLoading && localRequests.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Đang tải...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
