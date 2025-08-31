import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FriendRequest } from '../friendSlice';
import { Check, X, Verified } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  className?: string;
}

export const FriendRequestCard = ({
  request,
  onAccept,
  onDecline,
  className,
}: FriendRequestCardProps) => {
  const { toast } = useToast();

  const handleAccept = () => {
    onAccept?.(request.id);
    toast({
      description: `Đã chấp nhận lời mời kết bạn từ ${request.user.name}`,
    });
  };

  const handleDecline = () => {
    onDecline?.(request.id);
    toast({
      description: 'Đã từ chối lời mời kết bạn',
    });
  };

  const timeAgo = formatDistanceToNow(new Date(request.timestamp), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <Card className={`hover:shadow-soft transition-shadow duration-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={request.user.avatar} alt={request.user.name} />
            <AvatarFallback className="bg-gradient-instagram text-white font-medium">
              {request.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-semibold text-sm truncate">{request.user.name}</h3>
              {request.user.isVerified && (
                <Verified className="w-4 h-4 text-primary fill-current flex-shrink-0" />
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-1">@{request.user.username}</p>
            
            {request.user.mutualFriends > 0 && (
              <p className="text-xs text-muted-foreground mb-2">
                {request.user.mutualFriends} bạn chung
              </p>
            )}

            {request.user.bio && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {request.user.bio}
              </p>
            )}

            {request.message && (
              <div className="bg-muted/50 rounded-lg p-2 mb-2">
                <p className="text-xs text-foreground">{request.message}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mb-3">{timeAgo}</p>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="instagram"
                onClick={handleAccept}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" />
                Chấp nhận
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecline}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" />
                Từ chối
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};