import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as storyApi from "./api/storyApi";
import type { CreateStoryRequest, GetStoriesRequest, Story, UserStoriesData } from "./types";
import { transformUserStoriesToStory } from "./types";

interface StoryState {
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  userStories: Story[]; // Current user's stories
  friendStories: Story[]; // Friends' stories
  archivedStories: Story[]; // All stories including archived
  // Separate pagination for user stories
  userHasMore: boolean;
  userCurrentPage: number;
  // Separate pagination for friend stories
  friendHasMore: boolean;
  friendCurrentPage: number;
  // Separate pagination for archived stories
  archivedHasMore: boolean;
  archivedCurrentPage: number;
}

const initialState: StoryState = {
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  userStories: [],
  friendStories: [],
  archivedStories: [],
  userHasMore: true,
  userCurrentPage: 0,
  friendHasMore: true,
  friendCurrentPage: 0,
  archivedHasMore: true,
  archivedCurrentPage: 0,
};

// Create Story Thunk
export const createStoryThunk = createAsyncThunk(
  "story/createStory",
  async (
    {
      file,
      storyData,
    }: {
      file: File;
      storyData: CreateStoryRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await storyApi.createStory(file, storyData, (progressEvent) => {
        // Progress will be handled by reducer
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        console.log("Upload progress:", progress);
      });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi tạo story");
    }
  }
);

// Delete Story Thunk
export const deleteStoryThunk = createAsyncThunk(
  "story/deleteStory",
  async (storyId: number, { rejectWithValue }) => {
    try {
      const response = await storyApi.deleteStory(storyId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi xóa story");
    }
  }
);

// Archive Story Thunk
export const archiveStoryThunk = createAsyncThunk(
  "story/archiveStory",
  async (storyId: number, { rejectWithValue }) => {
    try {
      const response = await storyApi.archiveStory(storyId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi lưu trữ story");
    }
  }
);

// View Story Thunk
export const viewStoryThunk = createAsyncThunk(
  "story/viewStory",
  async (storyId: number, { rejectWithValue }) => {
    try {
      const response = await storyApi.viewStory(storyId);
      return { storyId, response };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi xem story");
    }
  }
);

// Get User Stories Thunk (current user's own stories)
export const getUserStoriesThunk = createAsyncThunk(
  "story/getUserStories",
  async (params: GetStoriesRequest, { rejectWithValue }) => {
    try {
      const response = await storyApi.getUserStories(params);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi tải stories");
    }
  }
);

// Get Friend Stories Thunk (friends' stories for feed)
export const getFriendStoriesThunk = createAsyncThunk(
  "story/getFriendStories",
  async (params: GetStoriesRequest, { rejectWithValue }) => {
    try {
      const response = await storyApi.getFriendStories(params);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi tải stories");
    }
  }
);

// Get All User Stories Thunk (including archived)
export const getAllUserStoriesThunk = createAsyncThunk(
  "story/getAllUserStories",
  async (params: GetStoriesRequest, { rejectWithValue }) => {
    try {
      const response = await storyApi.getAllUserStories(params);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi tải stories");
    }
  }
);

const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
      state.isUploading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUserStories: (state, action: PayloadAction<Story[]>) => {
      state.userStories = action.payload;
    },
    setFriendStories: (state, action: PayloadAction<Story[]>) => {
      state.friendStories = action.payload;
    },
    setArchivedStories: (state, action: PayloadAction<Story[]>) => {
      state.archivedStories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Story
      .addCase(createStoryThunk.pending, (state) => {
        state.isLoading = true;
        state.isUploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(createStoryThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isUploading = false;
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(createStoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      })
      // Delete Story
      .addCase(deleteStoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteStoryThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteStoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Archive Story
      .addCase(archiveStoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(archiveStoryThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(archiveStoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // View Story
      .addCase(viewStoryThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(viewStoryThunk.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(viewStoryThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Get User Stories
      .addCase(getUserStoriesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserStoriesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const stories = action.payload.data.content.map((userData) => {
          // Mark as own story
          const story = transformUserStoriesToStory(userData, userData.userId);
          return { ...story, isOwnStory: true };
        });
        
        if (action.payload.data.pageNo === 0) {
          state.userStories = stories;
        } else {
          state.userStories = [...state.userStories, ...stories];
        }
        
        // Check if has more: not last page AND has content
        state.userHasMore = !action.payload.data.last && stories.length > 0;
        state.userCurrentPage = action.payload.data.pageNo;
        state.error = null;
      })
      .addCase(getUserStoriesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.userHasMore = false; // Stop loading more on error
      })
      // Get Friend Stories
      .addCase(getFriendStoriesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFriendStoriesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const stories = action.payload.data.content.map(transformUserStoriesToStory);
        
        if (action.payload.data.pageNo === 0) {
          state.friendStories = stories;
        } else {
          state.friendStories = [...state.friendStories, ...stories];
        }
        
        // Check if has more: not last page AND has content
        state.friendHasMore = !action.payload.data.last && stories.length > 0;
        state.friendCurrentPage = action.payload.data.pageNo;
        state.error = null;
      })
      .addCase(getFriendStoriesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.friendHasMore = false; // Stop loading more on error
      })
      // Get All User Stories (including archived)
      .addCase(getAllUserStoriesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUserStoriesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const stories = action.payload.data.content.map((userData) => {
          const story = transformUserStoriesToStory(userData, userData.userId);
          return { ...story, isOwnStory: true };
        });
        
        if (action.payload.data.pageNo === 0) {
          state.archivedStories = stories;
        } else {
          state.archivedStories = [...state.archivedStories, ...stories];
        }
        
        // Check if has more: not last page AND has content
        state.archivedHasMore = !action.payload.data.last && stories.length > 0;
        state.archivedCurrentPage = action.payload.data.pageNo;
        state.error = null;
      })
      .addCase(getAllUserStoriesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.archivedHasMore = false; // Stop loading more on error
      });
  },
});

export const { 
  setUploadProgress, 
  resetUploadProgress, 
  clearError,
  setUserStories,
  setFriendStories,
  setArchivedStories
} = storySlice.actions;

export default storySlice.reducer;
