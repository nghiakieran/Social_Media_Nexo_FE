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
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await storyApi.createStory(file, storyData, (progressEvent) => {
        // Dispatch progress to Redux state
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        dispatch(setUploadProgress(progress));
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

// Like/Unlike Story Thunk
export const likeStoryThunk = createAsyncThunk(
  "story/likeStory",
  async (storyId: number, { rejectWithValue }) => {
    try {
      const response = await storyApi.likeStory(storyId);
      return { storyId, response };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Có lỗi xảy ra khi like story");
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
    // Upsert a profile story into friendStories or userStories
    upsertProfileStory: (state, action: PayloadAction<Story>) => {
      const story = action.payload;
      
      if (story.isOwnStory) {
        // Add/update in userStories
        const existingIndex = state.userStories.findIndex(s => s.id === story.id);
        if (existingIndex >= 0) {
          state.userStories[existingIndex] = story;
        } else {
          state.userStories.push(story);
        }
      } else {
        // Add/update in friendStories
        const existingIndex = state.friendStories.findIndex(s => s.id === story.id);
        if (existingIndex >= 0) {
          state.friendStories[existingIndex] = story;
        } else {
          state.friendStories.push(story);
        }
      }
    },
    // Mark a specific story content as seen (after viewing)
    markStoryAsSeen: (state, action: PayloadAction<{ userId: string; storyId: string }>) => {
      const { userId, storyId } = action.payload;
      
      // Update in friendStories
      const friendStory = state.friendStories.find(s => s.id === userId);
      if (friendStory) {
        const content = friendStory.content.find(c => c.id === storyId);
        if (content) {
          content.isSeen = true;
        }
        // Check if all contents are seen to mark story as viewed
        friendStory.isViewed = friendStory.content.every(c => c.isSeen);
      }
      
      // Update in userStories (in case viewing own archived stories)
      const userStory = state.userStories.find(s => s.id === userId);
      if (userStory) {
        const content = userStory.content.find(c => c.id === storyId);
        if (content) {
          content.isSeen = true;
        }
        userStory.isViewed = userStory.content.every(c => c.isSeen);
      }
    },
    // Remove a story content from user's stories (after delete/archive)
    removeStoryContent: (state, action: PayloadAction<{ userId: string; storyId: string; fromArchive?: boolean }>) => {
      const { userId, storyId, fromArchive = false } = action.payload;
      
      if (fromArchive) {
        // Remove from archivedStories
        const archivedStory = state.archivedStories.find(s => s.id === userId);
        if (archivedStory) {
          archivedStory.content = archivedStory.content.filter(c => c.id !== storyId);
          // If no content left, remove the entire story
          if (archivedStory.content.length === 0) {
            state.archivedStories = state.archivedStories.filter(s => s.id !== userId);
          }
        }
      } else {
        // Remove from userStories
        const userStory = state.userStories.find(s => s.id === userId);
        if (userStory) {
          userStory.content = userStory.content.filter(c => c.id !== storyId);
          // If no content left, remove the entire story
          if (userStory.content.length === 0) {
            state.userStories = state.userStories.filter(s => s.id !== userId);
          }
        }
        
        // Remove from friendStories (shouldn't happen, but for safety)
        const friendStory = state.friendStories.find(s => s.id === userId);
        if (friendStory) {
          friendStory.content = friendStory.content.filter(c => c.id !== storyId);
          if (friendStory.content.length === 0) {
            state.friendStories = state.friendStories.filter(s => s.id !== userId);
          }
        }
      }
    },
    // Toggle like state for a story content
    toggleStoryLike: (state, action: PayloadAction<{ userId: string; storyId: string; isLiked: boolean }>) => {
      const { userId, storyId, isLiked } = action.payload;
      
      // Update in friendStories
      const friendStory = state.friendStories.find(s => s.id === userId);
      if (friendStory) {
        const content = friendStory.content.find(c => c.id === storyId);
        if (content) {
          content.isLike = isLiked;
        }
      }
      
      // Update in userStories
      const userStory = state.userStories.find(s => s.id === userId);
      if (userStory) {
        const content = userStory.content.find(c => c.id === storyId);
        if (content) {
          content.isLike = isLiked;
        }
      }
      
      // Update in archivedStories
      const archivedStory = state.archivedStories.find(s => s.id === userId);
      if (archivedStory) {
        const content = archivedStory.content.find(c => c.id === storyId);
        if (content) {
          content.isLike = isLiked;
        }
      }
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
      // Like Story
      .addCase(likeStoryThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(likeStoryThunk.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(likeStoryThunk.rejected, (state, action) => {
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
  setArchivedStories,
  upsertProfileStory,
  markStoryAsSeen,
  removeStoryContent,
  toggleStoryLike
} = storySlice.actions;

export default storySlice.reducer;
