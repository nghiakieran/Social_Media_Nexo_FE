import { SavedCollection } from '../types';

export const mockCollections: SavedCollection[] = [
  {
    id: 'all-posts',
    name: 'Tất cả bài viết',
    description: 'Tất cả bài viết bạn đã lưu',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    postsCount: 12,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    isDefault: true,
  },
  {
    id: 'haha',
    name: 'HAHA',
    description: 'Những bài viết vui nhộn',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    postsCount: 3,
    createdAt: '2024-01-10T15:20:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 'a',
    name: 'A',
    description: 'Bộ sưu tập A',
    coverImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    postsCount: 1,
    createdAt: '2024-01-12T12:00:00Z',
    updatedAt: '2024-01-12T12:00:00Z',
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Công nghệ và lập trình',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
    postsCount: 5,
    createdAt: '2024-01-05T08:30:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
  },
  {
    id: 'food',
    name: 'Food',
    description: 'Ẩm thực và đồ ăn ngon',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
    postsCount: 8,
    createdAt: '2024-01-08T14:20:00Z',
    updatedAt: '2024-01-15T11:10:00Z',
  },
];


