export interface UserTag {
  userId: number;
  userName: string;
}

export interface ReelApiResponse {
  reelId: number;
  userId: number;
  userName: string;
  avatarUrl: string;
  caption: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  tag: string | null;
  mediaUrl: string;
  quantityLike: number;
  quantityComment: number;
  listUserTag: UserTag[];
  isActive: boolean;
  isLike: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reel {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  caption: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  tags: string[]; 
  mediaUrl: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  taggedUsers: UserTag[];
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

export interface ReelsState {
  reels: Reel[];
  currentReelIndex: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  comments: {
    [reelId: string]: ReelComment[];
  };
  isCommentsDrawerOpen: boolean;
  selectedReelId: string | null;
}
