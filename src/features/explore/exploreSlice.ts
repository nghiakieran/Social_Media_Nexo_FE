import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ExplorePost {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  type: 'image' | 'video' | 'carousel';
  likesCount: number;
  commentsCount: number;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  caption?: string;
  hashtags: string[];
  aspectRatio?: number;
}

export interface Hashtag {
  id: string;
  name: string;
  postsCount: number;
  isFollowing: boolean;
  category: 'trending' | 'entertainment' | 'sports' | 'news' | 'fashion' | 'food';
}

export interface SearchResult {
  users: Array<{
    id: string;
    username: string;
    name: string;
    avatar: string;
    isFollowing: boolean;
    isVerified: boolean;
    followersCount: number;
  }>;
  hashtags: Hashtag[];
  posts: ExplorePost[];
}

export interface ExploreState {
  posts: ExplorePost[];
  trendingHashtags: Hashtag[];
  searchQuery: string;
  searchResults: SearchResult;
  isSearching: boolean;
  activeFilter: 'all' | 'users' | 'hashtags' | 'posts';
  recentSearches: string[];
  suggestedPosts: ExplorePost[];
}

const initialState: ExploreState = {
  posts: [],
  trendingHashtags: [],
  searchQuery: '',
  searchResults: {
    users: [],
    hashtags: [],
    posts: [],
  },
  isSearching: false,
  activeFilter: 'all',
  recentSearches: [],
  suggestedPosts: [],
};

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<ExplorePost[]>) => {
      state.posts = action.payload;
    },
    setTrendingHashtags: (state, action: PayloadAction<Hashtag[]>) => {
      state.trendingHashtags = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<SearchResult>) => {
      state.searchResults = action.payload;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    setActiveFilter: (state, action: PayloadAction<'all' | 'users' | 'hashtags' | 'posts'>) => {
      state.activeFilter = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        state.recentSearches = state.recentSearches.slice(0, 10); // Keep only last 10
      }
    },
    removeRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter(search => search !== action.payload);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    followHashtag: (state, action: PayloadAction<string>) => {
      const hashtag = state.trendingHashtags.find(h => h.id === action.payload);
      if (hashtag) {
        hashtag.isFollowing = !hashtag.isFollowing;
      }
      const resultHashtag = state.searchResults.hashtags.find(h => h.id === action.payload);
      if (resultHashtag) {
        resultHashtag.isFollowing = !resultHashtag.isFollowing;
      }
    },
    likePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const post = state.posts.find(p => p.id === postId) || 
                   state.suggestedPosts.find(p => p.id === postId) ||
                   state.searchResults.posts.find(p => p.id === postId);
      if (post) {
        post.likesCount += 1;
      }
    },
    setSuggestedPosts: (state, action: PayloadAction<ExplorePost[]>) => {
      state.suggestedPosts = action.payload;
    },
  },
});

export const {
  setPosts,
  setTrendingHashtags,
  setSearchQuery,
  setSearchResults,
  setIsSearching,
  setActiveFilter,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  followHashtag,
  likePost,
  setSuggestedPosts,
} = exploreSlice.actions;

export default exploreSlice.reducer;