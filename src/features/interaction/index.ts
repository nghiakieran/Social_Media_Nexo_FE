// Export types
export * from "./types";

// Export API functions
export * from "./api/commentApi";
export * from "./api/likeApi";

// Export slice and actions
export {
  createCommentThunk,
  updateCommentThunk,
  deleteCommentThunk,
  getPostCommentsThunk,
  getReelCommentsThunk,
  getCommentRepliesThunk,
  likeCommentThunk,
  likePostThunk,
  likeReelThunk,
  getPostLikeDetailThunk,
  getReelLikeDetailThunk,
  getCommentLikeDetailThunk,
  clearCommentError,
  clearLikeError,
  clearComments,
  updateCommentOptimistically,
} from "./interactionSlice";

export { default as interactionReducer } from "./interactionSlice";
