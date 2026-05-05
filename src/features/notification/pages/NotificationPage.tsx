import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FollowRequestsDialog } from "@/features/profile/components/FollowRequestsDialog";
import {
  acceptFollowRequestAsync,
  fetchFollowRequestsAsync,
  rejectFollowRequestAsync,
  setShowFollowRequestsDialog,
} from "@/features/profile/profileSlice";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  formatDateSectionLabel,
  groupItemsByCreatedDate,
} from "@/utils/timeFormat";
import { Check, UserPlus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { NotificationItem } from "../components/NotificationItem";
import TabSwitcher from "../components/TabSwitcher";
import {
  appendNotifications,
  getNotificationsThunk,
  markAllAsRead,
  markAsRead,
  readAllNotificationsThunk,
  setActiveTab,
} from "../notificationSlice";

const NotificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { notifications, activeTab, unreadCount, loading } = useAppSelector(
    (state) => state.notification
  );
  const { followRequests, showFollowRequestsDialog, isLoading } =
    useAppSelector((state) => state.profile);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [page, setPage] = useState(0);
  const limit = 20;

  // Load notifications page 1 on mount
  useEffect(() => {
    setPage(0);
    dispatch(getNotificationsThunk({ page: 0, limit }));
    if (currentUser?.isPrivate) {
      dispatch(fetchFollowRequestsAsync({}));
    }
  }, [dispatch, currentUser]);

  const filteredNotifications = useMemo(() => {
    const safeNotifications = notifications || [];
    switch (activeTab) {
      case "following":
        return safeNotifications.filter(
          (n) =>
            n.notificationType.toLowerCase().includes("like") ||
            n.notificationType.toLowerCase().includes("comment")
        );
      case "you":
        return safeNotifications.filter(
          (n) =>
            n.notificationType.toLowerCase().includes("follow") ||
            n.notificationType.toLowerCase().includes("hashtag")
        );
      default:
        return safeNotifications;
    }
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    return groupItemsByCreatedDate(filteredNotifications);
  }, [filteredNotifications]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(Number(id)));
  };

  const handleMarkAllAsRead = () => {
    dispatch(readAllNotificationsThunk());
    toast({
      variant: "success",
      title: "Đã đánh dấu",
      description: "Tất cả thông báo đã được đánh dấu là đã đọc",
    });
  };

  const handleTabChange = (tab: "all" | "following" | "you") => {
    dispatch(setActiveTab(tab));
  };

  const handleShowFollowRequests = () => {
    dispatch(setShowFollowRequestsDialog(true));
  };

  const handleAcceptFollowRequest = (username: string) => {
    dispatch(acceptFollowRequestAsync(username));
  };

  const handleRejectFollowRequest = (username: string) => {
    dispatch(rejectFollowRequestAsync(username));
  };

  // Infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight < 100 &&
      !loading
    ) {
      const nextPage = page + 1;
      setPage(nextPage);

      dispatch(getNotificationsThunk({ page: nextPage, limit }))
        .unwrap()
        .then((res) => {
          dispatch(appendNotifications(res.content));
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">Thông báo</h1>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-primary hover:text-white transition-colors duration-200"
            >
              <Check className="w-4 h-4 mr-2" />
              Đánh dấu tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Follow Requests */}
      {currentUser?.isPrivate && followRequests?.length > 0 && (
        <div className="border-b border-border bg-background">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Yêu cầu theo dõi</h3>
                <p className="text-xs text-muted-foreground">
                  {followRequests?.length} yêu cầu đang chờ
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowFollowRequests}
              className="text-primary hover:text-white"
            >
              Xem tất cả
            </Button>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <TabSwitcher
        activeTab={activeTab}
        onTabChange={handleTabChange}
        unreadCount={unreadCount}
      />

      {/* Notifications List */}
      <ScrollArea
        className="h-[calc(100vh-140px)]"
        onScroll={handleScroll} // gắn scroll event
      >
        <div className="px-2 pb-4 pt-2">
          {groupedNotifications.length > 0 ? (
            groupedNotifications.map((group, groupIndex) => (
              <div key={group.dateKey} className="mb-5 last:mb-0">
                <div className="px-2 pb-2 pt-1">
                  <h3 className="text-sm font-semibold text-foreground/90">
                    {formatDateSectionLabel(group.dateKey)}
                  </h3>
                </div>
                <div className="space-y-2">
                  {group.items.map((notification, itemIndex) => (
                    <div
                      key={notification.id}
                      className="animate-fade-in"
                      style={{
                        animationDelay: `${(groupIndex + itemIndex) * 0.03}s`,
                        animationFillMode: "both",
                      }}
                    >
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Check className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Không có thông báo
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {activeTab === "all"
                  ? "Bạn đã xem hết tất cả thông báo"
                  : `Không có thông báo nào trong tab "${activeTab === "following" ? "Đang theo dõi" : "Bạn"
                  }"`}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Follow Requests Dialog */}
      <FollowRequestsDialog
        isOpen={showFollowRequestsDialog}
        onClose={() => dispatch(setShowFollowRequestsDialog(false))}
        followRequests={followRequests || []}
        onAccept={handleAcceptFollowRequest}
        onReject={handleRejectFollowRequest}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NotificationPage;

