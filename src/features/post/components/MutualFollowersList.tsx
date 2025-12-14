import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { getMutualFollowersThunk } from '../postSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/common/Loader';
import { useToast } from '@/hooks/use-toast';
import type { MutualUser } from '../types';

interface MutualFollowersListProps {
  onUserSelect?: (user: MutualUser) => void;
  maxItems?: number;
}

export const MutualFollowersList = ({ 
  onUserSelect, 
  maxItems = 10 
}: MutualFollowersListProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { 
    mutualFollowers, 
    isLoadingMutuals, 
    error 
  } = useAppSelector(state => state.post);

  useEffect(() => {
    // Load mutual followers when component mounts
    dispatch(getMutualFollowersThunk({ pageNo: 0, pageSize: maxItems }))
      .unwrap()
      .catch((error) => {
        console.error('Failed to load mutual followers:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách bạn bè chung.",
          variant: "destructive",
        });
      });
  }, [dispatch, maxItems, toast]);

  const handleUserClick = (user: MutualUser) => {
    onUserSelect?.(user);
  };

  const handleFollowToggle = (user: MutualUser) => {
    // TODO: Implement follow/unfollow logic
    toast({
      title: user.isFollowing ? "Đã bỏ theo dõi!" : "Đã theo dõi!",
      description: `${user.fullName} đã được ${user.isFollowing ? 'bỏ theo dõi' : 'theo dõi'}.`,
    });
  };

  if (isLoadingMutuals) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => dispatch(getMutualFollowersThunk({ pageNo: 0, pageSize: maxItems }))}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (mutualFollowers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chưa có bạn bè chung nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 mb-4">
        Bạn bè chung ({mutualFollowers.length})
      </h3>
      
      {mutualFollowers.slice(0, maxItems).map((user) => (
        <div 
          key={user.userId}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => handleUserClick(user)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback>
                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user.fullName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                @{user.userName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.closeFriend && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Bạn thân
              </span>
            )}
            
            <Button
              variant={user.isFollowing ? "outline" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFollowToggle(user);
              }}
            >
              {user.isFollowing ? "Đã theo dõi" : "Theo dõi"}
            </Button>
          </div>
        </div>
      ))}

      {mutualFollowers.length > maxItems && (
        <div className="text-center pt-4">
          <Button variant="ghost" size="sm">
            Xem thêm ({mutualFollowers.length - maxItems})
          </Button>
        </div>
      )}
    </div>
  );
};
