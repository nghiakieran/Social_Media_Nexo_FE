import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isFollowing: boolean;
  isFollowingYou: boolean;
  mutualFriends: number;
  isCloseFriend: boolean;
  isBlocked: boolean;
  isVerified?: boolean;
  bio?: string;
}

export interface FriendRequest {
  id: string;
  user: User;
  timestamp: string;
  message?: string;
}

interface FriendState {
  friends: User[];
  suggestedUsers: User[];
  friendRequests: FriendRequest[];
  blockedUsers: User[];
  closeFriends: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FriendState = {
  friends: [],
  suggestedUsers: [],
  friendRequests: [],
  blockedUsers: [],
  closeFriends: [],
  isLoading: false,
  error: null,
};

const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFriends: (state, action: PayloadAction<User[]>) => {
      state.friends = action.payload;
    },
    setSuggestedUsers: (state, action: PayloadAction<User[]>) => {
      state.suggestedUsers = action.payload;
    },
    setFriendRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.friendRequests = action.payload;
    },
    followUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      
      // Update in suggested users
      const suggestedUser = state.suggestedUsers.find(user => user.id === userId);
      if (suggestedUser) {
        suggestedUser.isFollowing = true;
      }
      
      // Update in friends
      const friend = state.friends.find(user => user.id === userId);
      if (friend) {
        friend.isFollowing = true;
      }
    },
    unfollowUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      
      // Update in suggested users
      const suggestedUser = state.suggestedUsers.find(user => user.id === userId);
      if (suggestedUser) {
        suggestedUser.isFollowing = false;
      }
      
      // Update in friends
      const friend = state.friends.find(user => user.id === userId);
      if (friend) {
        friend.isFollowing = false;
      }
    },
    acceptFriendRequest: (state, action: PayloadAction<string>) => {
      const requestId = action.payload;
      const request = state.friendRequests.find(req => req.id === requestId);
      if (request) {
        // Move to friends
        state.friends.push({
          ...request.user,
          isFollowing: true,
          isFollowingYou: true,
        });
        // Remove from requests
        state.friendRequests = state.friendRequests.filter(req => req.id !== requestId);
      }
    },
    declineFriendRequest: (state, action: PayloadAction<string>) => {
      const requestId = action.payload;
      state.friendRequests = state.friendRequests.filter(req => req.id !== requestId);
    },
    blockUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      
      // Find user in any list
      let userToBlock: User | undefined;
      
      userToBlock = state.friends.find(user => user.id === userId);
      if (userToBlock) {
        state.friends = state.friends.filter(user => user.id !== userId);
      }
      
      if (!userToBlock) {
        userToBlock = state.suggestedUsers.find(user => user.id === userId);
        if (userToBlock) {
          state.suggestedUsers = state.suggestedUsers.filter(user => user.id !== userId);
        }
      }
      
      if (userToBlock) {
        state.blockedUsers.push({
          ...userToBlock,
          isBlocked: true,
          isFollowing: false,
          isFollowingYou: false,
        });
      }
    },
    unblockUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.blockedUsers = state.blockedUsers.filter(user => user.id !== userId);
    },
    toggleCloseFriend: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const friend = state.friends.find(user => user.id === userId);
      if (friend) {
        friend.isCloseFriend = !friend.isCloseFriend;
        
        if (friend.isCloseFriend) {
          // Add to close friends if not already there
          if (!state.closeFriends.find(user => user.id === userId)) {
            state.closeFriends.push(friend);
          }
        } else {
          // Remove from close friends
          state.closeFriends = state.closeFriends.filter(user => user.id !== userId);
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setFriends,
  setSuggestedUsers,
  setFriendRequests,
  followUser,
  unfollowUser,
  acceptFriendRequest,
  declineFriendRequest,
  blockUser,
  unblockUser,
  toggleCloseFriend,
} = friendSlice.actions;

export default friendSlice.reducer;