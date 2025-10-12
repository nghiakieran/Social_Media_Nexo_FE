// Story Content Types (for viewer)
export interface StoryContent {
  id: string
  type: "image" | "video"
  url: string
  duration: number
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
  mediaUrl: string;
  mediaType: "PICTURE" | "VIDEO";
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

// Transform function - Convert API UserStoriesData to Story for viewer
export const transformUserStoriesToStory = (
  apiData: UserStoriesData,
  currentUserId?: number
): Story => {
  // Convert all story items to StoryContent
  const content: StoryContent[] = apiData.storyList.map((item) => ({
    id: item.storyId.toString(),
    type: item.mediaType === "VIDEO" ? "video" : "image",
    url: item.mediaUrl,
    duration: 5,
  }));

  return {
    id: apiData.userId.toString(),
    username: apiData.userName,
    profileImage: apiData.avatarUrl,
    timeAgo: apiData.storyList[0]?.createdAt || "",
    content,
    isViewed: apiData.storyList.every((s) => s.isSeen),
    isOwnStory: currentUserId ? apiData.userId === currentUserId : false,
    isCloseFriend: apiData.storyList.some((s) => s.isCloseFriend),
  };
};
