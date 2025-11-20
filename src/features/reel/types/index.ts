import { getMediaType } from "@/utils/mediaUtils";

// API Response Types
export interface CreateReelResponse {
  status: number;
  message: string;
  data: string;
}

export interface UpdateReelResponse {
  status: number;
  message: string;
  data: string;
}

export interface ToggleReelActiveResponse {
  status: number;
  message: string;
  data: string;
}

export interface DeleteReelResponse {
  status: number;
  message: string;
  data: string;
}

export interface ReelResponse {
  status: number;
  message: string;
  data: {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    content: ReelData[];
  };
}

export interface ReelData {
  reelId: number;
  userId: number;
  userName: string;
  avatarUrl: string;
  caption: string;
  visibility: "PUBLIC" | "PRIVATE";
  mediaUrl: string;
  quantityLike: number;
  quantityComment: number;
  isActive: boolean;
  isLike: boolean;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateReelRequest {
  postId?: number;
  userId: number;
  caption: string;
  visibility: "PUBLIC" | "PRIVATE";
  mediaUrl: string[];
}

export interface UpdateReelRequest {
  postId: number;
  userId: number;
  caption: string;
  visibility: "PUBLIC" | "PRIVATE";
  mediaUrl: string[];
}

export interface GetReelsRequest {
  userId: number;
  page?: number;
  limit?: number;
}

export interface GetUserReelsRequest {
  userId: number;
  pageNo?: number;
  pageSize?: number;
}

export interface GetReelDetailRequest {
  reelId: number;
}

export interface LikeReelRequest {
  reelId: number;
}

export interface LikeReelResponse {
  status: number;
  message: string;
  data: {
    isLike: boolean;
    quantityLike: number;
  };
}

// Local State Types
export interface Reel {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  caption: string;
  visibility: "PUBLIC" | "PRIVATE";
  mediaUrl: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReelComment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

// Transform function to convert API data to local state format
export const transformReelData = (apiReel: ReelData): Reel => {
  if (!apiReel) {
    console.warn(
      "API reel data is undefined or null, returning default values"
    );
    return {
      id: "",
      userId: "",
      userName: "Unknown User",
      avatarUrl: "",
      caption: "",
      visibility: "PUBLIC",
      mediaUrl: "",
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };
  }

  return {
    id: apiReel.reelId?.toString() || "",
    userId: apiReel.userId?.toString() || "",
    userName: apiReel.userName || "Unknown User",
    avatarUrl: apiReel.avatarUrl || "",
    caption: apiReel.caption || "",
    visibility: apiReel.visibility || "PUBLIC",
    mediaUrl: apiReel.mediaUrl || "",
    likesCount: apiReel.quantityLike || 0,
    commentsCount: apiReel.quantityComment || 0,
    isLiked: apiReel.isLike || false,
    isActive: apiReel.isActive !== undefined ? apiReel.isActive : true,
    createdAt: apiReel.createdAt || "",
    updatedAt: apiReel.updatedAt || "",
  };
};
