import { api } from "@/lib/axios";
import type { GetExploreRequest, GetExploreResponse } from "../types";

// Get explore posts API
export const getExplorePosts = async (
  params: GetExploreRequest
): Promise<GetExploreResponse> => {
  try {
    const { pageNo = 0, pageSize = 20 } = params;

    const response = await api.get<{
      status: number;
      message: string;
      data: GetExploreResponse;
    }>("/posts/explore", {
      params: {
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
          "Có lỗi xảy ra khi tải danh sách bài viết explore"
      );
    }

    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};
