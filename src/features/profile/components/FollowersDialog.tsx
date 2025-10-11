import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, UserPlus, UserMinus, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserProfile, FollowerUser, FollowingUser } from '../types';
import { useToast } from '@/hooks/use-toast';
import { followUserAsync, unfollowUserAsync, fetchFollowersByUsernameAsync, fetchFollowingByUsernameAsync } from '../profileSlice';

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
  username
}: FollowersDialogProps) => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [localUsers, setLocalUsers] = useState<FollowerUser[] | FollowingUser[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<FollowerUser | FollowingUser | null>(null);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState<FollowerUser | FollowingUser | null>(null);
  const { toast } = useToast();
  const { isLoading } = useAppSelector((state) => state.profile);

  // Keep local users in sync with props when dialog opens or data changes
  useEffect(() => {
    if (isOpen && Array.isArray(users)) {
      setLocalUsers(users);
      setSearchTerm('');
    }
  }, [isOpen, users, title]);

  // Get pagination state from store
  const {
    followersHasMore,
    followersPage,
    followingHasMore,
    followingPage
  } = useAppSelector((state) => state.profile);

  const isFollowersDialog = title === 'Người theo dõi';
  const currentHasMore = isFollowersDialog ? followersHasMore : followingHasMore;
  const currentPageNum = isFollowersDialog ? followersPage : followingPage;

  // Load more handler for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!username || !currentHasMore || isLoading) return;

    const nextPage = currentPageNum + 1;
    
    if (isFollowersDialog) {
      dispatch(fetchFollowersByUsernameAsync({ username, pageNo: nextPage, pageSize: 10 }));
    } else {
      dispatch(fetchFollowingByUsernameAsync({ username, pageNo: nextPage, pageSize: 10 }));
    }
  }, [username, currentHasMore, isLoading, currentPageNum, isFollowersDialog, dispatch]);

  // Use infinite scroll hook
  const { lastElementRef } = useInfiniteScroll(handleLoadMore, {
    hasMore: currentHasMore,
    isLoading,
    threshold: 100,
  });

  const filteredUsers = Array.isArray(localUsers) ? localUsers.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleFollow = async (userId: number) => {
    if (!Array.isArray(localUsers)) return;
    
    const user = localUsers.find(u => u.userId === userId);
    if (!user) return;
    
    try {
      // For Following dialog, show confirmation for unfollow
      if (title === 'Đang theo dõi') {
        setUserToUnfollow(user);
        setShowUnfollowConfirm(true);
        return;
      } else {
        // For Followers dialog, toggle follow status
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
            setLocalUsers(prev => {
              if (!Array.isArray(prev)) return [];
              return prev.map(u => 
                u.userId === userId 
                  ? { ...u, isFollowing: true }
                  : u
              );
            });
            
            toast({
              title: 'Đã theo dõi',
              description: `Bạn đã theo dõi ${user.userName}`,
            });
          } else {
            toast({
              title: 'Lỗi',
              description: `Không thể theo dõi người dùng này`,
              variant: 'destructive',
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi không mong muốn',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFollower = (userId: number) => {
    if (!Array.isArray(localUsers)) return;
    
    const user = localUsers.find(u => u.userId === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteConfirm(true);
    }
  };

  const confirmRemoveFollower = async () => {
    if (userToDelete) {
      try {
        const resultAction = await dispatch(unfollowUserAsync(userToDelete.userName));
        if (unfollowUserAsync.fulfilled.match(resultAction)) {
          setLocalUsers(prev => Array.isArray(prev) ? prev.filter(user => user.userId !== userToDelete.userId) : []);
          toast({
            title: 'Đã xóa người theo dõi',
            description: `Đã xóa ${userToDelete.userName} khỏi danh sách người theo dõi`,
          });
        } else {
          toast({
            title: 'Lỗi',
            description: 'Không thể xóa người theo dõi này',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Đã xảy ra lỗi không mong muốn',
          variant: 'destructive',
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
        const resultAction = await dispatch(unfollowUserAsync(userToUnfollow.userName));
        if (unfollowUserAsync.fulfilled.match(resultAction)) {
          setLocalUsers(prev => {
            if (!Array.isArray(prev)) return [];
            return prev.map(u => 
              u.userId === userToUnfollow.userId 
                ? { ...u, isFollowing: false }
                : u
            );
          });
          toast({
            title: 'Đã bỏ theo dõi',
            description: `Bạn đã bỏ theo dõi ${userToUnfollow.userName}`,
          });
        } else {
          toast({
            title: 'Lỗi',
            description: 'Không thể bỏ theo dõi người dùng này',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Đã xảy ra lỗi không mong muốn',
          variant: 'destructive',
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90vw] max-w-[560px] mx-auto bg-background p-0 overflow-hidden">
          <DialogHeader className="relative border-b border-border p-3">
            <DialogTitle className="text-center text-base font-semibold">{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 p-3 pt-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>

            {/* User List - fixed height for stable UX */}
            <div 
              className="h-[340px] overflow-y-auto space-y-1.5"
            >
              {filteredUsers.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
                </div>
              ) : (
                filteredUsers.map((user, index) => {
                  const isLastItem = index === filteredUsers.length - 1;
                  
                  return (
                  <div 
                    key={user.userId} 
                    ref={isLastItem ? lastElementRef : null}
                    className="flex items-center justify-between px-2 py-2 hover:bg-muted/40 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={user.avatar} alt={user.userName} />
                        <AvatarFallback>
                          {user.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm leading-5">{user.userName}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {user.fullName || (user.closeFriend ? 'Bạn thân' : (title === 'Đang theo dõi' ? 'Đang theo dõi' : 'Người theo dõi'))}
                          </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {title === 'Người theo dõi' && isCurrentUser ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFollower(user.userId)}
                          className="text-xs"
                        >
                          Xóa
                        </Button>
                      ) : title === 'Người theo dõi' ? (
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
                            variant="instagram"
                            size="sm"
                            onClick={() => handleFollow(user.userId)}
                            className="text-xs gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            Theo dõi
                          </Button>
                        )
                      ) : (
                        // Following dialog - always show unfollow button since all users are being followed
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow(user.userId)}
                          className="text-xs gap-1"
                        >
                          <UserMinus className="w-3 h-3" />
                          Đang theo dõi
                        </Button>
                      )}
                    </div>
                  </div>
                  );
                })
              )}
              
              {/* Loading indicator for infinite scroll */}
              {isLoading && filteredUsers.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
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
              Ứng dụng sẽ không cho {userToDelete?.userName} biết rằng bạn đã xóa họ khỏi danh sách người theo dõi mình.
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
      <AlertDialog open={showUnfollowConfirm} onOpenChange={setShowUnfollowConfirm}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-12 h-12">
                <AvatarImage src={userToUnfollow?.avatar} alt={userToUnfollow?.userName} />
                <AvatarFallback>
                  {userToUnfollow?.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-center">
              Bỏ theo dõi @{userToUnfollow?.userName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Bạn sẽ không còn thấy bài đăng của @{userToUnfollow?.userName} trong bảng tin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={cancelUnfollow}
              className="flex-1"
            >
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