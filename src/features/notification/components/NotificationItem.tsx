import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { navigateToPost, navigateToPost2, navigateToProfile } from "@/utils/navigation";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import {
  Bell,
  Hash,
  Heart,
  MessageCircle,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationDTO } from "../types";
import { formatTimeAgo } from "@/utils/timeFormat";
import { readNotificationGroupThunk, readNotificationThunk } from "../notificationSlice";
import { useAppDispatch } from "@/store";

interface NotificationItemProps {
  notification: NotificationDTO;
  onMarkAsRead: (id: string | number) => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = notification.userList[0];


  const getNotificationIcon = () => {
    switch (notification.notificationType) {
      case "LIKE_POST":
      case "LIKE_STORY":
      case "LIKE_COMMENT":
      case "LIKE_REEL":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "COMMENT_POST":
      case "COMMENT_REEL":
      case "COMMENT_MENTION":
        return <MessageCircle className="h-4 w-4 text-primary" />;
      case "FOLLOW":
        return <UserPlus className="h-4 w-4 text-primary" />;
      case "TAG":
        return <Hash className="w-4 h-4 text-green-500" />;
      case "MESSAGE":
      case "SYSTEM":
      default:
        return <Bell className="w-4 h-4 text-orange-500" />;
    }
  };

  const handleClick = async () => {
    try {
      if (!notification.isRead) {
        if (notification.userList && notification.userList.length > 1) {
          await dispatch(
            readNotificationGroupThunk({
              targetUrl: notification.targetUrl || "",
              notificationType: notification.notificationType,
            })
          ).unwrap();
        } else {
          await dispatch(readNotificationThunk(Number(notification.id))).unwrap();
        }
      }

      if (notification.targetUrl) {
        let url = notification.targetUrl;
        if (notification.notificationType === "LIKE_STORY" || url.includes("story")) {
          const match = url.match(/\/(\d+)(?:\D|$)/);
          if (match && match[1]) {
            url = `/posts/story/view-detail/${match[1]}`;
          } else {
            url = url.replace(/^\/?api\//, "/");
          }
        }
        navigateToPost2(navigate, url);
      }
    } catch (error) {
      console.error("Đánh dấu thông báo lỗi:", error);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      navigateToProfile(navigate, user.userName);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${notification.isRead
        ? "bg-card/50"
        : "bg-primary/5 border-primary/20 shadow-sm"
        }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">{getNotificationIcon()}</div>

          {/* Avatar */}
          <Avatar
            className="w-10 h-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
            onClick={handleProfileClick}
          >
            {user?.avatarUrl ? (
              <AvatarImage src={getAvatarUrl(user.avatarUrl)} alt={user.userName} />
            ) : (
              <AvatarFallback>{getAvatarInitials(user?.userName || "U")}</AvatarFallback>
            )}
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  {notification.userList.length > 0 && (
                    <span
                      className="font-semibold hover:text-primary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToProfile(navigate, notification.userList[0].userName);
                      }}
                    >
                      {notification.userList[0].userName}
                    </span>
                  )}
                  {notification.userList.length > 1
                    ? ``
                    : " "}
                  <span>
                    {notification.message.replace(notification.userList[0].userName, "")}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(new Date(notification.createdAt).toISOString())}
                </p>
              </div>

              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};