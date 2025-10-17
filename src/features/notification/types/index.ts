export interface GetNotificationsRequest {
  page?: number;
  limit?: number;
}

export interface UserDTO {
  id: number;
  userName: string;
  avatarUrl: string;
}

export interface NotificationDTO {
  id: number;
  recipientId: number;
  notificationType: string;
  targetUrl?: string;
  message: string;
  isRead: boolean;
  userList: UserDTO[];
  createdAt: string;
}

export interface GetNotificationsResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  content: NotificationDTO[];
}
export interface ReadNotificationGroupRequest {
  targetUrl: string;
  notificationType: string;
}