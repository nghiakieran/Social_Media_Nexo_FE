import { useAppSelector, useAppDispatch } from '../../../store';
import { savePost, unsavePost } from '../savedSlice';
import { useCallback } from 'react';

export const useBookmark = () => {
  const dispatch = useAppDispatch();
  const { posts } = useAppSelector((state) => state.saved);

  const isBookmarked = useCallback((postId: string) => {
    return posts.some(post => post.postId === postId);
  }, [posts]);

  const toggleBookmark = useCallback((postId: string, collectionId?: string) => {
    if (isBookmarked(postId)) {
      dispatch(unsavePost(postId));
    } else {
      dispatch(savePost({ postId, collectionId }));
    }
  }, [dispatch, isBookmarked]);

  const bookmarkPost = useCallback((postId: string, collectionId?: string) => {
    if (!isBookmarked(postId)) {
      dispatch(savePost({ postId, collectionId }));
    }
  }, [dispatch, isBookmarked]);

  const unbookmarkPost = useCallback((postId: string) => {
    if (isBookmarked(postId)) {
      dispatch(unsavePost(postId));
    }
  }, [dispatch, isBookmarked]);

  return {
    isBookmarked,
    toggleBookmark,
    bookmarkPost,
    unbookmarkPost,
  };
};


