export interface StoryContent {
  id: string
  type: "image" | "video"
  url: string
  duration: number
}

export interface Story {
  id: string
  username: string
  profileImage: string
  isVerified?: boolean
  timeAgo: string
  content: StoryContent[]
  isViewed?: boolean
  isOwnStory?: boolean
  viewerCount?: number
}

export interface StoryViewerProps {
  isOpen: boolean
  onClose: () => void
  stories: Story[]
  initialStoryIndex: number
  initialContentIndex?: number
}
