import { UserProfile, FollowerUser, FollowingUser, FollowRequestUser } from '../types';

export const mockUsers: UserProfile[] = [
  {
    id: 'user1',
    username: 'nghialc81',
    name: 'Lê Chí Nghĩa',
    avatar: 'https://picsum.photos/150/150?random=1',
    bio: 'Bình yên 🌸\nlocket.cam/nghialc',
    isPrivate: false,
    postsCount: 1,
    followersCount: 40,
    followingCount: 36,
    isFollowing: false,
    isFollowedBy: false,
    isBlocked: false,
    isMuted: false,
    hasRequestedFollow: false,
  },
  {
    id: 'user2',
    username: 'motchutnhi',
    name: 'motchutnhi',
    avatar: 'https://picsum.photos/150/150?random=2',
    bio: 'Creative soul ✨\nPhotographer & Designer',
    isPrivate: false,
    postsCount: 127,
    followersCount: 1200,
    followingCount: 456,
  isFollowing: true,
  isFollowedBy: true,
  isBlocked: false,
  isMuted: false,
  hasRequestedFollow: false,
  },
  {
    id: 'user3',
    username: 'nguyentroang_',
    name: 'Nguyễn Trọng Hoàng',
    avatar: 'https://picsum.photos/150/150?random=3',
    bio: 'Travel enthusiast 🌍\nLife is an adventure',
    isPrivate: true,
    postsCount: 89,
    followersCount: 567,
    followingCount: 234,
    isFollowing: false,
    isFollowedBy: false,
    isBlocked: false,
    isMuted: false,
    hasRequestedFollow: false,
  },
  {
    id: 'user4',
    username: '_ahn.dzy_',
    name: 'Anh Duy',
    avatar: 'https://picsum.photos/150/150?random=4',
    bio: 'Coffee lover ☕\nMinimalist lifestyle',
    isPrivate: false,
    postsCount: 45,
    followersCount: 234,
    followingCount: 123,
  isFollowing: true,
  isFollowedBy: false,
  isBlocked: false,
  isMuted: false,
  hasRequestedFollow: false,
  },
  {
    id: 'user5',
    username: 'bao5',
    name: 'Bảo',
    avatar: 'https://picsum.photos/150/150?random=5',
    bio: 'Music producer 🎵\nBeat maker',
    isPrivate: false,
    postsCount: 67,
    followersCount: 789,
    followingCount: 345,
  isFollowing: false,
  isFollowedBy: true,
  isBlocked: false,
  isMuted: false,
  hasRequestedFollow: false,
  },
  {
    id: 'user6',
    username: 'huy.khn',
    name: 'Nguyễn Huy Khang',
    avatar: 'https://picsum.photos/150/150?random=6',
    bio: 'Fitness enthusiast 💪\nHealthy living advocate',
    isPrivate: false,
    postsCount: 156,
    followersCount: 2300,
    followingCount: 678,
  isFollowing: true,
  isFollowedBy: true,
  isBlocked: false,
  isMuted: false,
  hasRequestedFollow: false,
  },
];

// Mock data for followers
export const mockFollowers: FollowerUser[] = [
  {
    userId: 1,
    userName: 'nghialc81',
    fullName: 'Nghia Le',
    avatar: 'https://picsum.photos/150/150?random=1',
    closeFriend: false,
    isFollowing: true, // Current user is following this follower
    isPrivate: false,
  },
  {
    userId: 2,
    userName: 'motchutnhi',
    fullName: 'Minh Thu',
    avatar: 'https://picsum.photos/150/150?random=2',
    closeFriend: true,
    isFollowing: false, // Current user is not following this follower
    isPrivate: true, // Private account
  },
  {
    userId: 3,
    userName: 'creative_mind',
    fullName: 'Creative Mind',
    avatar: 'https://picsum.photos/150/150?random=3',
    closeFriend: false,
    isFollowing: true, // Current user is following this follower
    isPrivate: false,
  },
  {
    userId: 4,
    userName: 'art_lover',
    fullName: 'Art Lover',
    avatar: 'https://picsum.photos/150/150?random=4',
    closeFriend: false,
    isFollowing: false, // Current user is not following this follower
    isPrivate: true, // Private account
  },
  {
    userId: 5,
    userName: 'photo_enthusiast',
    fullName: 'Photo Enthusiast',
    avatar: 'https://picsum.photos/150/150?random=5',
    closeFriend: true,
    isFollowing: true, // Current user is following this follower
    isPrivate: false,
  },
];

// Mock data for following
export const mockFollowing: FollowingUser[] = [
  {
    userId: 6,
    userName: 'design_wizard',
    fullName: 'Design Wizard',
    avatar: 'https://picsum.photos/150/150?random=6',
    closeFriend: false,
    isFollowing: true, // Always true for following users
    isPrivate: false,
  },
  {
    userId: 7,
    userName: 'travel_bug',
    fullName: 'Travel Bug',
    avatar: 'https://picsum.photos/150/150?random=7',
    closeFriend: true,
    isFollowing: true, // Always true for following users
    isPrivate: true, // Private account
  },
  {
    userId: 8,
    userName: 'music_soul',
    fullName: 'Music Soul',
    avatar: 'https://picsum.photos/150/150?random=8',
    closeFriend: false,
    isFollowing: true, // Always true for following users
    isPrivate: false,
  },
  {
    userId: 9,
    userName: 'food_explorer',
    fullName: 'Food Explorer',
    avatar: 'https://picsum.photos/150/150?random=9',
    closeFriend: false,
    isFollowing: true, // Always true for following users
    isPrivate: true, // Private account
  },
  {
    userId: 10,
    userName: 'fitness_guru',
    fullName: 'Fitness Guru',
    avatar: 'https://picsum.photos/150/150?random=10',
    closeFriend: true,
    isFollowing: true, // Always true for following users
    isPrivate: false,
  },
];

export const mockCurrentUser: UserProfile = {
  id: 'current',
  username: 'nghialc81',
  name: 'Lê Chí Nghĩa',
  avatar: 'https://picsum.photos/150/150?random=current',
  bio: 'Bình yên 🌸\nlocket.cam/nghialc',
  isPrivate: false,
  postsCount: 1,
  followersCount: 40,
  followingCount: 36,
  isFollowing: false,
  isFollowedBy: false,
  isBlocked: false,
  isMuted: false,
  hasRequestedFollow: false,
};

export const mockFollowRequests: FollowRequestUser[] = [
  { userId: 11, userName: 'new_user_1', avatar: 'https://picsum.photos/150/150?random=11', requestedAt: '2024-01-15T10:30:00Z' },
  { userId: 12, userName: 'new_user_2', avatar: 'https://picsum.photos/150/150?random=12', requestedAt: '2024-01-14T15:45:00Z' },
  { userId: 13, userName: 'new_user_3', avatar: 'https://picsum.photos/150/150?random=13', requestedAt: '2024-01-13T09:20:00Z' },
  { userId: 14, userName: 'new_user_4', avatar: 'https://picsum.photos/150/150?random=14', requestedAt: '2024-01-12T14:10:00Z' },
  { userId: 15, userName: 'new_user_5', avatar: 'https://picsum.photos/150/150?random=15', requestedAt: '2024-01-11T11:55:00Z' },
];