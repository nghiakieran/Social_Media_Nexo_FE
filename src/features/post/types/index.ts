// API Response Types
export interface CreatePostResponse {
  status: number;
  message: string;
  data: string;
}

export interface UpdatePostResponse {
  status: number;
  message: string;
  data: string;
}

export interface TogglePostActiveResponse {
  status: number;
  message: string;
  data: string;
}

export interface DeletePostResponse {
  status: number;
  message: string;
  data: string;
}

export interface PostResponse {
  status: number;
  message: string;
  data: {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    content: PostData[];
  };
}

export interface PostData {
  postId: number;
  userId: number;
  userName: string;
  avatarUrl: string;
  caption: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  tag: string;
  mediaUrl: string[];
  quantityLike: number;
  quantityComment: number;
  listUserTag: TaggedUser[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaggedUser {
  userId: number;
  userName: string;
}

// Local State Types
export interface Post {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  caption: string;
  media: PostMediaItem[];
  visibility: 'public' | 'private';
  taggedUsers: TaggedUser[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount?: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isOwnPost: boolean;
  isActive: boolean;
}

export interface PostMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

// API Request Types
export interface CreatePostRequest {
  postId: number;
  userId: number;
  caption: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  tag: string;
}

export interface UpdatePostRequest {
  postId: number;
  userId: number;
  caption: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  tag: string;
  mediaUrl: string[];
}

export interface GetPostsRequest {
  userId: number;
  pageNo?: number;
  pageSize?: number;
}

export interface GetPostsResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: PostData[];
}

// Feed API (posts from followed users)
export interface GetFeedRequest {
  userId: number;
  page?: number;
  limit?: number;
}

export interface GetFeedResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: PostData[];
}

// Post Detail API
export interface GetPostDetailResponse {
  status: number;
  message: string;
  data: PostData;
}

// Mutual followers types
export interface MutualUser {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  isFollowing: boolean;
  closeFriend: boolean;
}

export interface GetMutualFollowersRequest {
  pageNo?: number;
  pageSize?: number;
  search?: string;
}

export interface GetMutualFollowersResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: MutualUser[];
}

export interface GetMutualFollowersApiResponse {
  status: number;
  message: string;
  data: GetMutualFollowersResponse;
}

// Comment Types
export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  replies?: Comment[];
  parentId?: string;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string;
}

export interface CreateCommentResponse {
  status: number;
  message: string;
  data: Comment;
}

// Like Types
export interface LikePostRequest {
  postId: string;
}

export interface LikePostResponse {
  status: number;
  message: string;
  data: {
    isLiked: boolean;
    likesCount: number;
  };
}

// Bookmark Types
export interface BookmarkPostRequest {
  postId: string;
}

export interface BookmarkPostResponse {
  status: number;
  message: string;
  data: {
    isBookmarked: boolean;
  };
}

// Helper function to detect media type from URL
const getMediaType = (url: string): 'image' | 'video' => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m3u8', '.mpd', '.ts'];
  const lowerUrl = url.toLowerCase();
  
  // Check for HLS (.m3u8) or DASH (.mpd) streaming formats
  if (lowerUrl.includes('.m3u8') || lowerUrl.includes('.mpd') || lowerUrl.includes('m3u8')) {
    return 'video';
  }
  
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image';
};

// Transform function to convert API response to local state
export const transformPostData = (apiData: PostData): Post => ({
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
  visibility: apiData.visibility.toLowerCase() as 'public' | 'private',
  taggedUsers: apiData.listUserTag,
  createdAt: apiData.createdAt,
  updatedAt: apiData.updatedAt,
  likesCount: apiData.quantityLike,
  commentsCount: apiData.quantityComment,
  sharesCount: 0,
  isLiked: false,
  isBookmarked: false,
  isOwnPost: false,
  isActive: apiData.isActive,
});
