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
  setBlockedUsers,
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
  fetchCloseFriendsAsync,
  toggleCloseFriendAsync,
  fetchBlockedUsersAsync,
  blockUserAsync,
  unblockUserAsync,
  deleteAvatarAsync,
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
  CloseFriendUser,
  BlockedUser,
  BlockedUsersResponse,
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
  getCloseFriends,
  toggleCloseFriend,
  getBlockedUsers,
  blockUser,
  unblockUser,
  deleteAvatar,
} from './api/profileApi';

// Export components
export { BlockedUsersSettings } from './components/BlockedUsersSettings';
export { CloseFriendsSettings } from './components/CloseFriendsSettings';
