import { getMediaType } from "@/utils/mediaUtils";

// API Response Types for Explore
export interface GetExploreRequest {
  pageNo?: number;
  pageSize?: number;
  hashtag?: string;
}

export interface GetExploreResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: ExplorePostData[];
}

export interface ExplorePostData {
  postId: number;
  userId: number;
  userName: string;
  avatarUrl: string;
  caption: string;
  visibility: "PUBLIC" | "PRIVATE";
  tag: string;
  mediaUrl: string[];
  quantityLike: number;
  quantityComment: number;
  listUserTag: TaggedUser[];
  isActive: boolean;
  isLike: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaggedUser {
  userId: number;
  userName: string;
}

// Search User Types
export interface SearchUserRequest {
  query: string;
  pageNo?: number;
  pageSize?: number;
}

export interface SearchUserResponse {
  status: number;
  message: string;
  data: {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    content: SearchUserData[];
  };
}

export interface SearchUserData {
  id: number;
  username: string;
  fullName: string;
  avatar: string;
}

export interface ExplorePost {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  caption: string;
  media: ExplorePostMediaItem[];
  visibility: "public" | "private";
  taggedUsers: TaggedUser[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isActive: boolean;
}

export interface ExplorePostMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export const transformExplorePostData = (
  apiData: ExplorePostData
): ExplorePost => ({
  id: apiData.postId.toString(),
  userId: apiData.userId.toString(),
  userName: apiData.userName,
  avatarUrl: apiData.avatarUrl,
  caption: apiData.caption,
  media: apiData.mediaUrl.map((url, index) => ({
    id: `${apiData.postId}-${index}`,
    type: getMediaType(url),
    url: url,
  })),
  visibility: apiData.visibility.toLowerCase() as "public" | "private",
  taggedUsers: apiData.listUserTag,
  createdAt: apiData.createdAt,
  updatedAt: apiData.updatedAt,
  likesCount: apiData.quantityLike,
  commentsCount: apiData.quantityComment,
  isLiked: apiData.isLike,
  isActive: apiData.isActive,
});
