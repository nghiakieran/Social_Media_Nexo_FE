export interface ProfileResponse {
  status: number;
  message: string;
  data: ProfileData;
}

export interface ProfileData {
  id: number;
  username: string;
  fullName: string;
  avatar: string | null;
  bio: string | null;
  isPrivate: boolean;
  onlineStatus?: boolean;
  followers: number;
  following: number;
  isFollowing?: boolean;
  hasRequestedFollow?: boolean;
}

// Local State Types (for profile slice)
export interface UserProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  isPrivate: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  isMuted: boolean;
  hasRequestedFollow: boolean; // Whether current user has sent follow request to this private account
}

// Use Post from post feature directly
export type { Post as ProfilePost } from "@/features/post/types";

export interface StoryHighlight {
  id: string;
  title: string;
  cover: string;
  postIds: string[];
}

// Followers/Followings API Response Types
export interface FollowersResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: FollowerUser[];
}

export interface FollowingResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: FollowingUser[];
}

export interface FollowerUser {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  isFollowing: boolean;
  hasRequestedFollow: boolean;
  closeFriend: boolean;
}

export interface FollowingUser {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  isFollowing: boolean;
  hasRequestedFollow: boolean;
  closeFriend: boolean;
}

// Follow Request Types
export interface FollowRequestUser {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  isFollowing: boolean;
  hasRequestedFollow: boolean;
  closeFriend: boolean;
}

export interface FollowRequestsResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: FollowRequestUser[];
}

// Close Friends Types
export interface CloseFriendUser {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
}

export interface CloseFriendsResponse {
  content: CloseFriendUser[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}

// Blocked Users Types
export interface BlockedUser {
  id: number;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  isPrivate: boolean;
  followers: number;
  following: number;
}

export interface BlockedUsersResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: BlockedUser[];
}

// API Request Types
export interface GetProfileRequest {
  username?: string; // Optional - if not provided, gets current user's profile
}

export interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
  bio?: string;
  avatar?: File | string;
  isPrivate?: boolean;
  onlineStatus?: boolean;
}

export interface UpdateProfileResponse {
  status: number;
  message: string;
  data: ProfileData;
}

// Transform function to convert API response to local state
export const transformProfileData = (apiData: ProfileData): UserProfile => ({
  id: apiData.id.toString(),
  username: apiData.username,
  name: apiData.fullName,
  avatar: apiData.avatar || "",
  bio: apiData.bio || "",
  isPrivate: apiData.isPrivate,
  postsCount: 0, // Will be fetched separately
  followersCount: apiData.followers,
  followingCount: apiData.following,
  isFollowing: apiData.isFollowing ?? false, // Get from API or default to false
  isFollowedBy: false, // Will be determined by relationship data
  isBlocked: false,
  isMuted: false,
  hasRequestedFollow: apiData.hasRequestedFollow ?? false, // Get from API or default to false
});
