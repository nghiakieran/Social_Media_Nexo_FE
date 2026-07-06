import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  UserPlus,
  UserMinus,
  X,
  AlertTriangle,
  Loader2,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useDebouncedSearch } from "@/hooks/use-debounce-search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FollowerUser, FollowingUser } from "../types";
import { useToast } from "@/hooks/use-toast";
import {
  followUserAsync,
  unfollowUserAsync,
  fetchFollowersByUsernameAsync,
  fetchFollowingByUsernameAsync,
} from "../profileSlice";
import { navigateToProfile } from "@/utils/navigation";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import { SearchInput } from "@/components/common/SearchInput";

interface FollowersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: FollowerUser[] | FollowingUser[];
  title: string;
  isCurrentUser?: boolean;
  username?: string; // Needed for API calls
}

export const FollowersDialog = ({
  isOpen,
  onClose,
  users,
  title,
  isCurrentUser = false,
  username,
}: FollowersDialogProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    searchValue,
    debouncedValue,
    setSearchValue,
    clearSearch,
    isDebouncing,
  } = useDebouncedSearch("", 400);
  const [localUsers, setLocalUsers] = useState<
    FollowerUser[] | FollowingUser[]
  >([]);
  const initialLoadRef = useRef(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<
    FollowerUser | FollowingUser | null
  >(null);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState<
    FollowerUser | FollowingUser | null
  >(null);
  const lastRequestedPageRef = useRef<number>(-1);
  const { toast } = useToast();
  const { isFollowersLoading, isFollowingLoading } = useAppSelector(
    (state) => state.profile
  );
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (Array.isArray(users)) {
      setLocalUsers(users);
    }
  }, [users]);

  useEffect(() => {
    if (!isOpen) {
      initialLoadRef.current = false;
      lastRequestedPageRef.current = -1;
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  const { followersHasMore, followersPage, followingHasMore, followingPage } =
    useAppSelector((state) => state.profile);

  const isFollowersDialog = title === "Người theo dõi";
  const currentHasMore = isFollowersDialog
    ? followersHasMore
    : followingHasMore;
  const currentPageNum = isFollowersDialog ? followersPage : followingPage;
  const listLoading = isFollowersDialog ? isFollowersLoading : isFollowingLoading;

  useEffect(() => {
    if (!username || !isOpen) return;

    if (debouncedValue !== "") {
      lastRequestedPageRef.current = 1;
      const params = {
        username,
        pageNo: 1,
        pageSize: 10,
        search: debouncedValue,
      };

      if (isFollowersDialog) {
        dispatch(fetchFollowersByUsernameAsync(params));
      } else {
        dispatch(fetchFollowingByUsernameAsync(params));
      }
    }
  }, [debouncedValue, username, isOpen, isFollowersDialog, dispatch]);

  useEffect(() => {
    if (!username || !isOpen || initialLoadRef.current) return;

    if (debouncedValue !== "") return;

    if (users.length === 0) {
      lastRequestedPageRef.current = 1;
      const params = {
        username,
        pageNo: 1,
        pageSize: 10,
      };

      if (isFollowersDialog) {
        dispatch(fetchFollowersByUsernameAsync(params));
      } else {
        dispatch(fetchFollowingByUsernameAsync(params));
      }
    }

    initialLoadRef.current = true;
  }, [
    isOpen,
    username,
    isFollowersDialog,
    dispatch,
    users.length,
    debouncedValue,
  ]);

  const handleLoadMore = useCallback(() => {
    if (!username || !currentHasMore || listLoading || localUsers.length === 0)
      return;

    const nextPage = currentPageNum + 1;

    if (nextPage <= lastRequestedPageRef.current) return;
    lastRequestedPageRef.current = nextPage;

    const params = {
      username,
      pageNo: nextPage,
      pageSize: 10,
      search: debouncedValue || undefined,
    };

    if (isFollowersDialog) {
      dispatch(fetchFollowersByUsernameAsync(params));
    } else {
      dispatch(fetchFollowingByUsernameAsync(params));
    }
  }, [
    username,
    currentHasMore,
    listLoading,
    currentPageNum,
    isFollowersDialog,
    dispatch,
    debouncedValue,
    localUsers.length,
  ]);

  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: currentHasMore,
    isLoading: listLoading,
    threshold: 100,
  });

  const filteredUsers = Array.isArray(localUsers)
    ? localUsers.filter((user) => {
      if (title === "Đang theo dõi" && isCurrentUser && !user.isFollowing) {
        return false;
      }
      return true;
    })
    : [];

  // Navigate to user profile
  const handleNavigateToProfile = (userName: string) => {
    navigateToProfile(navigate, userName);
    onClose(); // Close dialog after navigation
  };

  const handleFollow = async (userId: number) => {
    if (!Array.isArray(localUsers)) return;

    const user = localUsers.find((u) => u.userId === userId);
    if (!user) return;

    try {
      const isCurrentlyFollowing = user.isFollowing;

      if (isCurrentlyFollowing) {
        // Show confirmation dialog for unfollow
        setUserToUnfollow(user);
        setShowUnfollowConfirm(true);
        return;
      } else {
        // Follow user
        const resultAction = await dispatch(followUserAsync(user.userName));
        if (followUserAsync.fulfilled.match(resultAction)) {
          setLocalUsers((prev) => {
            if (!Array.isArray(prev)) return [];
            return prev.map((u) =>
              u.userId === userId ? { ...u, isFollowing: true } : u
            );
          });

          toast({
            title: "Đã theo dõi",
            description: `Bạn đã theo dõi ${user.userName}`,
          });
        } else {
          toast({
            title: "Lỗi",
            description: `Không thể theo dõi người dùng này`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFollower = (userId: number) => {
    if (!Array.isArray(localUsers)) return;

    const user = localUsers.find((u) => u.userId === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteConfirm(true);
    }
  };

  const confirmRemoveFollower = async () => {
    if (userToDelete) {
      try {
        const resultAction = await dispatch(
          unfollowUserAsync(userToDelete.userName)
        );
        if (unfollowUserAsync.fulfilled.match(resultAction)) {
          setLocalUsers((prev) =>
            Array.isArray(prev)
              ? prev.filter((user) => user.userId !== userToDelete.userId)
              : []
          );
          toast({
            title: "Đã xóa người theo dõi",
            description: `Đã xóa ${userToDelete.userName} khỏi danh sách người theo dõi`,
          });
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể xóa người theo dõi này",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Đã xảy ra lỗi không mong muốn",
          variant: "destructive",
        });
      }
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const cancelRemoveFollower = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const confirmUnfollow = async () => {
    if (userToUnfollow) {
      try {
        const resultAction = await dispatch(
          unfollowUserAsync(userToUnfollow.userName)
        );
        if (unfollowUserAsync.fulfilled.match(resultAction)) {
          // If in Following dialog, reload the following list to get fresh data
          if (title === "Đang theo dõi" && username) {
            dispatch(
              fetchFollowingByUsernameAsync({
                username,
                pageNo: 0,
                pageSize: 10,
              })
            );
          } else {
            // Otherwise, update local state
            setLocalUsers((prev) => {
              if (!Array.isArray(prev)) return [];
              return prev.map((u) =>
                u.userId === userToUnfollow.userId
                  ? { ...u, isFollowing: false }
                  : u
              );
            });
          }
          toast({
            title: "Đã bỏ theo dõi",
            description: `Bạn đã bỏ theo dõi ${userToUnfollow.userName}`,
          });
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể bỏ theo dõi người dùng này",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Đã xảy ra lỗi không mong muốn",
          variant: "destructive",
        });
      }
      setShowUnfollowConfirm(false);
      setUserToUnfollow(null);
    }
  };

  const cancelUnfollow = () => {
    setShowUnfollowConfirm(false);
    setUserToUnfollow(null);
  };

  const handleCancelFollowRequest = async (userId: number) => {
    if (!Array.isArray(localUsers)) return;

    const user = localUsers.find((u) => u.userId === userId);
    if (!user) return;

    try {
      const resultAction = await dispatch(unfollowUserAsync(user.userName));
      if (unfollowUserAsync.fulfilled.match(resultAction)) {
        setLocalUsers((prev) => {
          if (!Array.isArray(prev)) return [];
          return prev.map((u) =>
            u.userId === userId ? { ...u, hasRequestedFollow: false } : u
          );
        });

        toast({
          title: "Đã hủy yêu cầu",
          description: `Đã hủy yêu cầu theo dõi ${user.userName}`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể hủy yêu cầu theo dõi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="fixed bottom-0 sm:bottom-auto top-auto sm:top-[50%] left-0 sm:left-[50%] translate-x-0 translate-y-0 sm:translate-x-[-50%] sm:translate-y-[-50%] w-full sm:w-[90vw] max-w-[560px] rounded-t-[1.5rem] sm:rounded-lg bg-background p-0 overflow-hidden border-x-0 border-b-0 sm:border border-border">
          <DialogHeader className="relative border-b border-border p-3">
            <DialogTitle className="text-center text-base font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 p-3 pt-0">
            {/* Search */}
            <div className="space-y-2">
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                onClear={clearSearch}
                placeholder="Tìm kiếm theo tên hoặc username..."
                isDebouncing={isDebouncing}
                className="bg-muted/50"
              />
            </div>

            {/* User List */}
            <div className="h-[340px] overflow-y-auto space-y-1.5">
              {filteredUsers.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {listLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : searchValue ? (
                    "Không tìm thấy kết quả"
                  ) : (
                    "Danh sách trống"
                  )}
                </div>
              ) : (
                filteredUsers.map((user, index) => {
                  const isLastItem = index === filteredUsers.length - 1;

                  return (
                    <div
                      key={user.userId}
                      ref={isLastItem ? lastElementRef : null}
                      className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-primary/10 dark:hover:bg-primary/15"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleNavigateToProfile(user.userName)}
                      >
                        <Avatar className="w-11 h-11 hover:opacity-80 transition-opacity">
                          <AvatarImage
                            src={getAvatarUrl(user.avatar)}
                            alt={user.userName}
                          />
                          <AvatarFallback>
                            {getAvatarInitials(user.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm leading-5 hover:underline">
                            {user.userName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.fullName ||
                              (user.closeFriend
                                ? "Bạn thân"
                                : title === "Đang theo dõi"
                                  ? "Đang theo dõi"
                                  : "Người theo dõi")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Không hiển thị nút nếu là chính mình */}
                        {currentUser &&
                          user.userId === currentUser.id ? null : title ===
                            "Người theo dõi" && isCurrentUser ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFollower(user.userId)}
                            className="text-xs"
                          >
                            Xóa
                          </Button>
                        ) : title === "Người theo dõi" ? (
                          // Show follow/unfollow button based on isFollowing status
                          user.isFollowing ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFollow(user.userId)}
                              className="text-xs gap-1"
                            >
                              <UserMinus className="w-3 h-3" />
                              Đang theo dõi
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleFollow(user.userId)}
                              className="text-xs gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              Theo dõi
                            </Button>
                          )
                        ) : // Following dialog
                          user.isFollowing ? (
                            // Show "Đang theo dõi" for confirmed follows
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFollow(user.userId)}
                              className="text-xs gap-1"
                            >
                              <UserMinus className="w-3 h-3" />
                              Đang theo dõi
                            </Button>
                          ) : user.hasRequestedFollow ? (
                            // Show "Hủy yêu cầu" for pending requests
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCancelFollowRequest(user.userId)
                              }
                              className="text-xs gap-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              Hủy yêu cầu
                            </Button>
                          ) : (
                            // Show "Theo dõi" for not following
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleFollow(user.userId)}
                              className="text-xs gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              Theo dõi
                            </Button>
                          )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Loading indicator */}
              {listLoading && filteredUsers.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Đang tải...
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">
                Xóa người theo dõi?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Ứng dụng sẽ không cho {userToDelete?.userName} biết rằng bạn đã
              xóa họ khỏi danh sách người theo dõi mình.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel
              onClick={cancelRemoveFollower}
              className="flex-1"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFollower}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unfollow Confirmation Dialog */}
      <AlertDialog
        open={showUnfollowConfirm}
        onOpenChange={setShowUnfollowConfirm}
      >
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={getAvatarUrl(userToUnfollow?.avatar)}
                  alt={userToUnfollow?.userName}
                />
                <AvatarFallback>
                  {getAvatarInitials(userToUnfollow?.userName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-center">
              Bỏ theo dõi @{userToUnfollow?.userName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Bạn sẽ không còn thấy bài đăng của @{userToUnfollow?.userName}{" "}
              trong bảng tin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={cancelUnfollow} className="flex-1">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnfollow}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Bỏ theo dõi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
