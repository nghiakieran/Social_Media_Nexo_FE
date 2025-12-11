import { api } from "@/lib/axios";
import {
  AdminPostItemDTO,
  ApiResponse,
  PageResponseDTO,
  PostSearchParams,
  PostsInfo,
} from "../types";

export const fetchAdminPosts = async (params: PostSearchParams) => {
  try {
    const res = await api.get<ApiResponse<PageResponseDTO<AdminPostItemDTO>>>(
      "/posts/admin/posts/all",
      {
        params: {
          search: params.search || "",
          pageNo: params.pageNo || 0,
          pageSize: params.pageSize || 10,
          type: params.type || "all",
        },
      }
    );

    return res.data.data;
  } catch (error) {
    console.error("Không thể tải danh sách bài viết:", error);
    throw error;
  }
};

export const fetchAdminPostsInfo = async () => {
  try {
    const res = await api.get<ApiResponse<PostsInfo>>("/posts/admin/posts/");

    return res.data.data;
  } catch (error) {
    console.error("Không thể tải danh sách bài viết:", error);
    throw error;
  }
};

export const fetchPostById = async (id: number, type: string) => {
  try {
    const res = await api.get<ApiResponse<any>>(
      `/posts/admin/posts/${type}/${id}`
    );

    return res.data.data;
  } catch (error) {
    console.error("Không thể tải danh sách bài viết:", error);
    throw error;
  }
};

export const deletePostById = async (id: number, type: string) => {
  try {
    const res = await api.delete<ApiResponse<any>>(
      `/posts/admin/posts/${type}/${id}`
    );
    return res.data.data;
  } catch (error) {
    console.error("Không thể tải danh sách bài viết:", error);
    throw error;
  }
};
