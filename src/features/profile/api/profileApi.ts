import api from '@/lib/axios';
import type {
  ProfileResponse,
  ProfileData,
  FollowersResponse,
  FollowingResponse,
  FollowerUser,
  FollowingUser,
  UpdateProfileRequest,
  UpdateProfileResponse,
  FollowRequestsResponse,
  FollowRequestUser
} from '../types';

/**
 * Get current user's profile
 */
export const getCurrentUserProfile = async (): Promise<ProfileData> => {
  const response = await api.get<ProfileResponse>('/users/profile');
  return response.data.data;
};

/**
 * Get user profile by username
 * @param username - The username to fetch profile for
 */
export const getUserProfileByUsername = async (username: string): Promise<ProfileData> => {
  const response = await api.get<ProfileResponse>(`/users/profile/${username}`);
  return response.data.data;
};

/**
 * Generic function to get profile (current user or by username)
 * @param username - Optional username. If not provided, gets current user's profile
 */
export const getProfile = async (username?: string): Promise<ProfileData> => {
  if (username) {
    return getUserProfileByUsername(username);
  }
  return getCurrentUserProfile();
};

/**
 * Get followers list for a user
 * @param username - The username to fetch followers for
 */
export const getFollowersByUsername = async (username: string, page: number = 0, limit: number = 10): Promise<FollowerUser[]> => {
  const response = await api.get<{status: number, message: string, data: FollowersResponse}>(`/users/followers/${username}?page=${page}&size=${limit}`);
  return response.data.data.content;
};

/**
 * Get following list for a user
 * @param username - The username to fetch following for
 */
export const getFollowingByUsername = async (username: string, page: number = 0, limit: number = 10): Promise<FollowingUser[]> => {
  const response = await api.get<{status: number, message: string, data: FollowingResponse}>(`/users/followings/${username}?page=${page}&size=${limit}`);
  return response.data.data.content;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData: UpdateProfileRequest): Promise<ProfileData> => {
  const formData = new FormData();
  
  const payload = {
    username: profileData.username,
    fullName: profileData.fullName,
    bio: profileData.bio,
    isPrivate: profileData.isPrivate,
  };
  
  formData.append('request', JSON.stringify(payload));
  
  if (profileData.avatar !== undefined) {
    if (profileData.avatar instanceof File) {
      formData.append('avatarFile', profileData.avatar);
    } else {
      formData.append('avatarFile', profileData.avatar);
    }
  }

  const response = await api.put<UpdateProfileResponse>('/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};

/**
 * Get follow requests for current user
 */
export const getFollowRequests = async (page: number = 0, limit: number = 10): Promise<FollowRequestUser[]> => {
  const response = await api.get<{status: number, message: string, data: FollowRequestsResponse}>(`/users/requests?page=${page}&size=${limit}`);
  return response.data.data.content;
};

/**
 * Accept follow request
 */
export const acceptFollowRequest = async (username: string): Promise<void> => {
  await api.post(`/users/accept?username=${username}`);
};

/**
 * Reject follow request
 */
export const rejectFollowRequest = async (username: string): Promise<void> => {
  await api.post(`/users/reject?username=${username}`);
};

/**
 * Follow user
 */
export const followUser = async (username: string): Promise<void> => {
  await api.post(`/users/follow/${username}`);
};

/**
 * Unfollow user
 */
export const unfollowUser = async (username: string): Promise<void> => {
  await api.delete(`/users/unfollow/${username}`);
};
