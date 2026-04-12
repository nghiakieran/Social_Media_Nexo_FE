export interface SavedPost {
  id: string;
  postId: string;
  collectionId: string;
  savedAt: string;
  post: {
    id: string;
    userId: string;
    userName: string;
    avatarUrl: string;
    content: string;
    media: Array<{
      id: string;
      type: "image" | "video" | "reel";
      url: string;
      alt: string;
    }>;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
  };
}

export interface SavedCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean; // "Tất cả bài viết"
}

export interface SavedPost {
  id: string;
  postId: string;
  collectionId: string;
  savedAt: string;
  post: {
    id: string;
    userId: string;
    userName: string;
    avatarUrl: string;
    content: string;
    media: Array<{
      id: string;
      type: "image" | "video" | "reel";
      url: string;
      alt: string;
    }>;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
  };
}

export interface SavedCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean; // "Tất cả bài viết"
}

export interface PaginationInfo {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SavedState {
  collections: SavedCollection[];
  posts: SavedPost[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  savedStatusCache: Record<string, boolean>; // Cache for post saved status
}
