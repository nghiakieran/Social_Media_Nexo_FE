import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowButton } from './FollowButton';
import { User } from '../friendSlice';
import { MoreHorizontal, Verified, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SuggestedUserCardProps {
  user: User;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onRemove?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  className?: string;
}

export const SuggestedUserCard = ({
  user,
  onFollow,
  onUnfollow,
  onRemove,
  onBlock,
  className,
}: SuggestedUserCardProps) => {
  return (
    <Card className={`hover:shadow-soft transition-shadow duration-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-instagram text-white font-medium">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                {user.isVerified && (
                  <Verified className="w-4 h-4 text-primary fill-current" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
              {user.mutualFriends > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {user.mutualFriends} bạn chung
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRemove?.(user.id)}>
                <X className="w-4 h-4 mr-2" />
                Xóa gợi ý
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onBlock?.(user.id)}
                className="text-destructive"
              >
                Chặn người dùng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {user.bio && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {user.bio}
          </p>
        )}

        <div className="flex items-center justify-between">
          <FollowButton
            userId={user.id}
            isFollowing={user.isFollowing}
            isFollowingYou={user.isFollowingYou}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            size="sm"
            className="flex-1 mr-2"
          />
          
          <Button variant="outline" size="sm" className="flex-1">
            Xem trang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};