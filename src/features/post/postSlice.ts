import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  media: MediaItem[];
  privacy: 'public' | 'friends' | 'private';
  taggedUsers: string[];
  hashtags: string[];
  location?: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isPinned: boolean;
  violationScore?: number;
  violationType?: string;
}

interface Story {
  id: string;
  userId: string;
  media: MediaItem;
  text?: string;
  backgroundColor?: string;
  duration: number;
  createdAt: string;
  expiresAt: string;
  viewsCount: number;
  isViewed: boolean;
}

interface Reel {
  id: string;
  userId: string;
  video: MediaItem;
  description: string;
  music?: {
    id: string;
    name: string;
    artist: string;
  };
  hashtags: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
}

interface PostState {
  posts: Post[];
  stories: Story[];
  reels: Reel[];
  isLoading: boolean;
  error: string | null;
  createPostLoading: boolean;
  uploadProgress: number;
}

const initialState: PostState = {
  posts: [],
  stories: [],
  reels: [],
  isLoading: false,
  error: null,
  createPostLoading: false,
  uploadProgress: 0,
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    // Posts
    fetchPostsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPostsSuccess: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
      state.isLoading = false;
    },
    fetchPostsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Create Post
    createPostStart: (state) => {
      state.createPostLoading = true;
      state.error = null;
      state.uploadProgress = 0;
    },
    updateUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    createPostSuccess: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
      state.createPostLoading = false;
      state.uploadProgress = 100;
    },
    createPostFailure: (state, action: PayloadAction<string>) => {
      state.createPostLoading = false;
      state.error = action.payload;
      state.uploadProgress = 0;
    },
    
    // Like/Unlike
    toggleLike: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likesCount += post.isLiked ? 1 : -1;
      }
    },
    
    // Bookmark
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isBookmarked = !post.isBookmarked;
      }
    },
    
    // Pin Post
    togglePin: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isPinned = !post.isPinned;
      }
    },
    
    // Delete Post
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p.id !== action.payload);
    },
    
    // Stories
    fetchStoriesSuccess: (state, action: PayloadAction<Story[]>) => {
      state.stories = action.payload;
    },
    
    // Reels
    fetchReelsSuccess: (state, action: PayloadAction<Reel[]>) => {
      state.reels = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  createPostStart,
  updateUploadProgress,
  createPostSuccess,
  createPostFailure,
  toggleLike,
  toggleBookmark,
  togglePin,
  deletePost,
  fetchStoriesSuccess,
  fetchReelsSuccess,
  clearError,
} = postSlice.actions;

export default postSlice.reducer;