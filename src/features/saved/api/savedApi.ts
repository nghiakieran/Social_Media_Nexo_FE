import { api } from "@/lib/axios";

// Types based on backend DTOs
export interface SavedPostResponseDTO {
  savedPostId: number;
  postId: number;
  ownerId: number;
  ownerUsername: string;
  ownerAvatarUrl: string;
  caption: string;
  visibility: string;
  mediaUrls: string[];
  quantityLike: number;
  quantityComment: number;
  isLike: boolean;
  postCreatedAt: string;
  savedAt: string;
}

export interface PageModelResponse<T> {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  content: T[];
}

// Save a post (toggle: if exists → delete, if not → save)
export const savePost = async (
  postId: number,
): Promise<SavedPostResponseDTO> => {
  try {
    const response = await api.post<SavedPostResponseDTO>(
      `/interaction/api/saved-posts/${postId}`,
    );
    // Handle both direct response and wrapped response { data: {...} }
    const data = response.data;
    return data.data || data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi lưu bài viết",
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get saved posts with pagination
export const getSavedPosts = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PageModelResponse<SavedPostResponseDTO>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const response = await api.get<PageModelResponse<SavedPostResponseDTO>>(
      `/interaction/api/saved-posts${queryParams.toString() ? "?" + queryParams.toString() : ""}`,
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tải bài viết đã lưu",
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Check if multiple posts are saved (batch check)
export const checkPostsSavedStatus = async (
  postIds: number[],
): Promise<Record<number, boolean>> => {
  try {
    const response = await api.post<Record<number, boolean>>(
      "/interaction/api/saved-posts/check",
      { postIds },
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Error checking posts saved status:", error);
    // Return false for all posts on error
    return postIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
  }
};

// Check if a single post is saved
export const isPostSaved = async (postId: number): Promise<boolean> => {
  try {
    const result = await checkPostsSavedStatus([postId]);
    return result[postId] || false;
  } catch (error) {
    console.error("Error checking if post is saved:", error);
    return false;
  }
};
