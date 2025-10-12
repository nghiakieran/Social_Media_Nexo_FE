import { api } from "@/lib/axios";
import type { 
  CreateStoryRequest, 
  CreateStoryResponse,
  DeleteStoryResponse,
  ArchiveStoryResponse,
  ViewStoryResponse,
  GetStoriesRequest,
  GetStoriesApiResponse
} from "../types";

// Create story API
export const createStory = async (
  file: File,
  storyData: CreateStoryRequest,
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
): Promise<CreateStoryResponse> => {
  try {
    const formData = new FormData();

    // Append the file with key 'files'
    formData.append("files", file);

    // Append story data as JSON string
    formData.append("storyRequestDTO", JSON.stringify(storyData));

    // Calculate timeout based on file size and type
    const fileSize = file.size;
    const isVideo = file.type.startsWith("video/");

    // Dynamic timeout based on file size and type
    // Video: 5 minutes, Large files (>10MB): 2 minutes, Default: 30 seconds
    let timeout = 30000; // 30 seconds default
    if (isVideo || fileSize > 50 * 1024 * 1024) {
      timeout = 300000; // 5 minutes for video or large files
    } else if (fileSize > 10 * 1024 * 1024) {
      timeout = 120000; // 2 minutes for medium files
    }

    const response = await api.post<CreateStoryResponse>("/posts/story", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout, // Dynamic timeout
      onUploadProgress, // Track upload progress
    });

    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi tạo story"
      );
    }

    if (error && typeof error === "object" && "code" in error) {
      const axiosError = error as { code?: string };
      if (axiosError.code === "ECONNABORTED") {
        throw new Error(
          "Upload quá lâu. Vui lòng thử file nhỏ hơn hoặc kiểm tra kết nối mạng."
        );
      }
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Delete story API
export const deleteStory = async (
  storyId: number
): Promise<DeleteStoryResponse> => {
  try {
    const response = await api.delete<DeleteStoryResponse>(`/posts/story/${storyId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi xóa story"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Archive story API
export const archiveStory = async (
  storyId: number
): Promise<ArchiveStoryResponse> => {
  try {
    const response = await api.put<ArchiveStoryResponse>(`/posts/story/${storyId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi lưu trữ story"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// View story API
export const viewStory = async (
  storyId: number
): Promise<ViewStoryResponse> => {
  try {
    const response = await api.post<ViewStoryResponse>(`/posts/story/view/${storyId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi xem story"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get all stories of friends (for feed)
export const getFriendStories = async (
  params: GetStoriesRequest
): Promise<GetStoriesApiResponse> => {
  try {
    const { userId, pageNo = 0, pageSize = 10 } = params;

    const response = await api.get<GetStoriesApiResponse>(`/posts/story/view/${userId}`, {
      params: {
        pageNo,
        pageSize,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi tải stories"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get stories of specific user (current user's own stories)
export const getUserStories = async (
  params: GetStoriesRequest
): Promise<GetStoriesApiResponse> => {
  try {
    const { userId, pageNo = 0, pageSize = 10 } = params;

    const response = await api.get<GetStoriesApiResponse>(`/posts/story/${userId}`, {
      params: {
        pageNo,
        pageSize,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi tải stories"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get all stories of user (including archived)
export const getAllUserStories = async (
  params: GetStoriesRequest
): Promise<GetStoriesApiResponse> => {
  try {
    const { userId, pageNo = 0, pageSize = 10 } = params;

    const response = await api.get<GetStoriesApiResponse>(`/posts/story/all/${userId}`, {
      params: {
        pageNo,
        pageSize,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi tải stories"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};
