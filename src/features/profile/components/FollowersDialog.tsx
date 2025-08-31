import { useState } from 'react';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
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
      <DialogContent className="max-w-sm mx-auto bg-background">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* User List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{user.username}</div>
                      <div className="text-sm text-muted-foreground truncate">
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