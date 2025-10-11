import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCloseFriendsAsync, toggleCloseFriendAsync } from '../profileSlice';

// We'll use the CloseFriendUser type from the API response

export const CloseFriendsSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [togglingUsers, setTogglingUsers] = useState<Set<string>>(new Set());

  // Get data from Redux store
  const { closeFriends, isLoading, error } = useAppSelector((state) => ({
    closeFriends: state.profile.closeFriends,
    isLoading: state.profile.isLoading,
    error: state.profile.error,
  }));

  // Fetch close friends on component mount
  useEffect(() => {
    dispatch(fetchCloseFriendsAsync({ page: 0, limit: 10 }));
    setCurrentPage(0);
    setHasMore(true);
  }, [dispatch]);

  // Filter users based on search query
  const filteredUsers = closeFriends.filter((user) =>
    searchQuery.trim() === '' ||
    user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleCloseFriend = async (username: string) => {
    if (togglingUsers.has(username)) return; // Prevent multiple clicks

    setTogglingUsers(prev => new Set(prev).add(username));

    try {
      const resultAction = await dispatch(toggleCloseFriendAsync(username));
      
      if (toggleCloseFriendAsync.fulfilled.match(resultAction)) {
        // Refetch the close friends list to get updated data
        dispatch(fetchCloseFriendsAsync({ page: 0, limit: 10 }));
        
        toast({
          title: 'Đã cập nhật',
          description: 'Danh sách bạn thân đã được cập nhật.',
        });
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể cập nhật danh sách bạn thân.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi không mong muốn.',
        variant: 'destructive',
      });
    } finally {
      setTogglingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const resultAction = await dispatch(fetchCloseFriendsAsync({ page: nextPage, limit: 10 }));
      
      if (fetchCloseFriendsAsync.fulfilled.match(resultAction)) {
        setCurrentPage(nextPage);
        // Check if we have more data based on the response
        // For now, we'll assume we have more if we get a full page
        if (resultAction.payload.closeFriends.length < 20) {
          setHasMore(false);
        }
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thêm dữ liệu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Bạn thân</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Chọn những người bạn muốn thêm vào danh sách bạn thân. Chỉ những người trong danh sách này mới có thể xem tin của bạn khi bạn chia sẻ tin với bạn thân.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* User List */}
        <div className="space-y-2">
          {isLoading && closeFriends.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isToggling = togglingUsers.has(user.userName);
              const isCloseFriend = true; // All users in this list are close friends
              
              return (
                <div
                  key={user.userId}
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
                      <p className="text-xs text-muted-foreground">{user.fullName}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleToggleCloseFriend(user.userName)}
                    disabled={isToggling}
                    className="gap-2"
                  >
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    {isToggling ? 'Đang xử lý...' : 'Xóa khỏi bạn thân'}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {hasMore && closeFriends.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="gap-2"
            >
              {isLoadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {isLoadingMore ? 'Đang tải...' : 'Tải thêm'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery.trim() ? 'Không tìm thấy người dùng nào.' : 'Bạn chưa có bạn thân nào.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
