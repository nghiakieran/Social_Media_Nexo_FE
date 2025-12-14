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

export const fetchReportComments = async (params?: GetReportsParams) => {
  try {
    const res = await api.get<ApiResponse<any>>("/posts/report/comments", {
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
  type: "post" | "reel" | "user" | "comment",
  params?: GetReportsParams
) => {
  switch (type) {
    case "post":
      return fetchReportPosts(params);
    case "reel":
      return fetchReportReels(params);
    case "comment":
      return fetchReportComments(params);
    case "user":
      return getAllUserReports({
        status: params?.status as any,
        page: params?.pageNo,
        size: params?.pageSize,
        sort: "createdAt",
      });
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

export const getCommentReportById = async (id: number) => {
  try {
    const res = await api.get<ApiResponse<any>>("/posts/report/comments/" + id);
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

export const handelCommentReportById = async (
  id: number,
  status: string,
  note: string
) => {
  try {
    const res = await api.put<ApiResponse<any>>(
      `/posts/report/comment/${id}/${status}?note=${note}`
    );
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo người dùng:", error);
    throw error;
  }
};

export const getAllUserReports = async (params?: {
  status?: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED";
  page?: number;
  size?: number;
  sort?: string;
}) => {
  try {
    const res = await api.get<ApiResponse<any>>("/users/reports/all", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "createdAt",
        ...(params?.status && { status: params.status }),
      },
    });
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách báo cáo người dùng:", error);
    throw error;
  }
};

export const updateUserReportStatus = async (
  reporterId: number,
  reportedId: number,
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED"
) => {
  try {
    const res = await api.put<ApiResponse<any>>(
      `/users/reports/${reporterId}/${reportedId}/status`,
      { status }
    );
    return res.data.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái báo cáo:", error);
    throw error;
  }
};
