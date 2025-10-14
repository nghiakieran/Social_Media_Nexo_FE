// Story Content Types (for viewer)
export interface StoryContent {
  id: string
  type: "image" | "video"
  url: string
  duration: number
  isSeen?: boolean // Track if this specific story content has been viewed
  createdAt?: string // Store creation date for each content
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

// Helper function to detect media type from URL
const detectMediaType = (url: string): "image" | "video" => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m3u8'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image';
};

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
        type = detectMediaType(item.mediaUrl);
      }
      
      return {
        id: item.storyId.toString(),
        type,
        url: item.mediaUrl as string,
        duration: 5,
        isSeen: item.isSeen, // Map isSeen from API
        createdAt: item.createdAt, // Map createdAt for archive display
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
    isCloseFriend: storyList.length > 0 ? storyList.some((s) => s.isCloseFriend) : false,
  };
};
