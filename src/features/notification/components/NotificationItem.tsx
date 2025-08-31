import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, UserPlus, Hash, Bell } from 'lucide-react';
import { Notification } from '../notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onClick 
}) => {
  const getNotificationIcon = () => {
    const iconClass = "w-4 h-4";
    switch (notification.type) {
      case 'like':
        return <Heart className={`${iconClass} text-destructive fill-destructive`} />;
      case 'comment':
        return <MessageCircle className={`${iconClass} text-primary`} />;
      case 'follow':
        return <UserPlus className={`${iconClass} text-secondary`} />;
      case 'hashtag':
        return <Hash className={`${iconClass} text-accent`} />;
      case 'system':
        return <Bell className={`${iconClass} text-muted-foreground`} />;
      default:
        return <Bell className={`${iconClass} text-muted-foreground`} />;
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.();
  };

  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div 
      className={`
        flex items-start space-x-3 p-4 border-b border-border last:border-b-0 
        cursor-pointer transition-all duration-200 hover:bg-muted/50 
        animate-slide-in-right
        ${!notification.isRead ? 'bg-primary/5' : ''}
      `}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar className="w-12 h-12 ring-2 ring-primary/10 transition-all duration-200 hover:ring-primary/30">
          <AvatarImage 
            src={notification.userAvatar} 
            alt={notification.userName} 
          />
          <AvatarFallback>
            {notification.userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Notification type icon */}
        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
          {getNotificationIcon()}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-semibold text-foreground hover:underline">
                {notification.userName}
              </span>
              <span className="text-muted-foreground ml-1">
                {notification.content}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {timeAgo}
            </p>
          </div>
          
          {!notification.isRead && (
            <Badge 
              variant="destructive" 
              className="w-2 h-2 p-0 rounded-full ml-2 animate-pulse"
            />
          )}
        </div>

        {/* Action buttons for certain notification types */}
        {notification.type === 'follow' && (
          <div className="pt-2">
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs transition-all duration-200 hover:scale-[1.02]"
            >
              Theo dõi lại
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;