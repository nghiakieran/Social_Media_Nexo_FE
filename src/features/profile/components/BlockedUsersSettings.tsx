import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, UserMinus, Loader2, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchBlockedUsersAsync, unblockUserAsync } from "../profileSlice";
import { useDebouncedSearch } from "@/hooks/use-debounce-search";
import { SearchInput } from "@/components/common/SearchInput";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const BlockedUsersSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const {
    searchValue,
    debouncedValue,
    setSearchValue,
    clearSearch,
    isDebouncing,
  } = useDebouncedSearch("", 400);
  const [unblockingUsers, setUnblockingUsers] = useState<Set<string>>(
    new Set()
  );
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState<{
    username: string;
    fullName: string;
  } | null>(null);

  // Get data from Redux store
  const { blockedUsers, isLoading, blockedHasMore, blockedPage } =
    useAppSelector((state) => ({
      blockedUsers: state.profile.blockedUsers,
      isLoading: state.profile.isLoading,
      blockedHasMore: state.profile.blockedHasMore,
      blockedPage: state.profile.blockedPage,
    }));

  // Fetch blocked users khi component mount hoặc search thay đổi
  useEffect(() => {
    dispatch(
      fetchBlockedUsersAsync({
        page: 0,
        limit: 10,
        search: debouncedValue || undefined,
      })
    );
  }, [dispatch, debouncedValue]);

  const handleUnblockClick = (username: string, fullName: string) => {
    setUserToUnblock({ username, fullName });
    setShowUnblockConfirm(true);
  };

  const confirmUnblock = async () => {
    if (!userToUnblock) return;

    const { username, fullName } = userToUnblock;

    if (unblockingUsers.has(username)) return; // Prevent multiple clicks

    setUnblockingUsers((prev) => new Set(prev).add(username));

    try {
      const resultAction = await dispatch(unblockUserAsync(username));

      if (unblockUserAsync.fulfilled.match(resultAction)) {
        toast({
          title: "Đã bỏ chặn",
          description: `Đã bỏ chặn ${fullName}.`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể bỏ chặn người dùng.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn.",
        variant: "destructive",
      });
    } finally {
      setUnblockingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
      setShowUnblockConfirm(false);
      setUserToUnblock(null);
    }
  };

  const cancelUnblock = () => {
    setShowUnblockConfirm(false);
    setUserToUnblock(null);
  };

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (isLoading || !blockedHasMore) return;

    const nextPage = blockedPage + 1;

    dispatch(
      fetchBlockedUsersAsync({
        page: nextPage,
        limit: 10,
        search: debouncedValue || undefined,
      })
    );
  }, [isLoading, blockedHasMore, blockedPage, dispatch, debouncedValue]);

  // Use infinite scroll hook
  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: blockedHasMore,
    isLoading,
    threshold: 100,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Đã chặn</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Description */}
        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <ShieldOff className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Về chặn người dùng</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Những người bị chặn sẽ không thể xem bài viết, tin hoặc tìm thấy
            trang cá nhân của bạn trên Nexo. Họ cũng sẽ không nhận được thông
            báo khi bị chặn.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            onClear={clearSearch}
            placeholder="Tìm kiếm người đã chặn..."
            isDebouncing={isDebouncing}
          />
        </div>

        {/* User List */}
        <div className="space-y-2">
          {isLoading && blockedUsers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">
                {searchValue ? "Không tìm thấy kết quả" : "Bạn chưa chặn ai"}
              </p>
              <p className="text-xs mt-2">Người bị chặn sẽ hiển thị ở đây</p>
            </div>
          ) : (
            blockedUsers.map((user, index) => {
              const isUnblocking = unblockingUsers.has(user.username);
              const isLastItem = index === blockedUsers.length - 1;

              return (
                <div
                  key={user.id}
                  ref={isLastItem ? lastElementRef : null}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar
                      className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/${user.username}`)}
                    >
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-sm hover:underline cursor-pointer truncate"
                        onClick={() => navigate(`/${user.username}`)}
                      >
                        {user.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.fullName}
                      </p>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUnblockClick(user.username, user.fullName)
                    }
                    disabled={isUnblocking}
                    className="gap-2"
                  >
                    {isUnblocking ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    ) : (
                      <UserMinus className="w-3 h-3" />
                    )}
                    {isUnblocking ? "Đang xử lý..." : "Bỏ chặn"}
                  </Button>
                </div>
              );
            })
          )}

          {/* Loading indicator for infinite scroll */}
          {isLoading && blockedUsers.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Đang tải...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog
        open={showUnblockConfirm}
        onOpenChange={setShowUnblockConfirm}
      >
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldOff className="w-5 h-5 text-primary" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">
                Bỏ chặn {userToUnblock?.username}?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {userToUnblock?.fullName} sẽ có thể xem bài viết, tin và tìm thấy
              trang cá nhân của bạn trên Nexo. Họ sẽ không nhận được thông báo
              khi bạn bỏ chặn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={cancelUnblock} className="flex-1">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnblock}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Bỏ chặn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
