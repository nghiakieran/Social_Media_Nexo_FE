import { api } from "@/lib/axios";
import type {
  GetExploreRequest,
  GetExploreResponse,
  SearchUserRequest,
  SearchUserResponse,
} from "../types";

export const searchUsers = async (
  params: SearchUserRequest
): Promise<SearchUserResponse["data"]> => {
  try {
    const { query, pageNo = 0, pageSize = 10 } = params;

    const response = await api.get<SearchUserResponse>("/users/search", {
      params: {
        query,
        pageNo,
        pageSize,
      },
    });
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tìm kiếm người dùng"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

export const getExplorePosts = async (
  params: GetExploreRequest
): Promise<GetExploreResponse> => {
  try {
    const { pageNo = 0, pageSize = 20, hashtag = "" } = params;

    const response = await api.get<{
      status: number;
      message: string;
      data: GetExploreResponse;
    }>("/posts/explore", {
      params: {
        pageNo,
        pageSize,
        hashtag,
      },
    });
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách bài viết explore"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

export const getExploreHashtags = async (): any => {
  try {
    const response = await api.get<any>("/posts/explore/hashtags");
    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách bài viết explore"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};
