// Export profile slice and actions
export { default as profileReducer } from './profileSlice';
export {
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
  clearProfile,
  // Async thunks
  fetchCurrentUserProfileAsync,
  fetchUserProfileByUsernameAsync,
  fetchFollowersByUsernameAsync,
  fetchFollowingByUsernameAsync,
  updateUserProfileAsync,
  fetchFollowRequestsAsync,
  acceptFollowRequestAsync,
  rejectFollowRequestAsync,
  followUserAsync,
  unfollowUserAsync,
} from './profileSlice';

// Export types
export type {
  UserProfile,
  ProfilePost,
  StoryHighlight,
  ProfileResponse,
  ProfileData,
  FollowerUser,
  FollowingUser,
  FollowersResponse,
  FollowingResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  FollowRequestUser,
  FollowRequestsResponse,
} from './types';

// Export API functions
export {
  getCurrentUserProfile,
  getUserProfileByUsername,
  getProfile,
  getFollowersByUsername,
  getFollowingByUsername,
  updateUserProfile,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  followUser,
  unfollowUser,
} from './api/profileApi';
