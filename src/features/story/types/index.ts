import { getMediaType } from '@/utils/mediaUtils';

// Story Content Types (for viewer)
export interface StoryContent {
  id: string
  type: "image" | "video"
  url: string
  duration: number
  isSeen?: boolean // Track if this specific story content has been viewed
  createdAt?: string // Store creation date for each content
  quantitySeen?: number // Number of people who viewed this story
}

// Story Types (for viewer)
export interface Story {
  id: string
  username: string
  profileImage: string
  isVerified?: boolean
  timeAgo: string
  content: StoryContent[]
  isViewed?: boolean
  isOwnStory?: boolean
  viewerCount?: number
  isCloseFriend?: boolean
}

export interface StoryViewerProps {
  isOpen: boolean
  onClose: () => void
  stories: Story[]
  initialStoryIndex: number
  initialContentIndex?: number
  isArchivePage?: boolean
}

// API Response Types
export interface CreateStoryResponse {
  status: number;
  message: string;
  data: string;
}

export interface DeleteStoryResponse {
  status: number;
  message: string;
  data: string;
}

export interface ArchiveStoryResponse {
  status: number;
  message: string;
  data: string;
}

export interface ViewStoryResponse {
  status: number;
  message: string;
  data: string;
}

// API Request Types
export interface CreateStoryRequest {
  storyId: number;
  userId: number;
  isClosedFriend: boolean;
  isArchive: boolean;
}

export interface GetStoriesRequest {
  userId: number;
  pageNo?: number;
  pageSize?: number;
}

// API Data Types - Story Item
export interface StoryItemData {
  storyId: number;
  quantitySeen: number;
  mediaUrl: string | null;
  mediaType?: "PICTURE" | "VIDEO";
  isLike: boolean;
  createdAt: string;
  isActive: boolean;
  isCloseFriend: boolean;
  isSeen: boolean;
}

// API Data Types - User with Stories
export interface UserStoriesData {
  userId: number;
  userName: string;
  avatarUrl: string;
  storyList: StoryItemData[];
}

// API Response Types - Get Stories
export interface GetStoriesResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  content: UserStoriesData[];
}

export interface GetStoriesApiResponse {
  status: number;
  message: string;
  data: GetStoriesResponse;
}

// Collection (Highlight) Types
export interface CreateCollectionRequest {
  id: number; // Khi tạo 1 collection mới id = 0
  userId: number;
  collectionName: string;
  storyList: number[];
}

export interface UpdateCollectionRequest {
  id: number;
  userId: number;
  collectionName: string;
  storyList: number[]; // Chỉ truyền stories muốn giữ, không truyền = xóa
}

export interface CreateCollectionResponse {
  status: number;
  message: string;
  data: string;
}

export interface UpdateCollectionResponse {
  status: number;
  message: string;
  data: string;
}

export interface CollectionItem {
  id: number;
  collectionName: string;
  mediaUrl: string;
  createdAt: string;
}

export interface GetCollectionsResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: CollectionItem[];
}

export interface GetCollectionsApiResponse {
  status: number;
  message: string;
  data: GetCollectionsResponse;
}

// Collection Detail Types
export interface CollectionDetailStory {
  storyId: number;
  quantitySeen: number;
  mediaUrl: string;
  isLike: boolean;
  createdAt: string;
  isActive: boolean;
  isCloseFriend: boolean;
  isSeen: boolean;
}

export interface CollectionDetail {
  id: number;
  collectionName: string;
  stories: CollectionDetailStory[];
  createdAt: string | null;
}

export interface GetCollectionDetailApiResponse {
  status: number;
  message: string;
  data: CollectionDetail;
}

// Story Viewers Types
export interface StoryViewer {
  userName: string;
  avatarUrl: string;
  createdAt: string;
  isLike: boolean;
  isCloseFriend: boolean;
}

export interface GetStoryViewersResponse {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  content: StoryViewer[];
}

export interface GetStoryViewersApiResponse {
  status: number;
  message: string;
  data: GetStoryViewersResponse;
}

// Transform function - Convert API UserStoriesData to Story for viewer
export const transformUserStoriesToStory = (
  apiData: UserStoriesData,
  currentUserId?: number
): Story => {
  // Ensure storyList is an array, default to empty array if undefined
  const storyList = apiData.storyList || [];
  
  // Filter out stories with null mediaUrl and convert to StoryContent
  const content: StoryContent[] = storyList
    .filter((item) => item.mediaUrl !== null && item.mediaUrl !== undefined)
    .map((item) => {
      // Detect media type from URL if not provided or use provided type
      let type: "image" | "video" = "image";
      if (item.mediaType) {
        type = item.mediaType === "VIDEO" ? "video" : "image";
      } else if (item.mediaUrl) {
        type = getMediaType(item.mediaUrl);
      }
      
      return {
        id: item.storyId.toString(),
        type,
        url: item.mediaUrl as string,
        duration: 5,
        isSeen: item.isSeen, // Map isSeen from API
        createdAt: item.createdAt, // Map createdAt for archive display
        quantitySeen: item.quantitySeen, // Map quantitySeen for viewer count
      };
    });

  return {
    id: apiData.userId.toString(),
    username: apiData.userName || "Unknown",
    profileImage: apiData.avatarUrl || "/placeholder.svg",
    timeAgo: storyList[0]?.createdAt || new Date().toISOString(),
    content,
    isViewed: storyList.length > 0 ? storyList.every((s) => s.isSeen) : false,
    isOwnStory: currentUserId ? apiData.userId === currentUserId : false,
    // Only mark as close friend if ALL stories in the list are for close friends
    isCloseFriend: storyList.length > 0 ? storyList.every((s) => s.isCloseFriend) : false,
  };
};
