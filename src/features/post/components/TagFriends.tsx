import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, Users, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getMutualFollowersThunk } from "../postSlice";
import { Loader } from "@/components/common/Loader";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
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
    mutualFollowersPage 
  } = useAppSelector(state => state.post);
  const [searchTerm, setSearchTerm] = useState("");

  // Load mutual followers when component mounts
  useEffect(() => {
    dispatch(getMutualFollowersThunk({ pageNo: 0, pageSize: 10 }));
  }, [dispatch]);

  // Infinite scroll handler
  const handleLoadMore = () => {
    if (!isLoadingMutuals && mutualFollowersHasMore) {
      const nextPage = mutualFollowersPage + 1;
      dispatch(getMutualFollowersThunk({ pageNo: nextPage, pageSize: 10 }));
    }
  };

  // Use infinite scroll hook
  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: mutualFollowersHasMore,
    isLoading: isLoadingMutuals,
  });

  const filteredFriends = mutualFollowers.filter(
    (friend) =>
      friend.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          className="h-8 w-8 p-0 rounded-full hover:bg-muted hover:text-gray-400"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bạn bè..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 rounded-xl border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
      </div>

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
              className="text-sm text-muted-foreground"
            >
              Xóa tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map((friendUserId) => {
              const friend = mutualFollowers.find(f => f.userId === friendUserId);
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
        {isLoadingMutuals ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : (
          filteredFriends.map((friend, index) => {
            const isSelected = selectedFriends.includes(friend.userId);
            const isLastItem = index === filteredFriends.length - 1;

            return (
              <div
                key={friend.userId}
                ref={isLastItem ? lastElementRef : null}
                onClick={() => toggleFriend(friend.userId)}
                className={`
                  flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 group
                  ${
                    isSelected
                      ? "bg-primary/10 border border-primary/20 shadow-sm"
                      : "hover:bg-muted/50 hover:shadow-sm"
                  }
                `}
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
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
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
                  <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30"></div>
                  </div>
                )}
              </div>
            );
          })
        )}
        
        {/* Load more indicator */}
        {isLoadingMutuals && filteredFriends.length > 0 && (
          <div className="flex justify-center items-center py-4">
            <Loader />
          </div>
        )}
      </div>

      {!isLoadingMutuals && filteredFriends.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            Không tìm thấy bạn bè nào
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Thử tìm kiếm với từ khóa khác
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onClose} className="rounded-xl">
          Đóng
        </Button>
        <Button
          onClick={onClose}
          className="rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          disabled={selectedFriends.length === 0}
        >
          Xong ({selectedFriends.length})
        </Button>
      </div>
    </div>
  );
};
