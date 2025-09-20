import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  website: string;
  isVerified: boolean;
  isPrivate: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  isMuted: boolean;
}

export interface ProfilePost {
  id: string;
  type: 'photo' | 'video' | 'reel';
  thumbnail: string;
  url: string;
  likesCount: number;
  commentsCount: number;
  caption: string;
  createdAt: string;
}

export interface StoryHighlight {
  id: string;
  title: string;
  cover: string;
  postIds: string[];
}

interface ProfileState {
  currentProfile: UserProfile | null;
  posts: ProfilePost[];
  reels: ProfilePost[];
  saved: ProfilePost[];
  highlights: StoryHighlight[];
  followers: UserProfile[];
  following: UserProfile[];
  activeTab: 'posts' | 'reels' | 'saved';
  isLoading: boolean;
  error: string | null;
  showFollowersDialog: boolean;
  showFollowingDialog: boolean;
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
  activeTab: 'posts',
  isLoading: false,
  error: null,
  showFollowersDialog: false,
  showFollowingDialog: false,
  showBlockDialog: false,
  showReportDialog: false,
  showAvatarDialog: false,
  showCreateHighlightDialog: false,
};

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
    setFollowers: (state, action: PayloadAction<UserProfile[]>) => {
      state.followers = action.payload;
    },
    setFollowing: (state, action: PayloadAction<UserProfile[]>) => {
      state.following = action.payload;
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
  setActiveTab,
  toggleFollow,
  toggleBlock,
  toggleMute,
  setShowFollowersDialog,
  setShowFollowingDialog,
  setShowBlockDialog,
  setShowReportDialog,
  setLoading,
  setError,
  setShowAvatarDialog,
  setShowCreateHighlightDialog,
  updateAvatar,
} = profileSlice.actions;

export default profileSlice.reducer;