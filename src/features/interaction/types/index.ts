// API Request Types
export interface CreateCommentRequest {
  id: number; // Always 0 for create
  userId: number;
  postId: number; // 0 if for reel
  reelId: number; // 0 if for post
  parentId: number; // 0 if root comment, parent comment id if reply
  content: string;
  listMentionUserId: number[]; // Always empty array for now
}

export interface UpdateCommentRequest {
  id: number; // Comment id to update
  userId: number;
  postId: number; // 0 if for reel
  reelId: number; // 0 if for post
  parentId: number; // 0 if root comment, parent comment id if reply
  content: string;
  listMentionUserId: number[]; // Always empty array for now
}

export interface GetCommentsRequest {
  pageNo?: number;
  pageSize?: number;
}

// API Response Types
export interface CommentResponse {
  id: number;
  userId: number;
  userName: string;
  avatarUrl: string;
  content: string;
  parentId: number | null;
  quantityLike: number;
  responseChildList: CommentResponse[];
  createdAt: string;
  hasMoreReplies: boolean;
  like: boolean;
}

export interface ListCommentResponse {
  postId: number;
  commentResponseList: CommentResponse[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CommentApiResponse {
  status: number;
  message: string;
  data: string;
}

export interface CommentsApiResponse {
  status: number;
  message: string;
  data: ListCommentResponse;
}

// Local State Types
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  content: string;
  parentId: string | null;
  likesCount: number;
  replies: Comment[];
  createdAt: string;
  hasMoreReplies: boolean;
  isLiked: boolean;
  isOwnComment: boolean;
}

export interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

// Like Types
export interface LikeResponse {
  status: number;
  message: string;
  data: string;
}

export interface LikeState {
  isLoading: boolean;
  error: string | null;
}

// Like detail (list) types
export interface LikeDetailUser {
  userId: number;
  userName: string;
  fullName: string | null;
  avatar: string | null;
  isFollowing: boolean | null;
  hasRequestedFollow?: boolean;
}

export interface LikeDetailPage {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  content: LikeDetailUser[];
}

export interface LikeDetailApiResponse {
  status: number;
  message: string;
  data: LikeDetailPage;
}

// Transform function to convert API response to local state
export const transformCommentData = (apiData: CommentResponse): Comment => ({
  id: apiData.id.toString(),
  userId: apiData.userId.toString(),
  userName: apiData.userName,
  avatarUrl: apiData.avatarUrl,
  content: apiData.content,
  parentId: apiData.parentId?.toString() || null,
  likesCount: apiData.quantityLike,
  replies: apiData?.responseChildList?.map(transformCommentData) || [],
  createdAt: apiData.createdAt,
  hasMoreReplies: apiData.hasMoreReplies,
  isLiked: apiData.like,
  isOwnComment: false,
});
