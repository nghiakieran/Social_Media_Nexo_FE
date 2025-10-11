import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { navigateToPost, navigateToProfile } from "@/utils/navigation";
import {
  Bell,
  Hash,
  Heart,
  MessageCircle,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Notification } from "../notificationSlice";
import { formatTimeAgo } from "@/utils/timeFormat";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
}: NotificationItemProps) => {
  const navigate = useNavigate();

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case "hashtag":
        return <Hash className="w-4 h-4 text-green-500" />;
      case "system":
        return <Bell className="w-4 h-4 text-orange-500" />;
      default:
        return <ThumbsUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleClick = () => {
    // Mark as read
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "like":
      case "comment":
      case "hashtag":
        if (notification.postId) {
          navigateToPost(navigate, notification.postId);
        }
        break;
      case "follow":
        navigateToProfile(navigate, notification.userName);
        break;
      case "system":
        // System notifications usually don't navigate anywhere
        break;
      default:
        // Default action or no action
        break;
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToProfile(navigate, notification.userName);
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        notification.isRead
          ? "bg-card/50"
          : "bg-primary/5 border-primary/20 shadow-sm"
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Notification Icon */}
          <div className="flex-shrink-0 mt-1">{getNotificationIcon()}</div>

          {/* Avatar */}
          <Avatar
            className="w-10 h-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
            onClick={handleProfileClick}
          >
            <AvatarImage
              src={notification.userAvatar}
              alt={notification.userName}
            />
            <AvatarFallback>{notification.userName.charAt(0)}</AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span
                    className="font-semibold hover:text-primary cursor-pointer"
                    onClick={handleProfileClick}
                  >
                    {notification.userName}
                  </span>{" "}
                  {notification.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(notification.timestamp)}
                </p>
              </div>

              {/* Unread indicator */}
              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
