import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  GetNotificationsRequest,
  GetNotificationsResponse,
  NotificationDTO,
  ReadNotificationGroupRequest,
} from './types';
import { getNotifications, readAllNotifications, readNotification, readNotificationGroup } from './api/notificatrionApi';

interface NotificationState {
  notifications: NotificationDTO[];
  activeTab: 'all' | 'following' | 'you';
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  activeTab: 'all',
  unreadCount: 0,
  loading: false,
  error: null,
};

// Thunks
export const getNotificationsThunk = createAsyncThunk<
  GetNotificationsResponse,
  GetNotificationsRequest,
  { rejectValue: string }
>('notification/getNotifications', async (params, { rejectWithValue }) => {
  try {
    const response = await getNotifications(params);
    return response;
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải thông báo');
  }
});

export const readNotificationThunk = createAsyncThunk<
  string,
  number,
  { rejectValue: string }
>('notification/readNotification', async (id, { rejectWithValue }) => {
  try {
    const response = await readNotification(id);
    return response;
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đọc thông báo');
  }
});

export const readAllNotificationsThunk = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('notification/readAllNotifications', async (_, { rejectWithValue }) => {
  try {
    const response = await readAllNotifications();
    return response;
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đọc tất cả thông báo');
  }
});

export const readNotificationGroupThunk = createAsyncThunk<
  string,
  ReadNotificationGroupRequest,
  { rejectValue: string }
>('notification/readNotificationGroup', async (request, { rejectWithValue }) => {
  try {
    const response = await readNotificationGroup(request);
    return response;
  } catch (error: unknown) {
    return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đọc nhóm thông báo');
  }
});

// Slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationDTO[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const noti = state.notifications.find((n) => n.id === action.payload);
      if (noti && !noti.isRead) {
        noti.isRead = true;
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
    setActiveTab: (state, action: PayloadAction<'all' | 'following' | 'you'>) => {
      state.activeTab = action.payload;
    },
    addNotification: (state, action: PayloadAction<NotificationDTO>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    appendNotifications: (state, action: PayloadAction<NotificationDTO[]>) => {
      state.notifications.push(...action.payload);
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
    },
  },
  extraReducers: (builder) => {
    builder
      // getNotifications
      .addCase(getNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.content;
        state.unreadCount = action.payload.content.filter((n) => !n.isRead).length;
      })
      .addCase(getNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải thông báo';
      })

      // readNotification
      .addCase(readNotificationThunk.fulfilled, (state, action) => {
        const id = action.meta.arg;
        const noti = state.notifications.find((n) => n.id === id);
        if (noti && !noti.isRead) {
          noti.isRead = true;
          state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
        }
      })

      // readAllNotifications
      .addCase(readAllNotificationsThunk.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      })

      .addCase(readNotificationGroupThunk.fulfilled, (state, action) => {
        const { targetUrl, notificationType } = action.meta.arg;
        state.notifications
          .filter((n) => n.notificationType === notificationType && n.targetUrl === targetUrl)
          .forEach((n) => (n.isRead = true));
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      });
  },
});

export const {
  setNotifications,
  markAsRead,
  markAllAsRead,
  setActiveTab,
  addNotification,
  appendNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;
