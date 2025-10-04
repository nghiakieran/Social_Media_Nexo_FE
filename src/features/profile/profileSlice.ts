import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfile, getFollowersByUsername, getFollowingByUsername, updateUserProfile, getFollowRequests, acceptFollowRequest, rejectFollowRequest, followUser, unfollowUser, getCloseFriends, toggleCloseFriend } from './api/profileApi';
import { transformProfileData } from './types';
import type { UserProfile, ProfilePost, StoryHighlight, FollowerUser, FollowingUser, UpdateProfileRequest, FollowRequestUser, CloseFriendUser } from './types';

interface ProfileState {
  currentProfile: UserProfile | null;
  posts: ProfilePost[];
  reels: ProfilePost[];
  saved: ProfilePost[];
  highlights: StoryHighlight[];
  followers: FollowerUser[];
  following: FollowingUser[];
  followRequests: FollowRequestUser[];
  closeFriends: CloseFriendUser[];
  activeTab: 'posts' | 'reels' | 'saved';
  isLoading: boolean;
  error: string | null;
  showFollowersDialog: boolean;
  showFollowingDialog: boolean;
  showFollowRequestsDialog: boolean;
  showBlockDialog: boolean;
  showReportDialog: boolean;
  showAvatarDialog: boolean;
  showCreateHighlightDialog: boolean;
}

const initialState: ProfileState = {
  currentProfile: null,
  posts: [],
  reels: [],
  saved: [],
  highlights: [],
  followers: [],
  following: [],
  followRequests: [],
  closeFriends: [],
  activeTab: 'posts',
  isLoading: false,
  error: null,
  showFollowersDialog: false,
  showFollowingDialog: false,
  showFollowRequestsDialog: false,
  showBlockDialog: false,
  showReportDialog: false,
  showAvatarDialog: false,
  showCreateHighlightDialog: false,
};

// Async thunks for API calls
export const fetchCurrentUserProfileAsync = createAsyncThunk(
  'profile/fetchCurrentUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profileData = await getProfile();
      return transformProfileData(profileData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể tải thông tin profile';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserProfileByUsernameAsync = createAsyncThunk(
  'profile/fetchUserProfileByUsername',
  async (username: string, { rejectWithValue }) => {
    try {
      const profileData = await getProfile(username);
      return transformProfileData(profileData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể tải thông tin profile';
      return rejectWithValue(message);
    }
  }
);

export const fetchFollowersByUsernameAsync = createAsyncThunk(
  'profile/fetchFollowersByUsername',
  async ({ username, page = 0, limit = 10 }: { username: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const followers = await getFollowersByUsername(username, page, limit);
      return followers;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể tải danh sách followers';
      return rejectWithValue(message);
    }
  }
);

export const fetchFollowingByUsernameAsync = createAsyncThunk(
  'profile/fetchFollowingByUsername',
  async ({ username, page = 0, limit = 10 }: { username: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const following = await getFollowingByUsername(username, page, limit);
      return following;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể tải danh sách following';
      return rejectWithValue(message);
    }
  }
);

export const updateUserProfileAsync = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const updatedProfileData = await updateUserProfile(profileData);
      return transformProfileData(updatedProfileData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể cập nhật profile';
      return rejectWithValue(message);
    }
  }
);

export const fetchFollowRequestsAsync = createAsyncThunk(
  'profile/fetchFollowRequests',
  async ({ page = 0, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const followRequests = await getFollowRequests(page, limit);
      return followRequests;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể tải danh sách yêu cầu theo dõi';
      return rejectWithValue(message);
    }
  }
);

export const acceptFollowRequestAsync = createAsyncThunk(
  'profile/acceptFollowRequest',
  async (username: string, { rejectWithValue }) => {
    try {
      await acceptFollowRequest(username);
      return username;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể chấp nhận yêu cầu theo dõi';
      return rejectWithValue(message);
    }
  }
);

export const rejectFollowRequestAsync = createAsyncThunk(
  'profile/rejectFollowRequest',
  async (username: string, { rejectWithValue }) => {
    try {
      await rejectFollowRequest(username);
      return username;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể từ chối yêu cầu theo dõi';
      return rejectWithValue(message);
    }
  }
);

export const followUserAsync = createAsyncThunk(
  'profile/followUser',
  async (username: string, { rejectWithValue }) => {
    try {
      await followUser(username);
      return username;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể theo dõi người dùng';
      return rejectWithValue(message);
    }
  }
);

export const unfollowUserAsync = createAsyncThunk(
  'profile/unfollowUser',
  async (username: string, { rejectWithValue }) => {
    try {
      await unfollowUser(username);
      return username;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể bỏ theo dõi người dùng';
      return rejectWithValue(message);
    }
  }
);

export const fetchCloseFriendsAsync = createAsyncThunk(
  'profile/fetchCloseFriends',
  async ({ page = 0, limit = 20 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const closeFriends = await getCloseFriends(page, limit);
      return { closeFriends, page, limit };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể tải danh sách bạn thân';
      return rejectWithValue(message);
    }
  }
);

export const toggleCloseFriendAsync = createAsyncThunk(
  'profile/toggleCloseFriend',
  async (username: string, { rejectWithValue }) => {
    try {
      await toggleCloseFriend(username);
      return username;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Không thể thay đổi trạng thái bạn thân';
      return rejectWithValue(message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.currentProfile = action.payload;
    },
    setPosts: (state, action: PayloadAction<ProfilePost[]>) => {
      state.posts = action.payload;
    },
    setReels: (state, action: PayloadAction<ProfilePost[]>) => {
      state.reels = action.payload;
    },
    setSaved: (state, action: PayloadAction<ProfilePost[]>) => {
      state.saved = action.payload;
    },
    setHighlights: (state, action: PayloadAction<StoryHighlight[]>) => {
      state.highlights = action.payload;
    },
    addHighlight: (state, action: PayloadAction<StoryHighlight>) => {
      state.highlights = [action.payload, ...state.highlights];
    },
    setFollowers: (state, action: PayloadAction<FollowerUser[]>) => {
      state.followers = action.payload;
    },
    setFollowing: (state, action: PayloadAction<FollowingUser[]>) => {
      state.following = action.payload;
    },
    setFollowRequests: (state, action: PayloadAction<FollowRequestUser[]>) => {
      state.followRequests = action.payload;
    },
    setCloseFriends: (state, action: PayloadAction<CloseFriendUser[]>) => {
      state.closeFriends = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'posts' | 'reels' | 'saved'>) => {
      state.activeTab = action.payload;
    },
    toggleFollow: (state) => {
      if (state.currentProfile) {
        state.currentProfile.isFollowing = !state.currentProfile.isFollowing;
        state.currentProfile.followersCount += state.currentProfile.isFollowing ? 1 : -1;
      }
    },
    toggleBlock: (state) => {
      if (state.currentProfile) {
        state.currentProfile.isBlocked = !state.currentProfile.isBlocked;
      }
    },
    toggleMute: (state) => {
      if (state.currentProfile) {
        state.currentProfile.isMuted = !state.currentProfile.isMuted;
      }
    },
    setShowFollowersDialog: (state, action: PayloadAction<boolean>) => {
      state.showFollowersDialog = action.payload;
    },
    setShowFollowingDialog: (state, action: PayloadAction<boolean>) => {
      state.showFollowingDialog = action.payload;
    },
    setShowFollowRequestsDialog: (state, action: PayloadAction<boolean>) => {
      state.showFollowRequestsDialog = action.payload;
    },
    setShowBlockDialog: (state, action: PayloadAction<boolean>) => {
      state.showBlockDialog = action.payload;
    },
    setShowReportDialog: (state, action: PayloadAction<boolean>) => {
      state.showReportDialog = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setShowAvatarDialog: (state, action: PayloadAction<boolean>) => {
      state.showAvatarDialog = action.payload;
    },
    setShowCreateHighlightDialog: (state, action: PayloadAction<boolean>) => {
      state.showCreateHighlightDialog = action.payload;
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      if (state.currentProfile) {
        state.currentProfile.avatar = action.payload;
      }
    },
    clearProfile: (state) => {
      state.currentProfile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCurrentUserProfileAsync
      .addCase(fetchCurrentUserProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchUserProfileByUsernameAsync
      .addCase(fetchUserProfileByUsernameAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileByUsernameAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfileByUsernameAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchFollowersByUsernameAsync
      .addCase(fetchFollowersByUsernameAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowersByUsernameAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.followers = action.payload;
        state.error = null;
      })
      .addCase(fetchFollowersByUsernameAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchFollowingByUsernameAsync
      .addCase(fetchFollowingByUsernameAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowingByUsernameAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.following = action.payload;
        state.error = null;
      })
      .addCase(fetchFollowingByUsernameAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFollowRequestsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowRequestsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.followRequests = action.payload;
        state.error = null;
      })
      .addCase(fetchFollowRequestsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(acceptFollowRequestAsync.fulfilled, (state, action) => {
        // Remove the accepted request from the list
        state.followRequests = state.followRequests.filter(
          request => request.userName !== action.payload
        );
        // Update followers count
        if (state.currentProfile) {
          state.currentProfile.followersCount += 1;
        }
      })
      .addCase(rejectFollowRequestAsync.fulfilled, (state, action) => {
        // Remove the rejected request from the list
        state.followRequests = state.followRequests.filter(
          request => request.userName !== action.payload
        );
      })
      .addCase(followUserAsync.fulfilled, (state, action) => {
        // Update current profile follow state
        if (state.currentProfile) {
          state.currentProfile.isFollowing = true;
          // If following current user, increase followers count
          const currentUser = state.currentProfile;
          if (currentUser.username === action.payload) {
            state.currentProfile.followersCount += 1;
          }
        }
      })
      .addCase(unfollowUserAsync.fulfilled, (state, action) => {
        // Update current profile follow state
        if (state.currentProfile) {
          state.currentProfile.isFollowing = false;
          // If unfollowing current user, decrease followers count
          const currentUser = state.currentProfile;
          if (currentUser.username === action.payload) {
            state.currentProfile.followersCount = Math.max(0, state.currentProfile.followersCount - 1);
          }
        }
      })
      .addCase(fetchCloseFriendsAsync.fulfilled, (state, action) => {
        const { closeFriends, page } = action.payload;
        if (page === 0) {
          // Replace the list for first page
          state.closeFriends = closeFriends;
        } else {
          // Append for subsequent pages
          state.closeFriends = [...state.closeFriends, ...closeFriends];
        }
      })
      .addCase(toggleCloseFriendAsync.fulfilled, (state, action) => {
        // Toggle close friend status - this will be handled by refetching the list
        // or we can update the local state if we know the current status
      });
      },
    });

export const {
  setProfile,
  setPosts,
  setReels,
  setSaved,
  setHighlights,
  addHighlight,
  setFollowers,
  setFollowing,
  setFollowRequests,
  setCloseFriends,
  setActiveTab,
  toggleFollow,
  toggleBlock,
  toggleMute,
  setShowFollowersDialog,
  setShowFollowingDialog,
  setShowFollowRequestsDialog,
  setShowBlockDialog,
  setShowReportDialog,
  setLoading,
  setError,
  setShowAvatarDialog,
  setShowCreateHighlightDialog,
  updateAvatar,
  clearProfile,
} = profileSlice.actions;

// Async thunks are already exported inline above

// Re-export types from types folder
export type { UserProfile, ProfilePost, StoryHighlight, FollowerUser, FollowingUser, FollowRequestUser } from './types';

export default profileSlice.reducer;
