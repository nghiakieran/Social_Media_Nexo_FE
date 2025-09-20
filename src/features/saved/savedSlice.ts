import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SavedState, SavedPost, SavedCollection } from './types';
import { mockCollections } from './__mocks__/collections';
import { mockSavedPosts } from './__mocks__/posts';

const initialState: SavedState = {
  collections: mockCollections,
  posts: mockSavedPosts,
  loading: false,
  error: null,
};

const savedSlice = createSlice({
  name: 'saved',
  initialState,
  reducers: {
    // Collection actions
    createCollectionWithPosts: (state, action: PayloadAction<{ 
      collection: Omit<SavedCollection, 'id' | 'createdAt' | 'updatedAt' | 'postsCount'>;
      selectedPostIds: string[];
    }>) => {
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
      state.posts = state.posts.map(post => 
        selectedPostIds.includes(post.id)
          ? { ...post, collectionId: newCollection.id }
          : post
      );
      
      // Update posts count for "all-posts" collection
      const allPostsCollection = state.collections.find(c => c.id === 'all-posts');
      if (allPostsCollection) {
        allPostsCollection.postsCount = Math.max(0, allPostsCollection.postsCount - selectedPostIds.length);
        allPostsCollection.updatedAt = new Date().toISOString();
      }
    },
    
    updateCollection: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<SavedCollection, 'id' | 'isDefault'>> }>) => {
      const { id, updates } = action.payload;
      const collection = state.collections.find(c => c.id === id);
      if (collection) {
        Object.assign(collection, updates);
        collection.updatedAt = new Date().toISOString();
      }
    },
    
    deleteCollection: (state, action: PayloadAction<string>) => {
      const collectionId = action.payload;
      // Don't allow deleting default collection
      if (collectionId === 'all-posts') return;
      
      state.collections = state.collections.filter(c => c.id !== collectionId);
      // Move posts from deleted collection to "all-posts"
      state.posts = state.posts.map(post => 
        post.collectionId === collectionId 
          ? { ...post, collectionId: 'all-posts' }
          : post
      );
    },
    
    // Post actions
    savePost: (state, action: PayloadAction<{ postId: string; collectionId?: string }>) => {
      const { postId, collectionId = 'all-posts' } = action.payload;
      
      // Check if already saved
      const existingPost = state.posts.find(p => p.postId === postId);
      if (existingPost) return;
      
      // Create mock post data (in real app, this would come from API)
      const mockPost: SavedPost = {
        id: `saved-${Date.now()}`,
        postId,
        collectionId,
        savedAt: new Date().toISOString(),
        post: {
          id: postId,
          userId: 'current-user',
          userName: 'me',
          userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          content: `Mock post content for ${postId}`,
          media: [{
            id: `media-${Date.now()}`,
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            alt: 'Mock saved post'
          }],
          likesCount: Math.floor(Math.random() * 1000),
          commentsCount: Math.floor(Math.random() * 100),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };
      
      state.posts.push(mockPost);
      
      // Update collection posts count
      const collection = state.collections.find(c => c.id === collectionId);
      if (collection) {
        collection.postsCount += 1;
        collection.updatedAt = new Date().toISOString();
      }
    },
    
    unsavePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const postIndex = state.posts.findIndex(p => p.postId === postId);
      
      if (postIndex !== -1) {
        const post = state.posts[postIndex];
        state.posts.splice(postIndex, 1);
        
        // Update collection posts count
        const collection = state.collections.find(c => c.id === post.collectionId);
        if (collection) {
          collection.postsCount = Math.max(0, collection.postsCount - 1);
          collection.updatedAt = new Date().toISOString();
        }
      }
    },
    
    movePostToCollection: (state, action: PayloadAction<{ postId: string; fromCollectionId: string; toCollectionId: string }>) => {
      const { postId, fromCollectionId, toCollectionId } = action.payload;
      
      const post = state.posts.find(p => p.postId === postId && p.collectionId === fromCollectionId);
      if (post) {
        post.collectionId = toCollectionId;
        
        // Update posts count for both collections
        const fromCollection = state.collections.find(c => c.id === fromCollectionId);
        const toCollection = state.collections.find(c => c.id === toCollectionId);
        
        if (fromCollection) {
          fromCollection.postsCount = Math.max(0, fromCollection.postsCount - 1);
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
