import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchFollowingByUsernameAsync,
  toggleCloseFriendAsync,
} from "../profileSlice";
import { useDebouncedSearch } from "@/hooks/use-debounce-search";
import { SearchInput } from "@/components/common/SearchInput";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

// We'll use the CloseFriendUser type from the API response

export const CloseFriendsSettings = () => {
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
  const [togglingUsers, setTogglingUsers] = useState<Set<string>>(new Set());

  // Get data from Redux store
  const { following, isLoading, followingHasMore, followingPage, currentUser } =
    useAppSelector((state) => ({
      following: state.profile.following,
      isLoading: state.profile.isLoading,
      followingHasMore: state.profile.followingHasMore,
      followingPage: state.profile.followingPage,
      currentUser: state.auth.user,
    }));

  // Fetch following list khi component mount hoặc search thay đổi
  useEffect(() => {
    if (currentUser?.username) {
      dispatch(
        fetchFollowingByUsernameAsync({
          username: currentUser.username,
          pageNo: 0,
          pageSize: 10,
          search: debouncedValue || undefined,
        })
      );
    }
  }, [dispatch, debouncedValue, currentUser?.username]);

  const handleToggleCloseFriend = async (
    username: string,
    currentStatus: boolean
  ) => {
    if (togglingUsers.has(username)) return; // Prevent multiple clicks

    setTogglingUsers((prev) => new Set(prev).add(username));

    try {
      const resultAction = await dispatch(toggleCloseFriendAsync(username));

      if (toggleCloseFriendAsync.fulfilled.match(resultAction)) {
        // Refetch following list để cập nhật closeFriend status
        if (currentUser?.username) {
          dispatch(
            fetchFollowingByUsernameAsync({
              username: currentUser.username,
              pageNo: 0,
              pageSize: 10,
              search: debouncedValue || undefined,
            })
          );
        }

        toast({
          title: currentStatus
            ? "Đã xóa khỏi bạn thân"
            : "Đã thêm vào bạn thân",
          description: currentStatus
            ? `Đã xóa ${username} khỏi danh sách bạn thân.`
            : `Đã thêm ${username} vào danh sách bạn thân.`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật danh sách bạn thân.",
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
      setTogglingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
    }
  };

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (!currentUser?.username || !followingHasMore || isLoading) return;

    const nextPage = followingPage + 1;

    dispatch(
      fetchFollowingByUsernameAsync({
        username: currentUser.username,
        pageNo: nextPage,
        pageSize: 10,
        search: debouncedValue || undefined,
      })
    );
  }, [
    currentUser?.username,
    followingHasMore,
    isLoading,
    followingPage,
    dispatch,
    debouncedValue,
  ]);

  // Use infinite scroll hook
  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: followingHasMore,
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
            <h1 className="text-lg font-semibold">Bạn thân</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Description */}
        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border/50">
          <h3 className="font-semibold text-sm mb-2">Về bạn thân</h3>
          <p className="text-sm text-muted-foreground">
            Chọn những người bạn đang theo dõi để thêm vào danh sách bạn thân.
            Chỉ những người trong danh sách này mới có thể xem tin của bạn khi
            bạn chia sẻ tin với bạn thân.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            onClear={clearSearch}
            placeholder="Tìm kiếm..."
            isDebouncing={isDebouncing}
          />
        </div>

        {/* User List */}
        <div className="space-y-2">
          {isLoading && following.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>
                {searchValue
                  ? "Không tìm thấy kết quả"
                  : "Bạn chưa theo dõi ai"}
              </p>
              <p className="text-xs mt-2">
                Hãy theo dõi người khác để thêm họ vào bạn thân
              </p>
            </div>
          ) : (
            following.map((user, index) => {
              const isToggling = togglingUsers.has(user.userName);
              const isFriend = user.closeFriend; // Sử dụng field closeFriend từ API
              const isLastItem = index === following.length - 1;

              return (
                <div
                  key={user.userId}
                  ref={isLastItem ? lastElementRef : null}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} alt={user.userName} />
                      <AvatarFallback>
                        {user.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.fullName}
                      </p>
                      {isFriend && (
                        <p className="text-xs text-green-600 font-medium mt-0.5">
                          ✓ Bạn thân
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant={isFriend ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      handleToggleCloseFriend(user.userName, isFriend)
                    }
                    disabled={isToggling}
                    className="gap-2"
                  >
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isFriend ? (
                      <UserMinus className="w-3 h-3" />
                    ) : (
                      <UserPlus className="w-3 h-3" />
                    )}
                    {isToggling ? "Đang xử lý..." : isFriend ? "Xóa" : "Thêm"}
                  </Button>
                </div>
              );
            })
          )}

          {/* Loading indicator for infinite scroll */}
          {isLoading && following.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Đang tải...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
