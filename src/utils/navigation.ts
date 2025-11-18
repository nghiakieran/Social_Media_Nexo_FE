import { NavigateFunction } from "react-router-dom";

/**
 * Navigate to post detail page
 * @param navigate - React Router navigate function
 * @param postId - Post ID to navigate to
 */
export const navigateToPost = (navigate: NavigateFunction, postId: string) => {
  navigate(`/posts/${postId}`);
};
export const navigateToPost2 = (navigate: NavigateFunction, postId: string) => {
  navigate(`${postId}`);
};

/**
 * Navigate to user profile page
 * @param navigate - React Router navigate function
 * @param username - Username to navigate to
 */
export const navigateToProfile = (
  navigate: NavigateFunction,
  username: string
) => {
  navigate(`/${username}`);
};

/**
 * Navigate to chat page
 * @param navigate - React Router navigate function
 * @param chatId - Chat ID to navigate to
 */
export const navigateToChat = (navigate: NavigateFunction, chatId: string) => {
  navigate(`/messages/${chatId}`);
};

/**
 * Navigate back to previous page
 * @param navigate - React Router navigate function
 * @param fallback - Fallback route if no history
 */
export const navigateBack = (navigate: NavigateFunction, fallback = "/") => {
  navigate(-1);
};

/**
 * Generate post detail URL
 * @param postId - Post ID
 * @returns Post detail URL
 */
export const getPostDetailUrl = (postId: string): string => {
  return `/posts/${postId}`;
};

/**
 * Generate profile URL
 * @param username - Username
 * @returns Profile URL
 */
export const getProfileUrl = (username: string): string => {
  return `/${username}`;
};

/**
 * Generate chat URL
 * @param chatId - Chat ID
 * @returns Chat URL
 */
export const getChatUrl = (chatId: string): string => {
  return `/messages/${chatId}`;
};
