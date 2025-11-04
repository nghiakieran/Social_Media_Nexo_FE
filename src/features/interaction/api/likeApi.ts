import { api } from "@/lib/axios";
import type { LikeResponse, LikeDetailApiResponse } from "../types";

// Like/Unlike Comment API
export const likeComment = async (commentId: number): Promise<LikeResponse> => {
  try {
    const response = await api.post<LikeResponse>(
      `/interaction/like/comment/${commentId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };

      // Handle rate limiting
      if (apiError.response?.data?.message?.includes("Too many requests")) {
        throw new Error("Bạn đã like quá nhiều lần. Vui lòng thử lại sau.");
      }

      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi thích bình luận"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Like/Unlike Post API
export const likePost = async (postId: number): Promise<LikeResponse> => {
  try {
    const response = await api.post<LikeResponse>(
      `/interaction/like/post/${postId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };

      // Handle rate limiting
      if (apiError.response?.data?.message?.includes("Too many requests")) {
        throw new Error("Bạn đã like quá nhiều lần. Vui lòng thử lại sau.");
      }

      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi thích bài viết"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Like/Unlike Reel API
export const likeReel = async (reelId: number): Promise<LikeResponse> => {
  try {
    const response = await api.post<LikeResponse>(
      `/interaction/like/reel/${reelId}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };

      // Handle rate limiting
      if (apiError.response?.data?.message?.includes("Too many requests")) {
        throw new Error("Bạn đã like quá nhiều lần. Vui lòng thử lại sau.");
      }

      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi thích reel"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get Like Detail - Post
export const getPostLikeDetail = async (
  postId: number,
  params: { pageNo?: number; pageSize?: number } = {}
): Promise<LikeDetailApiResponse> => {
  try {
    const { pageNo = 0, pageSize = 10 } = params;
    const response = await api.get<LikeDetailApiResponse>(
      `/interaction/like/post/${postId}/detail`,
      { params: { pageNo, pageSize } }
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách lượt thích"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get Like Detail - Reel
export const getReelLikeDetail = async (
  reelId: number,
  params: { pageNo?: number; pageSize?: number } = {}
): Promise<LikeDetailApiResponse> => {
  try {
    const { pageNo = 0, pageSize = 10 } = params;
    const response = await api.get<LikeDetailApiResponse>(
      `/interaction/like/reel/${reelId}/detail`,
      { params: { pageNo, pageSize } }
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách lượt thích"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};
