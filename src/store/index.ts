import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import feature slices
import authSlice from '@/features/auth/authSlice';
import postSlice from '@/features/post/postSlice';
import interactionSlice from '@/features/interaction/interactionSlice';
import notificationSlice from '@/features/notification/notificationSlice';
import friendSlice from '@/features/friend/friendSlice';
import messageSlice from '@/features/message/messageSlice';
import exploreSlice from '@/features/explore/exploreSlice';
import profileSlice from '@/features/profile/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    post: postSlice,
    interaction: interactionSlice,
    notification: notificationSlice,
    friend: friendSlice,
    message: messageSlice,
    explore: exploreSlice,
    profile: profileSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;