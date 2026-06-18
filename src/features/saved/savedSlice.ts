import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { SavedState, SavedPost, SavedCollection } from "./types";
import { mockCollections } from "./__mocks__/collections";
import {
  savePost as savePostApi,
  getSavedPosts as getSavedPostsApi,
  checkPostsSavedStatus,
  SavedPostResponseDTO,
} from "./api/savedApi";

// Async thunks
export const savePostThunk = createAsyncThunk(
  "saved/savePost",
  async (
    { postId, collectionId }: { postId: string; collectionId?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await savePostApi(parseInt(postId));
      return { postId, collectionId, savedPostData: response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const getSavedPostsThunk = createAsyncThunk(
  "saved/getSavedPosts",
  async (
    params?: { page?: number; size?: number; sort?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await getSavedPostsApi(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const checkPostsSavedStatusThunk = createAsyncThunk(
  "saved/checkPostsSavedStatus",
  async (postIds: string[], { rejectWithValue }) => {
    try {
      const response = await checkPostsSavedStatus(
        postIds.map((id) => parseInt(id)),
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState: SavedState = {
  collections: mockCollections,
  posts: [], // Start with empty array, will be populated by API
  loading: false,
  error: null,
  pagination: {
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: false,
  },
  savedStatusCache: {}, // Cache for post saved status
};

const savedSlice = createSlice({
  name: "saved",
  initialState,
  reducers: {
    // Collection actions
    createCollectionWithPosts: (
      state,
      action: PayloadAction<{
        collection: Omit<
          SavedCollection,
          "id" | "createdAt" | "updatedAt" | "postsCount"
        >;
        selectedPostIds: string[];
      }>,
    ) => {
      const { collection, selectedPostIds } = action.payload;
      const newCollection: SavedCollection = {
        ...collection,
        id: `collection-${Date.now()}`,
        postsCount: selectedPostIds.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.collections.push(newCollection);

      // Move selected posts to the new collection
      state.posts = state.posts.map((post) =>
        selectedPostIds.includes(post.id)
          ? { ...post, collectionId: newCollection.id }
          : post,
      );

      // Update posts count for "all-posts" collection
      const allPostsCollection = state.collections.find(
        (c) => c.id === "all-posts",
      );
      if (allPostsCollection) {
        allPostsCollection.postsCount = Math.max(
          0,
          allPostsCollection.postsCount - selectedPostIds.length,
        );
        allPostsCollection.updatedAt = new Date().toISOString();
      }
    },

    updateCollection: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Omit<SavedCollection, "id" | "isDefault">>;
      }>,
    ) => {
      const { id, updates } = action.payload;
      const collection = state.collections.find((c) => c.id === id);
      if (collection) {
        Object.assign(collection, updates);
        collection.updatedAt = new Date().toISOString();
      }
    },

    deleteCollection: (state, action: PayloadAction<string>) => {
      const collectionId = action.payload;
      // Don't allow deleting default collection
      if (collectionId === "all-posts") return;

      state.collections = state.collections.filter(
        (c) => c.id !== collectionId,
      );
      // Move posts from deleted collection to "all-posts"
      state.posts = state.posts.map((post) =>
        post.collectionId === collectionId
          ? { ...post, collectionId: "all-posts" }
          : post,
      );
    },

    // Post actions
    savePost: (
      state,
      action: PayloadAction<{ postId: string; collectionId?: string }>,
    ) => {
      const { postId, collectionId = "all-posts" } = action.payload;

      // Check if already saved
      const existingPost = state.posts.find((p) => p.postId === postId);
      if (existingPost) return;

      // Create mock post data (in real app, this would come from API)
      const mockPost: SavedPost = {
        id: `saved-${Date.now()}`,
        postId,
        collectionId,
        savedAt: new Date().toISOString(),
        post: {
          id: postId,
          userId: "current-user",
          userName: "me",
          avatarUrl:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          content: `Mock post content for ${postId}`,
          media: [
            {
              id: `media-${Date.now()}`,
              type: "image",
              url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
              alt: "Mock saved post",
            },
          ],
          likesCount: Math.floor(Math.random() * 1000),
          commentsCount: Math.floor(Math.random() * 100),
          createdAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      };

      state.posts.push(mockPost);

      // Update collection posts count
      const collection = state.collections.find((c) => c.id === collectionId);
      if (collection) {
        collection.postsCount += 1;
        collection.updatedAt = new Date().toISOString();
      }
    },

    unsavePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const postIndex = state.posts.findIndex((p) => p.postId === postId);

      if (postIndex !== -1) {
        const post = state.posts[postIndex];
        state.posts.splice(postIndex, 1);

        // Update collection posts count
        const collection = state.collections.find(
          (c) => c.id === post.collectionId,
        );
        if (collection) {
          collection.postsCount = Math.max(0, collection.postsCount - 1);
          collection.updatedAt = new Date().toISOString();
        }
      }
    },

    movePostToCollection: (
      state,
      action: PayloadAction<{
        postId: string;
        fromCollectionId: string;
        toCollectionId: string;
      }>,
    ) => {
      const { postId, fromCollectionId, toCollectionId } = action.payload;

      const post = state.posts.find(
        (p) => p.postId === postId && p.collectionId === fromCollectionId,
      );
      if (post) {
        post.collectionId = toCollectionId;

        // Update posts count for both collections
        const fromCollection = state.collections.find(
          (c) => c.id === fromCollectionId,
        );
        const toCollection = state.collections.find(
          (c) => c.id === toCollectionId,
        );

        if (fromCollection) {
          fromCollection.postsCount = Math.max(
            0,
            fromCollection.postsCount - 1,
          );
          fromCollection.updatedAt = new Date().toISOString();
        }

        if (toCollection) {
          toCollection.postsCount += 1;
          toCollection.updatedAt = new Date().toISOString();
        }
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save post
      .addCase(savePostThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePostThunk.fulfilled, (state, action) => {
        state.loading = false;
        const {
          postId,
          collectionId = "all-posts",
          savedPostData,
        } = action.payload;

        // Check if post already exists (toggle logic: if exists → delete, if not → add)
        const existingIndex = state.posts.findIndex((p) => p.postId === postId);
        if (existingIndex !== -1) {
          // Post already saved → toggle removes it (backend deleted)
          const post = state.posts[existingIndex];
          state.posts.splice(existingIndex, 1);
          // Update cache to reflect deletion
          state.savedStatusCache[postId] = false;

          // Update collection count
          const collection = state.collections.find(
            (c) => c.id === post.collectionId,
          );
          if (collection) {
            collection.postsCount = Math.max(0, collection.postsCount - 1);
            collection.updatedAt = new Date().toISOString();
          }
        } else {
          // Post not saved → toggle adds it (backend saved)
          const savedPost: SavedPost = {
            id: savedPostData.savedPostId.toString(),
            postId: savedPostData.postId.toString(),
            collectionId,
            savedAt: savedPostData.savedAt,
            post: {
              id: savedPostData.postId.toString(),
              userId: savedPostData.ownerId.toString(),
              userName: savedPostData.ownerUsername,
              avatarUrl: savedPostData.ownerAvatarUrl,
              content: savedPostData.caption,
              media:
                savedPostData.mediaUrls && savedPostData.mediaUrls.length > 0
                  ? savedPostData.mediaUrls.map((url, index) => ({
                      id: `media-${savedPostData.postId}-${index}`,
                      type: "image" as const,
                      url,
                      alt: `Post media ${index + 1}`,
                    }))
                  : [
                      {
                        id: `media-${savedPostData.postId}-placeholder`,
                        type: "image" as const,
                        url: "/placeholder-image.png",
                        alt: "No media available",
                      },
                    ],
              likesCount: savedPostData.quantityLike,
              commentsCount: savedPostData.quantityComment,
              createdAt: savedPostData.postCreatedAt,
            },
          };

          state.posts.unshift(savedPost);
          // Update cache to reflect addition
          state.savedStatusCache[postId] = true;

          // Update collection count
          const collection = state.collections.find(
            (c) => c.id === collectionId,
          );
          if (collection) {
            collection.postsCount += 1;
            collection.updatedAt = new Date().toISOString();
          }
        }
      })
      .addCase(savePostThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get saved posts
      .addCase(getSavedPostsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSavedPostsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { content, ...pagination } = action.payload.data;

        // Convert API responses to SavedPost format
        const savedPosts: SavedPost[] = content.map((savedPostData) => ({
          id: savedPostData.savedPostId.toString(),
          postId: savedPostData.postId.toString(),
          collectionId: "all-posts", // Default collection
          savedAt: savedPostData.savedAt,
          post: {
            id: savedPostData.postId.toString(),
            userId: savedPostData.ownerId.toString(),
            userName: savedPostData.ownerUsername,
            avatarUrl: savedPostData.ownerAvatarUrl,
            content: savedPostData.caption,
            media:
              savedPostData.mediaUrls && savedPostData.mediaUrls.length > 0
                ? savedPostData.mediaUrls.map((url, index) => ({
                    id: `media-${savedPostData.postId}-${index}`,
                    type: "image" as const,
                    url,
                    alt: `Post media ${index + 1}`,
                  }))
                : [
                    {
                      id: `media-${savedPostData.postId}-placeholder`,
                      type: "image" as const,
                      url: "/placeholder.svg", // Placeholder image
                      alt: "No media available",
                    },
                  ],
            likesCount: savedPostData.quantityLike,
            commentsCount: savedPostData.quantityComment,
            createdAt: savedPostData.postCreatedAt,
          },
        }));

        state.posts = savedPosts;
        state.pagination = pagination;
      })
      .addCase(getSavedPostsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Check posts saved status
      .addCase(checkPostsSavedStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPostsSavedStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Update cache with the results
        Object.entries(action.payload).forEach(([postId, isSaved]) => {
          state.savedStatusCache[postId] = isSaved;
        });
      })
      .addCase(checkPostsSavedStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  createCollectionWithPosts,
  updateCollection,
  deleteCollection,
  savePost,
  unsavePost,
  movePostToCollection,
  setLoading,
  setError,
} = savedSlice.actions;

export default savedSlice.reducer;
