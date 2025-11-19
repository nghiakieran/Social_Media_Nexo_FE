import { api } from "@/lib/axios";
import {
  AdminPostItemDTO,
  ApiResponse,
  PageResponseDTO,
  PostSearchParams,
  PostsInfo,
  ReportSummary,
  GetReportsParams,
} from "../types";
export const fetchReportPosts = async (params?: GetReportsParams) => {
  try {
    const res = await api.get<ApiResponse<any>>("/posts/report/posts", {
      params,
    });
    // Giả sử response trả về dạng Page<ReportSummary> trong data.data
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo bài viết:", error);
    throw error;
  }
};

/**
 * API lấy danh sách báo cáo video ngắn (Reel)
 */
export const fetchReportReels = async (params?: GetReportsParams) => {
  try {
    const res = await api.get<ApiResponse<any>>("/posts/report/reels", {
      params,
    });
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo reels:", error);
    throw error;
  }
};

/**
 * API lấy danh sách báo cáo người dùng (User)
 */
export const fetchReportUsers = async (params?: GetReportsParams) => {
  try {
    const res = await api.get<ApiResponse<any>>("/posts/report/users", {
      params,
    });
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo người dùng:", error);
    throw error;
  }
};

/**
 * Helper function để gọi API dựa trên loại report (type)
 * type: 'post' | 'reel' | 'user'
 */
export const fetchReportsByType = async (
  type: "post" | "reel" | "user",
  params?: GetReportsParams
) => {
  switch (type) {
    case "post":
      return fetchReportPosts(params);
    case "reel":
      return fetchReportReels(params);
    case "user":
      return fetchReportUsers(params);
    default:
      throw new Error("Loại báo cáo không hợp lệ");
  }
};

export const getPostReportById = async (id: number) => {
  try {
    const res = await api.get<ApiResponse<any>>("/posts/report/posts/" + id);
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo người dùng:", error);
    throw error;
  }
};
export const getReelReportById = async (id: number) => {
  try {
    const res = await api.get<ApiResponse<any>>("/posts/report/reels/" + id);
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo người dùng:", error);
    throw error;
  }
};
export const handelPostReportById = async (
  id: number,
  status: string,
  note: string
) => {
  try {
    const res = await api.put<ApiResponse<any>>(
      `/posts/report/post/${id}/${status}?note=${note}`
    );
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo người dùng:", error);
    throw error;
  }
};

export const handelReelReportById = async (
  id: number,
  status: string,
  note: string
) => {
  try {
    const res = await api.put<ApiResponse<any>>(
      `/posts/report/reel/${id}/${status}?note=${note}`
    );
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo người dùng:", error);
    throw error;
  }
};
