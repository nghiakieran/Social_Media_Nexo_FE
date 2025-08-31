import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TabSwitcher from '../components/TabSwitcher';
import NotificationItem from '../components/NotificationItem';
import { 
  setNotifications, 
  markAsRead, 
  markAllAsRead, 
  setActiveTab 
} from '../notificationSlice';
import { mockNotifications } from '../__mocks__/notifications';

const NotificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { notifications, activeTab, unreadCount } = useAppSelector(
    (state) => state.notification
  );

  // Load mock data on component mount
  useEffect(() => {
    dispatch(setNotifications(mockNotifications));
  }, [dispatch]);

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'following':
        return notifications.filter(n => n.type === 'like' || n.type === 'comment');
      case 'you':
        return notifications.filter(n => n.type === 'follow' || n.type === 'hashtag');
      default:
        return notifications;
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

  const handleNotificationClick = (notification: any) => {
    // Navigate to post or profile based on notification type
    if (notification.postId) {
      // Navigate to post details or comments
      console.log('Navigate to post:', notification.postId);
    } else if (notification.type === 'follow') {
      // Navigate to user profile
      console.log('Navigate to profile:', notification.userId);
    }
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
    </div>
  );
};

export default NotificationPage;