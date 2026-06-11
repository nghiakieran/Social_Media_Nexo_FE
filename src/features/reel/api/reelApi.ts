import { api } from "@/lib/axios";
import type {
  CreateReelRequest,
  CreateReelResponse,
  UpdateReelRequest,
  UpdateReelResponse,
  GetReelsRequest,
  ReelResponse,
  GetReelDetailRequest,
  ToggleReelActiveResponse,
  DeleteReelResponse,
  LikeReelRequest,
  LikeReelResponse,
  ReelData,
  GetUserReelsRequest,
} from "../types";

// Create reel API
export const createReel = async (
  files: File[],
  reelData: CreateReelRequest,
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
): Promise<CreateReelResponse> => {
  try {
    const formData = new FormData();

    // Append each file with the same key name 'files'
    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("reelRequestDTO", JSON.stringify(reelData));

    // Calculate total file size to estimate timeout
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const hasVideo = files.some((file) => file.type.startsWith("video/"));

    // Dynamic timeout based on file size and type
    let timeout = 30000; // 30 seconds default
    if (hasVideo || totalSize > 50 * 1024 * 1024) {
      timeout = 300000; // 5 minutes for video or large files
    } else if (totalSize > 10 * 1024 * 1024) {
      timeout = 120000; // 2 minutes for large files
    }

    const response = await api.post("/posts/reel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout,
      onUploadProgress,
    });

    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi tạo reel"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Update reel API
export const updateReel = async (
  files: File[],
  reelData: UpdateReelRequest,
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
): Promise<UpdateReelResponse> => {
  try {
    const formData = new FormData();

    // Append each file with the same key name 'files'
    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("reelRequestDTO", JSON.stringify(reelData));

    // Calculate total file size to estimate timeout
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const hasVideo = files.some((file) => file.type.startsWith("video/"));

    // Dynamic timeout based on file size and type
    let timeout = 30000; // 30 seconds default
    if (hasVideo || totalSize > 50 * 1024 * 1024) {
      timeout = 300000; // 5 minutes for video or large files
    } else if (totalSize > 10 * 1024 * 1024) {
      timeout = 120000; // 2 minutes for large files
    }

    const response = await api.put("/posts/reel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout,
      onUploadProgress,
    });

    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi cập nhật reel"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get reels feed API
export const getReelsFeed = async (
  params: GetReelsRequest
): Promise<ReelResponse> => {
  try {
    const { userId, page = 0, limit = 10 } = params;
    const response = await api.get(
      `/feeds/reels/${userId}?pageNo=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách reels"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get reel detail API
export const getReelDetail = async (
  params: GetReelDetailRequest
): Promise<ReelData> => {
  try {
    const response = await api.get(`/posts/reel/${params.reelId}`);
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tải chi tiết reel"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Toggle reel active/inactive API
export const toggleReelActive = async (
  reelId: number
): Promise<ToggleReelActiveResponse> => {
  try {
    const response = await api.patch(`/posts/reel/${reelId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi thay đổi trạng thái reel"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Delete reel API
export const deleteReel = async (
  reelId: number
): Promise<DeleteReelResponse> => {
  try {
    const response = await api.delete(`/posts/reel/${reelId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi xóa reel"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get user reels API (for profile page)
export const getUserReels = async (
  params: GetUserReelsRequest
): Promise<ReelResponse> => {
  try {
    const { userId, pageNo = 0, pageSize = 10 } = params;
    const response = await api.get(
      `/posts/reel/users/${userId}?pageNo=${pageNo}&pageSize=${pageSize}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tải reels của user"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Like/Unlike reel API
export const likeReel = async (
  params: LikeReelRequest
): Promise<LikeReelResponse> => {
  try {
    const response = await api.post(`/posts/reel/${params.reelId}/like`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi like reel"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

export const reportReel = async (
  postId: string,
  reason: string,
  detail?: string
): Promise<any> => {
  try {
    const response = await api.post<any>(`/posts/report/reel/${postId}`, {
      reason,
      detail,
    });
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi tạo bình luận"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};
