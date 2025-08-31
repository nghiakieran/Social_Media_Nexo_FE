import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'system' | 'hashtag';
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  postId?: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  activeTab: 'all' | 'following' | 'you';
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  activeTab: 'all',
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.isRead = true);
      state.unreadCount = 0;
    },
    setActiveTab: (state, action: PayloadAction<'all' | 'following' | 'you'>) => {
      state.activeTab = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
  },
});

export const { 
  setNotifications, 
  markAsRead, 
  markAllAsRead, 
  setActiveTab, 
  addNotification 
} = notificationSlice.actions;

export default notificationSlice.reducer;