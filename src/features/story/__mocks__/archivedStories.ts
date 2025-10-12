import { Story } from "../types";

// Mock data for archived stories grouped by date
export interface ArchivedStoryGroup {
  id: string;
  date: string;
  day: string;
  month: string;
  year?: string;
  thumbnail: string;
  stories: Story[];
  isInHighlight?: boolean;
}

export const mockArchivedStories: ArchivedStoryGroup[] = [
  {
    id: "archive-1",
    date: "2025-04-23",
    day: "23",
    month: "Tháng 4",
    year: "2025",
    thumbnail: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=700&fit=crop",
    stories: [
      {
        id: "story-1",
        username: "nghialc81",
        profileImage: "https://i.pravatar.cc/150?img=1",
        timeAgo: "23 Tháng 4, 2025",
        isOwnStory: true,
        content: [
          {
            id: "content-1",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=700&fit=crop",
            duration: 5,
          },
          {
            id: "content-2",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&h=700&fit=crop",
            duration: 5,
          },
        ],
      },
    ],
    isInHighlight: false,
  },
  {
    id: "archive-2",
    date: "2025-02-20",
    day: "20",
    month: "Tháng 2",
    year: "2025",
    thumbnail: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=700&fit=crop",
    stories: [
      {
        id: "story-2",
        username: "nghialc81",
        profileImage: "https://i.pravatar.cc/150?img=1",
        timeAgo: "20 Tháng 2, 2025",
        isOwnStory: true,
        content: [
          {
            id: "content-3",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=700&fit=crop",
            duration: 5,
          },
        ],
      },
    ],
    isInHighlight: false,
  },
  {
    id: "archive-3",
    date: "2022-12-06",
    day: "6",
    month: "Tháng 12",
    year: "2022",
    thumbnail: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=400&h=700&fit=crop",
    stories: [
      {
        id: "story-3",
        username: "nghialc81",
        profileImage: "https://i.pravatar.cc/150?img=1",
        timeAgo: "6 Tháng 12, 2022",
        isOwnStory: true,
        content: [
          {
            id: "content-4",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=400&h=700&fit=crop",
            duration: 5,
          },
          {
            id: "content-5",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687220067-dced9a881b56?w=400&h=700&fit=crop",
            duration: 5,
          },
          {
            id: "content-6",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687220208-22d7a2543e88?w=400&h=700&fit=crop",
            duration: 5,
          },
        ],
      },
    ],
    isInHighlight: false,
  },
  {
    id: "archive-4",
    date: "2022-11-18",
    day: "18",
    month: "Tháng 11",
    year: "2022",
    thumbnail: "https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=400&h=700&fit=crop",
    stories: [
      {
        id: "story-4",
        username: "nghialc81",
        profileImage: "https://i.pravatar.cc/150?img=1",
        timeAgo: "18 Tháng 11, 2022",
        isOwnStory: true,
        content: [
          {
            id: "content-7",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=400&h=700&fit=crop",
            duration: 5,
          },
        ],
      },
    ],
    isInHighlight: true,
  },
  {
    id: "archive-5",
    date: "2022-10-15",
    day: "15",
    month: "Tháng 10",
    year: "2022",
    thumbnail: "https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&h=700&fit=crop",
    stories: [
      {
        id: "story-5",
        username: "nghialc81",
        profileImage: "https://i.pravatar.cc/150?img=1",
        timeAgo: "15 Tháng 10, 2022",
        isOwnStory: true,
        content: [
          {
            id: "content-8",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687221038-404cb8830901?w=400&h=700&fit=crop",
            duration: 5,
          },
        ],
      },
    ],
    isInHighlight: false,
  },
  {
    id: "archive-6",
    date: "2022-09-22",
    day: "22",
    month: "Tháng 9",
    year: "2022",
    thumbnail: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=700&fit=crop",
    stories: [
      {
        id: "story-6",
        username: "nghialc81",
        profileImage: "https://i.pravatar.cc/150?img=1",
        timeAgo: "22 Tháng 9, 2022",
        isOwnStory: true,
        content: [
          {
            id: "content-9",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=700&fit=crop",
            duration: 5,
          },
          {
            id: "content-10",
            type: "image",
            url: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=400&h=700&fit=crop",
            duration: 5,
          },
        ],
      },
    ],
    isInHighlight: false,
  },
];

