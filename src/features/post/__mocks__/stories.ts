export interface StoryData {
  id: string
  username: string
  profileImage: string
  hasNewStory: boolean
  isViewed: boolean
  isVerified?: boolean
  timeAgo: string
  isOwnStory?: boolean
  viewerCount?: number
  content: Array<{
    id: string
    type: "image" | "video"
    url: string
    duration: number
  }>
}

export const mockStoriesData: StoryData[] = [
  {
    id: "story_1",
    username: "nghialc81",
    profileImage: "https://picsum.photos/80/80?random=1",
    hasNewStory: true,
    isViewed: false,
    isVerified: true,
    timeAgo: "2h",
    isOwnStory: false,
    viewerCount: 0,
    content: [
      {
        id: "content_1_1",
        type: "image",
        url: "https://picsum.photos/400/700?random=11",
        duration: 5
      },
      {
        id: "content_1_2",
        type: "image", 
        url: "https://picsum.photos/400/700?random=12",
        duration: 3
      }
    ]
  },
  {
    id: "story_2",
    username: "zikiu_",
    profileImage: "https://picsum.photos/80/80?random=2",
    hasNewStory: true,
    isViewed: false,
    timeAgo: "4h",
    isOwnStory: false,
    viewerCount: 0,
    content: [
      {
        id: "content_2_1",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4",
        duration: 8
      }
    ]
  },
  {
    id: "story_3",
    username: "dd_phuongg",
    profileImage: "https://picsum.photos/80/80?random=3",
    hasNewStory: true,
    isViewed: true,
    timeAgo: "6h",
    isOwnStory: true,
    viewerCount: 42,
    content: [
      {
        id: "content_3_1",
        type: "image",
        url: "https://picsum.photos/400/700?random=31",
        duration: 4
      },
      {
        id: "content_3_2",
        type: "image",
        url: "https://picsum.photos/400/700?random=32",
        duration: 6
      },
      {
        id: "content_3_3",
        type: "image",
        url: "https://picsum.photos/400/700?random=33",
        duration: 3
      }
    ]
  },
  {
    id: "story_4",
    username: "treasure_inocean",
    profileImage: "https://picsum.photos/80/80?random=4",
    hasNewStory: false,
    isViewed: true,
    timeAgo: "1d",
    isOwnStory: false,
    viewerCount: 0,
    content: [
      {
        id: "content_4_1",
        type: "image",
        url: "https://picsum.photos/400/700?random=41",
        duration: 5
      }
    ]
  },
  {
    id: "story_5",
    username: "att.w.ig",
    profileImage: "https://picsum.photos/80/80?random=5",
    hasNewStory: true,
    isViewed: false,
    timeAgo: "3h",
    isOwnStory: false,
    viewerCount: 0,
    content: [
      {
        id: "content_5_1",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4",
        duration: 7
      },
      {
        id: "content_5_2",
        type: "image",
        url: "https://picsum.photos/400/700?random=51",
        duration: 4
      }
    ]
  },
  {
    id: "story_6",
    username: "nn_mai0110",
    profileImage: "https://picsum.photos/80/80?random=6",
    hasNewStory: true,
    isViewed: false,
    timeAgo: "5h",
    isOwnStory: false,
    viewerCount: 0,
    content: [
      {
        id: "content_6_1",
        type: "image",
        url: "https://picsum.photos/400/700?random=61",
        duration: 6
      }
    ]
  },
  {
    id: "story_7",
    username: "sponsored_ad",
    profileImage: "https://picsum.photos/80/80?random=7",
    hasNewStory: true,
    isViewed: false,
    timeAgo: "Sponsored",
    isOwnStory: false,
    viewerCount: 0,
    content: [
      {
        id: "content_7_1",
        type: "image",
        url: "https://picsum.photos/400/700?random=71",
        duration: 5
      }
    ]
  }
]

// Simple stories data for Stories component
export const mockStories = mockStoriesData.map(story => ({
  id: story.id,
  username: story.username,
  profileImage: story.profileImage,
  hasNewStory: story.hasNewStory,
  isViewed: story.isViewed,
  isOwnStory: story.isOwnStory
}))

