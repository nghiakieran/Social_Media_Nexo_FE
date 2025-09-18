import { useEffect, useState } from 'react';
import { Search, UserPlus, UserMinus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserProfile } from '../profileSlice';
import { useToast } from '@/hooks/use-toast';

interface FollowersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  title: string;
  isCurrentUser?: boolean;
}

export const FollowersDialog = ({ 
  isOpen, 
  onClose, 
  users, 
  title,
  isCurrentUser = false 
}: FollowersDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localUsers, setLocalUsers] = useState(users);
  const { toast } = useToast();

  // Keep local users in sync with props when dialog opens or data changes
  useEffect(() => {
    if (isOpen) {
      setLocalUsers(users);
      setSearchTerm('');
    }
  }, [isOpen, users, title]);

  const filteredUsers = localUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFollow = (userId: string) => {
    setLocalUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isFollowing: !user.isFollowing }
        : user
    ));
    
    const user = localUsers.find(u => u.id === userId);
    toast({
      title: user?.isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi',
      description: user?.isFollowing 
        ? `Bạn đã bỏ theo dõi ${user.name}`
        : `Bạn đã theo dõi ${user.name}`,
    });
  };

  const handleRemoveFollower = (userId: string) => {
    setLocalUsers(prev => prev.filter(user => user.id !== userId));
    const user = localUsers.find(u => u.id === userId);
    toast({
      title: 'Đã xóa người theo dõi',
      description: `Đã xóa ${user?.name} khỏi danh sách người theo dõi`,
    });
  };

  return (
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
          <div className="h-[340px] overflow-y-auto space-y-1.5">
            {filteredUsers.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-2 py-2 hover:bg-muted/40 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm leading-5">{user.username}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {title === 'Người theo dõi' && isCurrentUser ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFollower(user.id)}
                        className="text-xs"
                      >
                        Xóa
                      </Button>
                    ) : (
                      user.id !== 'current' && (
                        <Button
                          variant={user.isFollowing ? "outline" : "instagram"}
                          size="sm"
                          onClick={() => handleFollow(user.id)}
                          className="text-xs gap-1"
                        >
                          {user.isFollowing ? (
                            <>
                              <UserMinus className="w-3 h-3" />
                              Đang theo dõi
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              Theo dõi
                            </>
                          )}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};