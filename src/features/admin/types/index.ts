export interface DashboardRequestDTO {
  startDate: string;
  endDate: string;
}

export interface AdminPostItemDTO {
  id: number;
  type: "post" | "reel"; 
  visibility: string;
  caption: string;
  userId: number;
  isActive: boolean;
  createdAt: string;
  likeQuantity: number;
  commentQuantity: number;
  authorName: string;
  uuid?: string;
  avatar?: string;
  mediaUrl?: string;
}

export interface PageResponseDTO<T> {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  content: T[];
}

export interface PostSearchParams {
  search?: string;
  pageNo?: number;
  pageSize?: number;
  type?: string; // 'all' | 'post' | 'reel'
}
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PostsInfo {
  totalPost?: number;
  quantityPost?: number;
  quantityReel?: number;
}