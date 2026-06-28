import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createReel,
  getReelsFeed,
  getReelDetail,
  updateReel,
  toggleReelActive,
  deleteReel,
  likeReel,
  getUserReels,
} from "./api/reelApi";
import { transformReelData } from "./types";
import type {
  Reel,
  CreateReelRequest,
  UpdateReelRequest,
  GetReelsRequest,
  GetReelDetailRequest,
  LikeReelRequest,
  ReelComment,
  GetUserReelsRequest,
} from "./types";

interface ReelsState {
  reels: Reel[];
  currentReel: Reel | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  comments: {
    [reelId: string]: ReelComment[];
  };
  isCommentsDrawerOpen: boolean;
  selectedReelId: string | null;
}

const initialState: ReelsState = {
  reels: [],
  currentReel: null,
  isLoading: false,
  isCreating: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  totalPages: 0,
  comments: {},
  isCommentsDrawerOpen: false,
  selectedReelId: null,
};

// Async thunks for API calls
export const createReelThunk = createAsyncThunk(
  "reel/createReel",
  async (
    { files, reelData }: { files: File[]; reelData: CreateReelRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await createReel(files, reelData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo reel"
      );
    }
  }
);

export const getReelsFeedThunk = createAsyncThunk(
  "reel/getReelsFeed",
  async (params: GetReelsRequest, { rejectWithValue }) => {
    try {
      const response = await getReelsFeed(params);
      return {
        reels: response.data.content.map(transformReelData),
        hasMore: response.data.pageNo < response.data.totalPages - 1,
        currentPage: response.data.pageNo,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi tải reels"
      );
    }
  }
);

export const getUserReelsThunk = createAsyncThunk(
  "reel/getUserReels",
  async (params: GetUserReelsRequest, { rejectWithValue }) => {
    try {
      const response = await getUserReels(params);
      return {
        reels: response.data.content.map(transformReelData),
        hasMore: response.data.pageNo < response.data.totalPages - 1,
        currentPage: response.data.pageNo,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải reels của user"
      );
    }
  }
);

export const getReelDetailThunk = createAsyncThunk(
  "reel/getReelDetail",
  async (params: GetReelDetailRequest, { rejectWithValue }) => {
    try {
      const response = await getReelDetail(params);
      return transformReelData(response);
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải chi tiết reel"
      );
    }
  }
);

export const updateReelThunk = createAsyncThunk(
  "reel/updateReel",
  async (
    { files, reelData }: { files: File[]; reelData: UpdateReelRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateReel(files, reelData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật reel"
      );
    }
  }
);

export const toggleReelActiveThunk = createAsyncThunk(
  "reel/toggleReelActive",
  async (reelId: number, { rejectWithValue }) => {
    try {
      const response = await toggleReelActive(reelId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thay đổi trạng thái reel"
      );
    }
  }
);

export const deleteReelThunk = createAsyncThunk(
  "reel/deleteReel",
  async (reelId: number, { rejectWithValue }) => {
    try {
      const response = await deleteReel(reelId);
      return { reelId, response };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa reel"
      );
    }
  }
);

export const likeReelThunk = createAsyncThunk(
  "reel/likeReel",
  async (params: LikeReelRequest, { rejectWithValue }) => {
    try {
      const response = await likeReel(params);
      return { reelId: params.reelId, ...response.data };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi like reel"
      );
    }
  }
);

const reelSlice = createSlice({
  name: "reel",
  initialState,
  reducers: {
    setReels: (state, action: PayloadAction<Reel[]>) => {
      state.reels = action.payload;
    },
    addReels: (state, action: PayloadAction<Reel[]>) => {
      state.reels = [...state.reels, ...action.payload];
    },
    setCurrentReel: (state, action: PayloadAction<Reel | null>) => {
      state.currentReel = action.payload;
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
    updateReelLikeOptimistic: (
      state,
      action: PayloadAction<{ reelId: string; isLiked: boolean; likesCount: number }>
    ) => {
      const { reelId, isLiked, likesCount } = action.payload;
      const reel = state.reels.find((r) => r.id === reelId);
      if (reel) {
        reel.isLiked = isLiked;
        reel.likesCount = likesCount;
      }
      if (state.currentReel && state.currentReel.id === reelId) {
        state.currentReel.isLiked = isLiked;
        state.currentReel.likesCount = likesCount;
      }
    },
    incrementCommentsCount: (state, action: PayloadAction<string>) => {
      const reel = state.reels.find((r) => r.id === action.payload);
      if (reel) {
        reel.commentsCount += 1;
      }
      if (state.currentReel && state.currentReel.id === action.payload) {
        state.currentReel.commentsCount += 1;
      }
    },
    decrementCommentsCount: (state, action: PayloadAction<string>) => {
      const reel = state.reels.find((r) => r.id === action.payload);
      if (reel) {
        reel.commentsCount = Math.max(0, reel.commentsCount - 1);
      }
      if (state.currentReel && state.currentReel.id === action.payload) {
        state.currentReel.commentsCount = Math.max(0, state.currentReel.commentsCount - 1);
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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create reel
    builder
      .addCase(createReelThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createReelThunk.fulfilled, (state) => {
        state.isCreating = false;
        // Reel will be added to the list when the feed is refreshed
      })
      .addCase(createReelThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Get reels feed
    builder
      .addCase(getReelsFeedThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReelsFeedThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reels = action.payload.reels;
        state.hasMore = action.payload.hasMore;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getReelsFeedThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get user reels
    builder
      .addCase(getUserReelsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserReelsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const { reels, hasMore, currentPage, totalPages } = action.payload;
        if (currentPage === 0) {
          state.reels = reels;
        } else {
          const existingIds = new Set(state.reels.map((r) => r.id));
          const newReels = reels.filter((r) => !existingIds.has(r.id));
          state.reels.push(...newReels);
        }
        state.hasMore = hasMore;
        state.currentPage = currentPage;
        state.totalPages = totalPages;
      })
      .addCase(getUserReelsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get reel detail
    builder
      .addCase(getReelDetailThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReelDetailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReel = action.payload;
        // Update in reels list if exists
        const existingIndex = state.reels.findIndex(
          (reel) => reel.id === action.payload.id
        );
        if (existingIndex !== -1) {
          state.reels[existingIndex] = action.payload;
        }
      })
      .addCase(getReelDetailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update reel
    builder
      .addCase(updateReelThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReelThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateReelThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete reel
    builder
      .addCase(deleteReelThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReelThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reels = state.reels.filter(
          (reel) => reel.id !== action.payload.reelId.toString()
        );
      })
      .addCase(deleteReelThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Like reel
    builder.addCase(likeReelThunk.fulfilled, (state, action) => {
      const reel = state.reels.find(
        (r) => r.id === action.payload.reelId.toString()
      );
      if (reel) {
        reel.isLiked = action.payload.isLike;
        reel.likesCount = action.payload.quantityLike;
      }
      if (
        state.currentReel &&
        state.currentReel.id === action.payload.reelId.toString()
      ) {
        state.currentReel.isLiked = action.payload.isLike;
        state.currentReel.likesCount = action.payload.quantityLike;
      }
    });
  },
});

export const {
  setReels,
  addReels,
  setCurrentReel,
  setLoading,
  setError,
  setHasMore,
  toggleLike,
  updateReelLikeOptimistic,
  incrementCommentsCount,
  decrementCommentsCount,
  setComments,
  addComment,
  toggleCommentLike,
  openCommentsDrawer,
  closeCommentsDrawer,
  clearError,
} = reelSlice.actions;

export default reelSlice.reducer;
