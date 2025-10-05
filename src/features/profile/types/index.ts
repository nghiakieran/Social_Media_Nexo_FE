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
  followers: number;
  following: number;
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

// Followers/Followings API Response Types
export interface FollowersResponse {
  content: FollowerUser[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface FollowingResponse {
  content: FollowingUser[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface FollowerUser {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  closeFriend: boolean;
  isFollowing: boolean; // Whether current user is following this follower
  isPrivate: boolean; // Whether this user's account is private
}

export interface FollowingUser {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  closeFriend: boolean;
  isFollowing: boolean; // Always true for following users, but needed for consistency
  isPrivate: boolean; // Whether this user's account is private
}

// Follow Request Types
export interface FollowRequestUser {
  userId: number;
  userName: string;
  avatar: string;
  requestedAt: string;
}

export interface FollowRequestsResponse {
  content: FollowRequestUser[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
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
  avatar: apiData.avatar || '',
  bio: apiData.bio || '',
  isPrivate: apiData.isPrivate,
  postsCount: 0, // Will be fetched separately
  followersCount: apiData.followers,
  followingCount: apiData.following,
  isFollowing: false, // Will be determined by relationship data
  isFollowedBy: false, // Will be determined by relationship data
  isBlocked: false,
  isMuted: false,
  hasRequestedFollow: false,
});
