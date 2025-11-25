import api from "@/lib/axios";
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
  FollowRequestUser,
  CloseFriendsResponse,
  CloseFriendUser,
  BlockedUsersResponse,
  BlockedUser,
} from "../types";

/**
 * Get current user's profile
 */
export const getCurrentUserProfile = async (): Promise<ProfileData> => {
  const response = await api.get<ProfileResponse>("/users/profile");
  return response.data.data;
};

/**
 * Get user profile by username
 * @param username - The username to fetch profile for
 */
export const getUserProfileByUsername = async (
  username: string
): Promise<ProfileData> => {
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
 * @param pageNo - Page number
 * @param pageSize - Page size
 * @param search - Search query (optional)
 */
export const getFollowersByUsername = async (
  username: string,
  pageNo: number = 0,
  pageSize: number = 10,
  search?: string
): Promise<FollowersResponse> => {
  const params: Record<string, string | number> = { pageNo, pageSize };
  if (search) {
    params.search = encodeURIComponent(search);
  }

  const response = await api.get<{
    status: number;
    message: string;
    data: FollowersResponse;
  }>(`/users/followers/${username}`, {
    params,
  });
  return response.data.data;
};

/**
 * Get following list for a user
 * @param username - The username to fetch following for
 * @param pageNo - Page number
 * @param pageSize - Page size
 * @param search - Search query (optional)
 */
export const getFollowingByUsername = async (
  username: string,
  pageNo: number = 0,
  pageSize: number = 10,
  search?: string
): Promise<FollowingResponse> => {
  const params: Record<string, string | number> = { pageNo, pageSize };
  if (search) {
    params.search = encodeURIComponent(search);
  }

  const response = await api.get<{
    status: number;
    message: string;
    data: FollowingResponse;
  }>(`/users/followings/${username}`, {
    params,
  });
  return response.data.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  profileData: UpdateProfileRequest
): Promise<ProfileData> => {
  const formData = new FormData();

  const payload = {
    username: profileData.username,
    fullName: profileData.fullName,
    bio: profileData.bio,
    isPrivate: profileData.isPrivate,
    onlineStatus: profileData.onlineStatus,
  };

  formData.append("request", JSON.stringify(payload));

  if (profileData.avatar !== undefined) {
    if (profileData.avatar instanceof File) {
      formData.append("avatarFile", profileData.avatar);
    } else {
      formData.append("avatarFile", profileData.avatar);
    }
  }

  const response = await api.put<UpdateProfileResponse>(
    "/users/profile",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
};

/**
 * Get follow requests for current user
 */
export const getFollowRequests = async (
  pageNo: number = 0,
  pageSize: number = 10
): Promise<FollowRequestsResponse> => {
  const response = await api.get<{
    status: number;
    message: string;
    data: FollowRequestsResponse;
  }>(`/users/requests`, {
    params: { pageNo, pageSize },
  });
  return response.data.data;
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

/**
 * Get close friends list for current user
 * @param page - Page number
 * @param limit - Page size
 * @param search - Search query (optional)
 */
export const getCloseFriends = async (
  page: number = 0,
  limit: number = 10,
  search?: string
): Promise<CloseFriendUser[]> => {
  const params: Record<string, string | number> = { page, size: limit };
  if (search) {
    params.search = encodeURIComponent(search);
  }

  const response = await api.get<{
    status: number;
    message: string;
    data: CloseFriendsResponse;
  }>("/users/close-friends", {
    params,
  });
  return response.data.data.content;
};

/**
 * Toggle close friend status (add/remove from close friends)
 */
export const toggleCloseFriend = async (username: string): Promise<void> => {
  await api.put(`/users/close-friend/${username}`);
};

/**
 * Get blocked users list for current user
 * @param page - Page number
 * @param limit - Page size
 * @param search - Search query (optional)
 */
export const getBlockedUsers = async (
  page: number = 0,
  limit: number = 10,
  search?: string
): Promise<BlockedUsersResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (search) {
    params.search = encodeURIComponent(search);
  }

  const response = await api.get<{
    status: number;
    message: string;
    data: BlockedUsersResponse;
  }>("/users/blocked-users", {
    params,
  });
  return response.data.data;
};

/**
 * Block user
 * @param username - Username to block
 */
export const blockUser = async (username: string): Promise<void> => {
  await api.post(`/users/${username}/block`);
};

/**
 * Unblock user
 * @param username - Username to unblock
 */
export const unblockUser = async (username: string): Promise<void> => {
  await api.delete(`/users/${username}/block`);
};

/**
 * Delete/Remove avatar
 */
export const deleteAvatar = async (): Promise<void> => {
  await api.delete("/users/profile/avatar");
};

/**
 * Change password
 * @param oldPassword - Current password
 * @param newPassword - New password
 * @param confirmNewPassword - Confirm new password
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponse {
  status: number;
  message: string;
  data?: unknown;
}

export const changePassword = async (
  request: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await api.post<ChangePasswordResponse>(
    "/users/change-password",
    request
  );
  return response.data;
};

export interface ReportUserRequest {
  reason: string;
}

export interface ReportUserResponse {
  reporterId: number;
  reporterUsername: string;
  reportedId: number;
  reportedUsername: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface ReportUserApiResponse {
  status: number;
  message: string;
  data: ReportUserResponse;
}

export const reportUser = async (
  username: string,
  request: ReportUserRequest
): Promise<ReportUserResponse> => {
  try {
    const response = await api.post<ReportUserApiResponse>(
      `/users/reports/${username}`,
      request
    );
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi báo cáo người dùng"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};
