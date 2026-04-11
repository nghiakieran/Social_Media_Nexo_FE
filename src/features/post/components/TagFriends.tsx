import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Users, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getMutualFollowersThunk } from "../postSlice";
import { Loader } from "@/components/common/Loader";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useDebouncedSearch } from "@/hooks/use-debounce-search";
import { SearchInput } from "@/components/common/SearchInput";
import { cn } from "@/lib/utils";
import type { MutualUser } from "../types";

interface TagFriendsProps {
  selectedFriends: number[];
  onSelectionChange: (friends: number[]) => void;
  onClose: () => void;
}

export const TagFriends = ({
  selectedFriends,
  onSelectionChange,
  onClose,
}: TagFriendsProps) => {
  const dispatch = useAppDispatch();
  const {
    mutualFollowers,
    isLoadingMutuals,
    mutualFollowersHasMore,
    mutualFollowersPage,
  } = useAppSelector((state) => state.post);
  const {
    searchValue,
    debouncedValue,
    setSearchValue,
    clearSearch,
    isDebouncing,
  } = useDebouncedSearch("", 400);

  // Load mutual followers when component mounts or search changes
  useEffect(() => {
    dispatch(
      getMutualFollowersThunk({
        pageNo: 0,
        pageSize: 10,
        search: debouncedValue || undefined,
      })
    );
  }, [dispatch, debouncedValue]);

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMutuals && mutualFollowersHasMore) {
      const nextPage = mutualFollowersPage + 1;
      dispatch(
        getMutualFollowersThunk({
          pageNo: nextPage,
          pageSize: 10,
          search: debouncedValue || undefined,
        })
      );
    }
  }, [
    isLoadingMutuals,
    mutualFollowersHasMore,
    mutualFollowersPage,
    dispatch,
    debouncedValue,
  ]);

  // Use infinite scroll hook
  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: mutualFollowersHasMore,
    isLoading: isLoadingMutuals,
  });

  const toggleFriend = (friendUserId: number) => {
    if (selectedFriends.includes(friendUserId)) {
      onSelectionChange(selectedFriends.filter((f) => f !== friendUserId));
    } else {
      onSelectionChange([...selectedFriends, friendUserId]);
    }
  };

  return (
    <div className="space-y-6 p-6 border border-border/50 rounded-2xl bg-card/80 backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Gắn thẻ bạn bè</h3>
            <p className="text-sm text-muted-foreground">
              Chọn bạn bè để gắn thẻ trong bài viết
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 rounded-full p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <SearchInput
        value={searchValue}
        onChange={setSearchValue}
        onClear={clearSearch}
        placeholder="Tìm kiếm bạn bè..."
        isDebouncing={isDebouncing}
        className="h-12"
      />

      {/* Selected Friends */}
      {selectedFriends.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Đã chọn ({selectedFriends.length})
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Xóa tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map((friendUserId) => {
              const friend = mutualFollowers.find(
                (f) => f.userId === friendUserId
              );
              if (!friend) return null;

              return (
                <Badge
                  key={friend.userId}
                  variant="secondary"
                  className="gap-2 px-3 py-2 rounded-full bg-primary/10 text-primary border-primary/20"
                >
                  <img
                    src={friend.avatar}
                    alt={friend.fullName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-medium">{friend.fullName}</span>
                  <button
                    onClick={() => toggleFriend(friend.userId)}
                    className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="max-h-80 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
        {isLoadingMutuals && mutualFollowers.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : mutualFollowers.length === 0 ? (
          <div className="space-y-2 py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-12 w-12 text-primary/40" />
            <p className="text-sm">
              {searchValue ? "Không tìm thấy kết quả" : "Chưa có bạn bè"}
            </p>
          </div>
        ) : (
          mutualFollowers.map((friend, index) => {
            const isSelected = selectedFriends.includes(friend.userId);
            const isLastItem = index === mutualFollowers.length - 1;

            return (
              <div
                key={friend.userId}
                ref={isLastItem ? lastElementRef : null}
                onClick={() => toggleFriend(friend.userId)}
                className={cn(
                  "group flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-all duration-200",
                  isSelected
                    ? "border border-primary/20 bg-primary/10 shadow-sm"
                    : "hover:bg-primary/10 hover:shadow-sm dark:hover:bg-primary/15"
                )}
              >
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.fullName}
                    className="w-12 h-12 rounded-full object-cover shadow-md"
                  />
                  {friend.isFollowing && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background shadow-sm"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {friend.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{friend.userName}
                  </p>
                  {friend.closeFriend && (
                    <span className="mt-1 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/25">
                      Bạn thân
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                {!isSelected && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/25 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="h-3 w-3 rounded-full bg-primary/35" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Load more indicator */}
        {isLoadingMutuals && mutualFollowers.length > 0 && (
          <div className="flex justify-center items-center py-4">
            <Loader />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
        <Button variant="outline" onClick={onClose} className="rounded-xl">
          Đóng
        </Button>
        <Button
          onClick={onClose}
          className="rounded-xl shadow-soft hover:shadow-medium"
          disabled={selectedFriends.length === 0}
        >
          Xong ({selectedFriends.length})
        </Button>
      </div>
    </div>
  );
};
