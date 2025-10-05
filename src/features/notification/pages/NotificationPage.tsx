import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TabSwitcher from '../components/TabSwitcher';
import NotificationItem from '../components/NotificationItem';
import { FollowRequestsDialog } from '@/features/profile/components/FollowRequestsDialog';
import { 
  setNotifications, 
  markAsRead, 
  markAllAsRead, 
  setActiveTab 
} from '../notificationSlice';
import { 
  fetchFollowRequestsAsync,
  acceptFollowRequestAsync,
  rejectFollowRequestAsync,
  setShowFollowRequestsDialog
} from '@/features/profile/profileSlice';
import { mockNotifications } from '../__mocks__/notifications';

const NotificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { notifications, activeTab, unreadCount } = useAppSelector(
    (state) => state.notification
  );
  const { followRequests, showFollowRequestsDialog, isLoading } = useAppSelector(
    (state) => state.profile
  );
  const currentUser = useAppSelector((state) => state.auth.user);

  // Load mock data on component mount
  useEffect(() => {
    dispatch(setNotifications(mockNotifications));
    
    // Fetch follow requests if user has private account
    if (currentUser?.isPrivate) {
      dispatch(fetchFollowRequestsAsync({}));
    }
  }, [dispatch, currentUser]);

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    const safeNotifications = notifications || [];
    switch (activeTab) {
      case 'following':
        return safeNotifications.filter(n => n.type === 'like' || n.type === 'comment');
      case 'you':
        return safeNotifications.filter(n => n.type === 'follow' || n.type === 'hashtag');
      default:
        return safeNotifications;
    }
  }, [notifications, activeTab]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    toast({
      title: "Đã đánh dấu",
      description: "Tất cả thông báo đã được đánh dấu là đã đọc",
    });
  };

  const handleTabChange = (tab: 'all' | 'following' | 'you') => {
    dispatch(setActiveTab(tab));
  };

  const handleNotificationClick = (notification) => {
    // Navigate to post or profile based on notification type
    if (notification.postId) {
      // Navigate to post details or comments
      console.log('Navigate to post:', notification.postId);
    } else if (notification.type === 'follow') {
      // Navigate to user profile
      console.log('Navigate to profile:', notification.userId);
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">Thông báo</h1>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-primary hover:text-primary/80 transition-colors duration-200"
            >
              <Check className="w-4 h-4 mr-2" />
              Đánh dấu tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Follow Requests Section - Only show if user has private account and pending requests */}
      {currentUser?.isPrivate && followRequests && followRequests.length > 0 && (
        <div className="border-b border-border bg-background">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Yêu cầu theo dõi</h3>
                  <p className="text-xs text-muted-foreground">
                    {followRequests?.length || 0} yêu cầu đang chờ
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowFollowRequests}
                className="text-primary hover:text-primary/80"
              >
                Xem tất cả
              </Button>
            </div>
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
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="divide-y divide-border">
          {filteredNotifications.length > 0 ? (
            <>
              {filteredNotifications.map((notification, index) => (
                <div 
                  key={notification.id}
                  className="animate-fade-in"
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onClick={() => handleNotificationClick(notification)}
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Check className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Không có thông báo
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {activeTab === 'all' 
                  ? 'Bạn đã xem hết tất cả thông báo'
                  : `Không có thông báo nào trong tab "${
                      activeTab === 'following' ? 'Đang theo dõi' : 'Bạn'
                    }"`
                }
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