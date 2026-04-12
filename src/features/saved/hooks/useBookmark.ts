import { useAppSelector, useAppDispatch } from "../../../store";
import { savePostThunk, checkPostsSavedStatusThunk } from "../savedSlice";
import { useCallback, useRef } from "react";
import { useToast } from "../../../hooks/use-toast";

export const useBookmark = () => {
  const dispatch = useAppDispatch();
  const { posts, savedStatusCache } = useAppSelector((state) => state.saved);
  const checkedPostsRef = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  const isBookmarked = useCallback(
    (postId: string) => {
      // First check if we have it in saved posts
      if (posts.some((post) => post.postId === postId)) {
        return true;
      }
      // Then check cache
      return savedStatusCache[postId] || false;
    },
    [posts, savedStatusCache],
  );

  const checkSavedStatus = useCallback(
    async (postIds: string[]) => {
      // Filter out posts we already know the status for or have checked
      const unknownPostIds = postIds.filter(
        (postId) =>
          !(postId in savedStatusCache) &&
          !posts.some((p) => p.postId === postId) &&
          !checkedPostsRef.current.has(postId),
      );

      if (unknownPostIds.length > 0) {
        try {
          await dispatch(checkPostsSavedStatusThunk(unknownPostIds));
          // Mark as checked
          unknownPostIds.forEach((id) => checkedPostsRef.current.add(id));
        } catch (error) {
          console.error("Error checking saved status:", error);
        }
      }
    },
    [dispatch, savedStatusCache, posts],
  );

  const toggleBookmark = useCallback(
    async (postId: string, collectionId?: string) => {
      try {
        const currentlyBookmarked = isBookmarked(postId);
        // Backend toggles: if exists → delete, if not → save
        await dispatch(savePostThunk({ postId, collectionId })).unwrap();

        if (currentlyBookmarked) {
          toast({
            title: "Thành công",
            description: "Đã xóa bài viết khỏi danh sách lưu",
          });
        } else {
          toast({
            title: "Thành công",
            description: "Đã lưu bài viết",
          });
        }
        return true;
      } catch (error: any) {
        console.error("Error toggling bookmark:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error?.message || "Không thể thực hiện hành động",
        });
        return false;
      }
    },
    [dispatch, isBookmarked, toast],
  );

  const bookmarkPost = useCallback(
    async (postId: string, collectionId?: string) => {
      try {
        if (!isBookmarked(postId)) {
          // Toggle will save since post is not yet bookmarked
          await dispatch(savePostThunk({ postId, collectionId })).unwrap();
        }
        return true;
      } catch (error: any) {
        console.error("Error bookmarking post:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error?.message || "Không thể lưu bài viết",
        });
        return false;
      }
    },
    [dispatch, isBookmarked, toast],
  );

  const unbookmarkPost = useCallback(
    async (postId: string) => {
      try {
        if (isBookmarked(postId)) {
          // Toggle will delete since post is already bookmarked
          await dispatch(savePostThunk({ postId })).unwrap();
        }
        return true;
      } catch (error) {
        console.error("Error unbookmarking post:", error);
        return false;
      }
    },
    [dispatch, isBookmarked],
  );

  return {
    isBookmarked,
    checkSavedStatus,
    toggleBookmark,
    bookmarkPost,
    unbookmarkPost,
  };
};
