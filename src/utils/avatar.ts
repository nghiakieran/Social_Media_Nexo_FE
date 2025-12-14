import { DEFAULT_AVATAR_URL } from "./constants";

/**
 * Get avatar URL with fallback to default avatar
 * @param avatarUrl - User's avatar URL (can be null, undefined, or empty string)
 * @returns Valid avatar URL or default fallback
 */
export const getAvatarUrl = (avatarUrl?: string | null): string => {
  if (!avatarUrl || avatarUrl.trim() === "") {
    return DEFAULT_AVATAR_URL;
  }
  return avatarUrl;
};

/**
 * Get initials from username or name for AvatarFallback
 * @param name - Username or full name
 * @returns First 2 uppercase letters
 */
export const getAvatarInitials = (name?: string | null): string => {
  if (!name || name.trim() === "") {
    return "U";
  }
  return name.slice(0, 2).toUpperCase();
};
