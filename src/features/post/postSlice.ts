import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { createPost, getPosts, getFeed, getPostDetail, updatePost, togglePostActive, deletePost, likePost, bookmarkPost, createComment, getMutualFollowers } from './api/postApi';
import { transformPostData } from './types';
import type { Post, CreatePostRequest, UpdatePostRequest, GetPostsRequest, GetFeedRequest, CreateCommentRequest, GetMutualFollowersRequest, MutualUser } from './types';

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  mutualFollowers: MutualUser[];
  isLoading: boolean;
  isCreating: boolean;
  isLoadingMutuals: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  // Mutual followers pagination
  mutualFollowersPage: number;
  mutualFollowersHasMore: boolean;
}

const initialState: PostState = {
  posts: [],
  currentPost: null,
  mutualFollowers: [],
  isLoading: false,
  isCreating: false,
  isLoadingMutuals: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  totalPages: 0,
  // Mutual followers pagination
  mutualFollowersPage: 0,
  mutualFollowersHasMore: true,
};

// Async thunks for API calls
export const createPostThunk = createAsyncThunk(
  'post/createPost',
  async ({ files, postData }: { files: File[]; postData: CreatePostRequest }, { rejectWithValue }) => {
    try {
      const response = await createPost(files, postData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo bài viết');
    }
  }
);

export const getPostsThunk = createAsyncThunk(
  'post/getPosts',
  async (params: GetPostsRequest, { rejectWithValue }) => {
    try {
      const response = await getPosts(params);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải danh sách bài viết');
    }
  }
);

export const getFeedThunk = createAsyncThunk(
  'post/getFeed',
  async (params: GetFeedRequest, { rejectWithValue }) => {
    try {
      const response = await getFeed(params);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải feed');
    }
  }
);

export const getPostDetailThunk = createAsyncThunk(
  'post/getPostDetail',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await getPostDetail(postId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải chi tiết bài viết');
    }
  }
);

export const updatePostThunk = createAsyncThunk(
  'post/updatePost',
  async ({ files, postData }: { files: File[]; postData: UpdatePostRequest }, { rejectWithValue }) => {
    try {
      const response = await updatePost(files, postData);
      return { postId: postData.postId, response };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật bài viết');
    }
  }
);

export const togglePostActiveThunk = createAsyncThunk(
  'post/togglePostActive',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await togglePostActive(postId);
      return { postId, response };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thay đổi trạng thái bài viết');
    }
  }
);

export const deletePostThunk = createAsyncThunk(
  'post/deletePost',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await deletePost(postId);
      return { postId, response };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa bài viết');
    }
  }
);

export const likePostThunk = createAsyncThunk(
  'post/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await likePost(postId);
      return { postId, ...response.data };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thích bài viết');
    }
  }
);

export const bookmarkPostThunk = createAsyncThunk(
  'post/bookmarkPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await bookmarkPost(postId);
      return { postId, ...response.data };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu bài viết');
    }
  }
);

export const createCommentThunk = createAsyncThunk(
  'post/createComment',
  async (commentData: CreateCommentRequest, { rejectWithValue }) => {
    try {
      const response = await createComment(commentData);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo bình luận');
    }
  }
);

export const getMutualFollowersThunk = createAsyncThunk(
  'post/getMutualFollowers',
  async (params: GetMutualFollowersRequest = {}, { rejectWithValue }) => {
    try {
      const response = await getMutualFollowers(params);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải danh sách bạn bè chung');
    }
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.currentPage = 0;
      state.totalPages = 0;
      state.hasMore = true;
    },
    updatePostOptimistically: (state, action: PayloadAction<{ postId: string; updates: Partial<Post> }>) => {
      const { postId, updates } = action.payload;
      const postIndex = state.posts.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex] = { ...state.posts[postIndex], ...updates };
      }
      if (state.currentPost?.id === postId) {
        state.currentPost = { ...state.currentPost, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    // Create Post
    builder
      .addCase(createPostThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
    .addCase(createPostThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Create post API only returns success/failure, no post data
      // The post will be added to the list when getPosts is called
    })
      .addCase(createPostThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Get Posts (for profile page)
    builder
      .addCase(getPostsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPostsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const { content, totalPages, pageNo } = action.payload;
        const transformedPosts = content.map(transformPostData);
        
        if (pageNo === 0) {
          state.posts = transformedPosts;
        } else {
          state.posts.push(...transformedPosts);
        }
        
        state.currentPage = pageNo;
        state.totalPages = totalPages;
        state.hasMore = pageNo < totalPages - 1;
      })
      .addCase(getPostsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Feed (for feed page)
    builder
      .addCase(getFeedThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeedThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const { content, totalPages, pageNo } = action.payload;
        const transformedPosts = content.map(transformPostData);
        
        if (pageNo === 0) {
          state.posts = transformedPosts;
        } else {
          state.posts.push(...transformedPosts);
        }
        
        state.currentPage = pageNo;
        state.totalPages = totalPages;
        state.hasMore = pageNo < totalPages - 1;
      })
      .addCase(getFeedThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Post Detail
    builder
      .addCase(getPostDetailThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPostDetailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const transformedPost = transformPostData(action.payload.data);
        state.currentPost = transformedPost;
      })
      .addCase(getPostDetailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Post
    builder
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        // Update post in the list if it exists
        const { postId } = action.payload;
        const postIndex = state.posts.findIndex(post => post.id === postId.toString());
        if (postIndex !== -1) {
          // Remove the updated post from the list
          // It will be refreshed when getPosts is called again
          state.posts.splice(postIndex, 1);
        }
      })
      .addCase(updatePostThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Toggle Post Active
    builder
      .addCase(togglePostActiveThunk.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const postIndex = state.posts.findIndex(post => post.id === postId.toString());
        if (postIndex !== -1) {
          state.posts.splice(postIndex, 1);
        }
      })
      .addCase(togglePostActiveThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Post
    builder
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        const { postId } = action.payload;
        // Remove deleted post from the list
        state.posts = state.posts.filter(post => post.id !== postId.toString());
        // Clear current post if it was deleted
        if (state.currentPost?.id === postId.toString()) {
          state.currentPost = null;
        }
      })
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Like Post
    builder
      .addCase(likePostThunk.fulfilled, (state, action) => {
        const { postId, isLiked, likesCount } = action.payload;
        const postIndex = state.posts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].isLiked = isLiked;
          state.posts[postIndex].likesCount = likesCount;
        }
        if (state.currentPost?.id === postId) {
          state.currentPost.isLiked = isLiked;
          state.currentPost.likesCount = likesCount;
        }
      })
      .addCase(likePostThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Bookmark Post
    builder
      .addCase(bookmarkPostThunk.fulfilled, (state, action) => {
        const { postId, isBookmarked } = action.payload;
        const postIndex = state.posts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].isBookmarked = isBookmarked;
        }
        if (state.currentPost?.id === postId) {
          state.currentPost.isBookmarked = isBookmarked;
        }
      })
      .addCase(bookmarkPostThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create Comment
    builder
      .addCase(createCommentThunk.fulfilled, (state, action) => {
        const comment = action.payload;
        const postId = comment.postId;
        
        // Update comments count for the post
        const postIndex = state.posts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentsCount += 1;
        }
        if (state.currentPost?.id === postId) {
          state.currentPost.commentsCount += 1;
        }
      })
      .addCase(createCommentThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Get Mutual Followers
    builder
      .addCase(getMutualFollowersThunk.pending, (state) => {
        state.isLoadingMutuals = true;
      })
      .addCase(getMutualFollowersThunk.fulfilled, (state, action) => {
        state.isLoadingMutuals = false;
        const { content, totalPages, pageNo } = action.payload;
        
        if (pageNo === 0) {
          // First page - replace mutual followers
          state.mutualFollowers = content;
        } else {
          // Subsequent pages - append mutual followers
          state.mutualFollowers.push(...content);
        }
        
        state.mutualFollowersPage = pageNo;
        state.mutualFollowersHasMore = pageNo < totalPages - 1;
      })
      .addCase(getMutualFollowersThunk.rejected, (state, action) => {
        state.isLoadingMutuals = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentPost,
  clearPosts,
  updatePostOptimistically,
} = postSlice.actions;

export default postSlice.reducer;
