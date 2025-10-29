import { api } from "@/lib/axios";
import type {
  CreateCommentRequest,
  UpdateCommentRequest,
  GetCommentsRequest,
  CommentApiResponse,
  CommentsApiResponse,
} from "../types";

// Create Comment API
export const createComment = async (
  commentData: CreateCommentRequest
): Promise<CommentApiResponse> => {
  try {
    const response = await api.post<CommentApiResponse>("/interaction/comment", commentData);
    return response.data;
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

// Update Comment API
export const updateComment = async (
  commentData: UpdateCommentRequest
): Promise<CommentApiResponse> => {
  try {
    const response = await api.put<CommentApiResponse>("/interaction/comment", commentData);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi cập nhật bình luận"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Delete Comment API
export const deleteComment = async (
  commentId: number
): Promise<CommentApiResponse> => {
  try {
    const response = await api.delete<CommentApiResponse>(`/interaction/comment/${commentId}`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi xóa bình luận"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get Comments of Post API
export const getPostComments = async (
  postId: number,
  params: GetCommentsRequest = {}
): Promise<CommentsApiResponse> => {
  try {
    const { pageNo = 0, pageSize = 10 } = params;
    
    const response = await api.get<CommentsApiResponse>(`/interaction/comment/post/${postId}`, {
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
        apiError.response?.data?.message || "Có lỗi xảy ra khi tải bình luận"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Get Comments of Reel API
export const getReelComments = async (
  reelId: number,
  params: GetCommentsRequest = {}
): Promise<CommentsApiResponse> => {
  try {
    const { pageNo = 0, pageSize = 10 } = params;
    
    const response = await api.get<CommentsApiResponse>(`/interaction/comment/reel/${reelId}`, {
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
        apiError.response?.data?.message || "Có lỗi xảy ra khi tải bình luận"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};
