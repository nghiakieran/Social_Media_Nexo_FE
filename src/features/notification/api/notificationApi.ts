import { GetNotificationsRequest, GetNotificationsResponse, ReadNotificationGroupRequest } from "../types";
import { api } from "@/lib/axios";
export const getNotifications = async (
  params: GetNotificationsRequest
): Promise<GetNotificationsResponse> => {
  try {
    const { page = 0, limit = 20 } = params;

    const response = await api.get<{
      status: number;
      message: string;
      data: GetNotificationsResponse;
    }>("/notifications", {
      params: { page, limit },
    });

    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi tải thông báo"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};
// Đánh dấu một thông báo là đã đọc theo ID
export const readNotification = async (
  id: number
): Promise<string> => {
  try {
    const response = await api.put<{
      status: number;
      message: string;
      data: string;
    }>(`/notifications/${id}/read`);

    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi đọc thông báo"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Đánh dấu tất cả thông báo là đã đọc
export const readAllNotifications = async (): Promise<string> => {
  try {
    const response = await api.put<{
      status: number;
      message: string;
      data: string;
    }>("/notifications/read-all");

    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi đọc tất cả thông báo"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};

// Đánh dấu nhóm thông báo là đã đọc
export const readNotificationGroup = async (
  request: ReadNotificationGroupRequest
): Promise<string> => {
  try {
    const response = await api.put<{
      status: number;
      message: string;
      data: string;
    }>("/notifications/read-group", request);

    return response.data.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(
        apiError.response?.data?.message || "Có lỗi xảy ra khi đọc nhóm thông báo"
      );
    }
    throw new Error("Không thể kết nối đến server. Vui lòng thử lại.");
  }
};