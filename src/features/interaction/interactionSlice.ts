import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getReelComments,
} from "./api/commentApi";
import { likeComment, likePost, likeReel } from "./api/likeApi";
import { transformCommentData } from "./types";
import type {
  Comment,
  CommentState,
  LikeState,
  CreateCommentRequest,
  UpdateCommentRequest,
  GetCommentsRequest,
} from "./types";

// Comment State
const initialCommentState: CommentState = {
  comments: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  totalPages: 0,
};

// Like State
const initialLikeState: LikeState = {
  isLoading: false,
  error: null,
};

// Combined State
export interface InteractionState {
  comments: CommentState;
  likes: LikeState;
}

const initialState: InteractionState = {
  comments: initialCommentState,
  likes: initialLikeState,
};

// Async Thunks for Comments
export const createCommentThunk = createAsyncThunk(
  "interaction/createComment",
  async (commentData: CreateCommentRequest, { rejectWithValue }) => {
    try {
      const response = await createComment(commentData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo bình luận"
      );
    }
  }
);

export const updateCommentThunk = createAsyncThunk(
  "interaction/updateComment",
  async (commentData: UpdateCommentRequest, { rejectWithValue }) => {
    try {
      const response = await updateComment(commentData);
      return { commentId: commentData.id, response };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật bình luận"
      );
    }
  }
);

export const deleteCommentThunk = createAsyncThunk(
  "interaction/deleteComment",
  async (commentId: number, { rejectWithValue }) => {
    try {
      const response = await deleteComment(commentId);
      return { commentId, response };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xóa bình luận"
      );
    }
  }
);

export const getPostCommentsThunk = createAsyncThunk(
  "interaction/getPostComments",
  async (
    { postId, params }: { postId: number; params?: GetCommentsRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await getPostComments(postId, params);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải bình luận"
      );
    }
  }
);

export const getReelCommentsThunk = createAsyncThunk(
  "interaction/getReelComments",
  async (
    { reelId, params }: { reelId: number; params?: GetCommentsRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await getReelComments(reelId, params);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải bình luận"
      );
    }
  }
);

// Async Thunks for Likes
export const likeCommentThunk = createAsyncThunk(
  "interaction/likeComment",
  async (commentId: number, { rejectWithValue }) => {
    try {
      const response = await likeComment(commentId);
      return { commentId, response };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thích bình luận"
      );
    }
  }
);

export const likePostThunk = createAsyncThunk(
  "interaction/likePost",
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await likePost(postId);
      return { postId, response };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thích bài viết"
      );
    }
  }
);

export const likeReelThunk = createAsyncThunk(
  "interaction/likeReel",
  async (reelId: number, { rejectWithValue }) => {
    try {
      const response = await likeReel(reelId);
      return { reelId, response };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi thích reel"
      );
    }
  }
);

const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    clearCommentError: (state) => {
      state.comments.error = null;
    },
    clearLikeError: (state) => {
      state.likes.error = null;
    },
    clearComments: (state) => {
      state.comments.comments = [];
      state.comments.currentPage = 0;
      state.comments.totalPages = 0;
      state.comments.hasMore = true;
    },
    updateCommentOptimistically: (
      state,
      action: PayloadAction<{ commentId: string; updates: Partial<Comment> }>
    ) => {
      const { commentId, updates } = action.payload;
      const updateCommentInList = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, ...updates };
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentInList(comment.replies),
            };
          }
          return comment;
        });
      };
      state.comments.comments = updateCommentInList(state.comments.comments);
    },
  },
  extraReducers: (builder) => {
    // Create Comment
    builder
      .addCase(createCommentThunk.pending, (state) => {
        state.comments.isCreating = true;
        state.comments.error = null;
      })
      .addCase(createCommentThunk.fulfilled, (state) => {
        state.comments.isCreating = false;
      })
      .addCase(createCommentThunk.rejected, (state, action) => {
        state.comments.isCreating = false;
        state.comments.error = action.payload as string;
      });

    // Update Comment
    builder
      .addCase(updateCommentThunk.pending, (state) => {
        state.comments.isUpdating = true;
        state.comments.error = null;
      })
      .addCase(updateCommentThunk.fulfilled, (state) => {
        state.comments.isUpdating = false;
        // Comment will be refreshed when getComments is called
      })
      .addCase(updateCommentThunk.rejected, (state, action) => {
        state.comments.isUpdating = false;
        state.comments.error = action.payload as string;
      });

    // Delete Comment
    builder
      .addCase(deleteCommentThunk.pending, (state) => {
        state.comments.isDeleting = true;
        state.comments.error = null;
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.comments.isDeleting = false;
        const { commentId } = action.payload;
        const removeCommentFromList = (comments: Comment[]): Comment[] => {
          return comments.filter((comment) => {
            if (comment.id === commentId.toString()) {
              return false;
            }
            if (comment.replies.length > 0) {
              comment.replies = removeCommentFromList(comment.replies);
            }
            return true;
          });
        };
        state.comments.comments = removeCommentFromList(
          state.comments.comments
        );
      })
      .addCase(deleteCommentThunk.rejected, (state, action) => {
        state.comments.isDeleting = false;
        state.comments.error = action.payload as string;
      });

    // Get Post Comments
    builder
      .addCase(getPostCommentsThunk.pending, (state) => {
        state.comments.isLoading = true;
        state.comments.error = null;
      })
      .addCase(getPostCommentsThunk.fulfilled, (state, action) => {
        state.comments.isLoading = false;
        const { commentResponseList, totalPages, pageNo } = action.payload;
        const transformedComments =
          commentResponseList.map(transformCommentData);

        if (pageNo === 0) {
          state.comments.comments = transformedComments;
        } else {
          // Append new comments
          state.comments.comments.push(...transformedComments);
        }

        state.comments.currentPage = pageNo;
        state.comments.totalPages = totalPages;
        state.comments.hasMore = !action.payload.last;
      })
      .addCase(getPostCommentsThunk.rejected, (state, action) => {
        state.comments.isLoading = false;
        state.comments.error = action.payload as string;
      });

    // Get Reel Comments
    builder
      .addCase(getReelCommentsThunk.pending, (state) => {
        state.comments.isLoading = true;
        state.comments.error = null;
      })
      .addCase(getReelCommentsThunk.fulfilled, (state, action) => {
        state.comments.isLoading = false;
        const { commentResponseList, totalPages, pageNo } = action.payload;
        const transformedComments =
          commentResponseList.map(transformCommentData);

        if (pageNo === 0) {
          state.comments.comments = transformedComments;
        } else {
          // Append new comments
          state.comments.comments.push(...transformedComments);
        }

        state.comments.currentPage = pageNo;
        state.comments.totalPages = totalPages;
        state.comments.hasMore = !action.payload.last;
      })
      .addCase(getReelCommentsThunk.rejected, (state, action) => {
        state.comments.isLoading = false;
        state.comments.error = action.payload as string;
      });


    // Like Comment
    builder
      .addCase(likeCommentThunk.pending, (state) => {
        state.likes.isLoading = true;
        state.likes.error = null;
      })
      .addCase(likeCommentThunk.fulfilled, (state, action) => {
        state.likes.isLoading = false;
        const { commentId } = action.payload;

        // Update comment like status
        const updateLikeInComment = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === commentId.toString()) {
              return {
                ...comment,
                isLiked: !comment.isLiked,
                likesCount: comment.isLiked
                  ? comment.likesCount - 1
                  : comment.likesCount + 1,
              };
            }
            if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateLikeInComment(comment.replies),
              };
            }
            return comment;
          });
        };
        state.comments.comments = updateLikeInComment(state.comments.comments);
      })
      .addCase(likeCommentThunk.rejected, (state, action) => {
        state.likes.isLoading = false;
        state.likes.error = action.payload as string;
      });

    // Like Post
    builder
      .addCase(likePostThunk.pending, (state) => {
        state.likes.isLoading = true;
        state.likes.error = null;
      })
      .addCase(likePostThunk.fulfilled, (state) => {
        state.likes.isLoading = false;
        // Post like status will be handled by post slice
      })
      .addCase(likePostThunk.rejected, (state, action) => {
        state.likes.isLoading = false;
        state.likes.error = action.payload as string;
      });

    // Like Reel
    builder
      .addCase(likeReelThunk.pending, (state) => {
        state.likes.isLoading = true;
        state.likes.error = null;
      })
      .addCase(likeReelThunk.fulfilled, (state) => {
        state.likes.isLoading = false;
        // Reel like status will be handled by reel slice
      })
      .addCase(likeReelThunk.rejected, (state, action) => {
        state.likes.isLoading = false;
        state.likes.error = action.payload as string;
      });
  },
});

export const {
  clearCommentError,
  clearLikeError,
  clearComments,
  updateCommentOptimistically,
} = interactionSlice.actions;

export default interactionSlice.reducer;
