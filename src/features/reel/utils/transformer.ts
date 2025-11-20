import { ReelApiResponse, Reel } from '../types';

/**
 * Transform backend API response to frontend Reel type
 */
export const transformReelFromApi = (apiReel: ReelApiResponse): Reel => {
  // Parse tags from string "#dance #reel #viral" -> ["dance", "reel", "viral"]
  const tags = apiReel.tag
    ? apiReel.tag
        .split('#')
        .filter((tag) => tag.trim().length > 0)
        .map((tag) => tag.trim())
    : [];

  return {
    id: apiReel.reelId.toString(),
    userId: apiReel.userId.toString(),
    userName: apiReel.userName,
    avatarUrl: apiReel.avatarUrl,
    caption: apiReel.caption,
    visibility: apiReel.visibility,
    tags,
    mediaUrl: apiReel.mediaUrl,
    likesCount: apiReel.quantityLike,
    commentsCount: apiReel.quantityComment,
    isLiked: apiReel.isLike,
    taggedUsers: apiReel.listUserTag,
    isActive: apiReel.isActive,
    createdAt: apiReel.createdAt,
    updatedAt: apiReel.updatedAt,
  };
};

/**
 * Transform array of API reels
 */
export const transformReelsFromApi = (apiReels: ReelApiResponse[]): Reel[] => {
  return apiReels.map(transformReelFromApi);
};

/**
 * Convert tags array back to string for API
 * ["dance", "reel", "viral"] -> "#dance #reel #viral"
 */
export const tagsToString = (tags: string[]): string => {
  return tags.map((tag) => `#${tag}`).join(' ');
};
