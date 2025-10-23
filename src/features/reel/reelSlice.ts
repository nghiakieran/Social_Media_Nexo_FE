import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reel, ReelComment, ReelsState } from './types';

const initialState: ReelsState = {
  reels: [],
  currentReelIndex: 0,
  isLoading: false,
  error: null,
  hasMore: true,
  comments: {},
  isCommentsDrawerOpen: false,
  selectedReelId: null,
};

const reelSlice = createSlice({
  name: 'reel',
  initialState,
  reducers: {
    setReels: (state, action: PayloadAction<Reel[]>) => {
      state.reels = action.payload;
    },
    addReels: (state, action: PayloadAction<Reel[]>) => {
      state.reels = [...state.reels, ...action.payload];
    },
    setCurrentReelIndex: (state, action: PayloadAction<number>) => {
      state.currentReelIndex = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const reel = state.reels.find((r) => r.id === action.payload);
      if (reel) {
        reel.isLiked = !reel.isLiked;
        reel.likesCount += reel.isLiked ? 1 : -1;
      }
    },
    incrementCommentsCount: (state, action: PayloadAction<string>) => {
      const reel = state.reels.find((r) => r.id === action.payload);
      if (reel) {
        reel.commentsCount += 1;
      }
    },
    setComments: (
      state,
      action: PayloadAction<{ reelId: string; comments: ReelComment[] }>
    ) => {
      state.comments[action.payload.reelId] = action.payload.comments;
    },
    addComment: (
      state,
      action: PayloadAction<{ reelId: string; comment: ReelComment }>
    ) => {
      const { reelId, comment } = action.payload;
      if (!state.comments[reelId]) {
        state.comments[reelId] = [];
      }
      state.comments[reelId].unshift(comment);
    },
    toggleCommentLike: (
      state,
      action: PayloadAction<{ reelId: string; commentId: string }>
    ) => {
      const { reelId, commentId } = action.payload;
      const comments = state.comments[reelId];
      if (comments) {
        const comment = comments.find((c) => c.id === commentId);
        if (comment) {
          comment.isLiked = !comment.isLiked;
          comment.likesCount += comment.isLiked ? 1 : -1;
        }
      }
    },
    openCommentsDrawer: (state, action: PayloadAction<string>) => {
      state.isCommentsDrawerOpen = true;
      state.selectedReelId = action.payload;
    },
    closeCommentsDrawer: (state) => {
      state.isCommentsDrawerOpen = false;
      state.selectedReelId = null;
    },
  },
});

export const {
  setReels,
  addReels,
  setCurrentReelIndex,
  setLoading,
  setError,
  setHasMore,
  toggleLike,
  incrementCommentsCount,
  setComments,
  addComment,
  toggleCommentLike,
  openCommentsDrawer,
  closeCommentsDrawer,
} = reelSlice.actions;

export default reelSlice.reducer;
