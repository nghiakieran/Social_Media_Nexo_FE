import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  createdAt: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  parentId?: string; // For nested replies
  replies?: Comment[];
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Like {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  targetId: string; // postId or commentId
  targetType: 'post' | 'comment';
  createdAt: string;
}

interface Share {
  id: string;
  userId: string;
  postId: string;
  shareType: 'feed' | 'story' | 'message' | 'link';
  createdAt: string;
}

interface InteractionState {
  comments: Comment[];
  likes: Like[];
  reactions: Reaction[];
  shares: Share[];
  isLoading: boolean;
  error: string | null;
  currentPostComments: Comment[];
  commentsLoading: boolean;
}

const initialState: InteractionState = {
  comments: [],
  likes: [],
  reactions: [],
  shares: [],
  isLoading: false,
  error: null,
  currentPostComments: [],
  commentsLoading: false,
};

const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    // Comments
    fetchCommentsStart: (state, action: PayloadAction<string>) => {
      state.commentsLoading = true;
      state.error = null;
    },
    fetchCommentsSuccess: (state, action: PayloadAction<{ postId: string; comments: Comment[] }>) => {
      state.currentPostComments = action.payload.comments;
      state.commentsLoading = false;
    },
    fetchCommentsFailure: (state, action: PayloadAction<string>) => {
      state.commentsLoading = false;
      state.error = action.payload;
    },
    
    addComment: (state, action: PayloadAction<Comment>) => {
      state.currentPostComments.push(action.payload);
      state.comments.push(action.payload);
    },
    
    deleteComment: (state, action: PayloadAction<string>) => {
      state.currentPostComments = state.currentPostComments.filter(c => c.id !== action.payload);
      state.comments = state.comments.filter(c => c.id !== action.payload);
    },
    
    toggleCommentLike: (state, action: PayloadAction<string>) => {
      const comment = state.currentPostComments.find(c => c.id === action.payload);
      if (comment) {
        comment.isLiked = !comment.isLiked;
        comment.likesCount += comment.isLiked ? 1 : -1;
      }
    },
    
    addReply: (state, action: PayloadAction<{ parentId: string; reply: Comment }>) => {
      const parentComment = state.currentPostComments.find(c => c.id === action.payload.parentId);
      if (parentComment) {
        if (!parentComment.replies) parentComment.replies = [];
        parentComment.replies.push(action.payload.reply);
      }
    },
    
    // Likes
    addLike: (state, action: PayloadAction<Like>) => {
      state.likes.push(action.payload);
    },
    
    removeLike: (state, action: PayloadAction<string>) => {
      state.likes = state.likes.filter(l => l.id !== action.payload);
    },
    
    // Reactions
    addReaction: (state, action: PayloadAction<Reaction>) => {
      state.reactions.push(action.payload);
    },
    
    removeReaction: (state, action: PayloadAction<string>) => {
      state.reactions = state.reactions.filter(r => r.id !== action.payload);
    },
    
    // Shares
    addShare: (state, action: PayloadAction<Share>) => {
      state.shares.push(action.payload);
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchCommentsStart,
  fetchCommentsSuccess,
  fetchCommentsFailure,
  addComment,
  deleteComment,
  toggleCommentLike,
  addReply,
  addLike,
  removeLike,
  addReaction,
  removeReaction,
  addShare,
  clearError,
} = interactionSlice.actions;

export default interactionSlice.reducer;