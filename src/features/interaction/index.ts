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
  likeCommentThunk,
  likePostThunk,
  likeReelThunk,
  clearCommentError,
  clearLikeError,
  clearComments,
  updateCommentOptimistically,
} from "./interactionSlice";

export { default as interactionReducer } from "./interactionSlice";
