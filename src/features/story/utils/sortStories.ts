import type { Story } from "../types";

/**
 * Sắp xếp danh sách story theo mức độ ưu tiên:
 * 1. Story của chính người dùng luôn ở đầu (bất kể đã xem hay chưa)
 * 2. Các story của bạn bè hoặc người khác chưa xem
 * 3. Các story đã xem sẽ nằm ở cuối cùng
 * 
 * @param stories - Mảng các story cần sắp xếp
 * @returns Mảng story đã được sắp xếp
 */
export const sortStoriesByViewedStatus = (stories: Story[]): Story[] => {
  return [...stories].sort((a, b) => {
    // Story của chính người dùng luôn ở đầu (bất kể đã xem hay chưa)
    if (a.isOwnStory && !b.isOwnStory) return -1;
    if (!a.isOwnStory && b.isOwnStory) return 1;
    
    // Với các story khác: story chưa xem nằm trước, đã xem nằm sau
    if (a.isViewed === b.isViewed) return 0;
    return a.isViewed ? 1 : -1; // false (chưa xem) sẽ đứng trước true (đã xem)
  });
};
