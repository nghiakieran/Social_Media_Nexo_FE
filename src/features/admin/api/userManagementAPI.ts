import { api } from "@/lib/axios";
import { ApiResponse } from "../types";

export interface UserStatisticsResponse {
  userId: number;
  username: string;
  postsCount: number;
  interactionsCount: number;
  newFollowersCount: number;
  totalFollowersCount: number;
  totalFollowingCount: number;
}

/**
 * API lấy thống kê của user theo userId
 */
export const getUserStatistics = async (
  userId: string
): Promise<UserStatisticsResponse> => {
  try {
    const res = await api.get<ApiResponse<UserStatisticsResponse>>(
      `/users/statistics/${userId}`
    );
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải thống kê người dùng:", error);
    throw error;
  }
};

/**
 * API khóa/mở khóa tài khoản người dùng
 */
export const banUser = async (username: string): Promise<void> => {
  try {
    await api.post(`/users/ban/${username}`);
  } catch (error) {
    console.error("Lỗi khi khóa tài khoản:", error);
    throw error;
  }
};

//API mở khoá
export const unbanUser = async (username: string): Promise<void> => {
  try {
    await api.post(`/users/unban/${username}`);
  } catch (error) {
    console.error("Lỗi khi mở khóa tài khoản:", error);
    throw error;
  }
};
