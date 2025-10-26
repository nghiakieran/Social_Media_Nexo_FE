import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getExplorePosts } from "./api/exploreApi";
import { transformExplorePostData } from "./types";
import type { ExplorePost, GetExploreRequest } from "./types";

export interface Hashtag {
  id: string;
  name: string;
  postsCount: number;
  isFollowing: boolean;
  category:
    | "trending"
    | "entertainment"
    | "sports"
    | "news"
    | "fashion"
    | "food";
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
  activeFilter: "all" | "users" | "hashtags" | "posts";
  recentSearches: string[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

const initialState: ExploreState = {
  posts: [],
  trendingHashtags: [],
  searchQuery: "",
  searchResults: {
    users: [],
    hashtags: [],
    posts: [],
  },
  isSearching: false,
  activeFilter: "all",
  recentSearches: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  totalPages: 0,
};

// Async thunk for getting explore posts
export const getExplorePostsThunk = createAsyncThunk(
  "explore/getExplorePosts",
  async (params: GetExploreRequest, { rejectWithValue }) => {
    try {
      const response = await getExplorePosts(params);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải danh sách bài viết explore"
      );
    }
  }
);

const exploreSlice = createSlice({
  name: "explore",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.currentPage = 0;
      state.totalPages = 0;
      state.hasMore = true;
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
    setActiveFilter: (
      state,
      action: PayloadAction<"all" | "users" | "hashtags" | "posts">
    ) => {
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
      state.recentSearches = state.recentSearches.filter(
        (search) => search !== action.payload
      );
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    followHashtag: (state, action: PayloadAction<string>) => {
      const hashtag = state.trendingHashtags.find(
        (h) => h.id === action.payload
      );
      if (hashtag) {
        hashtag.isFollowing = !hashtag.isFollowing;
      }
      const resultHashtag = state.searchResults.hashtags.find(
        (h) => h.id === action.payload
      );
      if (resultHashtag) {
        resultHashtag.isFollowing = !resultHashtag.isFollowing;
      }
    },
  },
  extraReducers: (builder) => {
    // Get Explore Posts
    builder
      .addCase(getExplorePostsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExplorePostsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const { content, totalPages, pageNo } = action.payload;
        const transformedPosts = content.map(transformExplorePostData);

        // Remove duplicates from the response itself
        const uniquePosts = Array.from(
          new Map(transformedPosts.map((post) => [post.id, post])).values()
        );

        if (pageNo === 0) {
          state.posts = uniquePosts;
        } else {
          // Filter out duplicates when appending
          const existingIds = new Set(state.posts.map((p) => p.id));
          const newPosts = uniquePosts.filter((p) => !existingIds.has(p.id));
          state.posts.push(...newPosts);
        }

        state.currentPage = pageNo;
        state.totalPages = totalPages;
        state.hasMore = pageNo < totalPages - 1;
      })
      .addCase(getExplorePostsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearPosts,
  setTrendingHashtags,
  setSearchQuery,
  setSearchResults,
  setIsSearching,
  setActiveFilter,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  followHashtag,
} = exploreSlice.actions;

export default exploreSlice.reducer;
