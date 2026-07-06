import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { StoryViewer } from "../components/StoryViewer";
import { transformUserStoriesToStory } from "../types";
import type { Story, UserStoriesData } from "../types";
import { useAppSelector } from "@/store";
import { Loader } from "@/components/common/Loader";

export const StoryDetailPage = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoryDetail = async () => {
      if (!storyId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/posts/story/view-detail/${storyId}`);
        const apiData = res.data.data;

        if (!apiData) {
          throw new Error("Không tìm thấy thông tin tin này.");
        }

        let transformedStory: Story;

        if (apiData.storyList) {
          transformedStory = transformUserStoriesToStory(apiData, currentUser?.id);
        } else if (apiData.storyId) {
          const mockUserStories: UserStoriesData = {
            userId: apiData.userId || 0,
            userName: apiData.userName || apiData.username || "Unknown",
            avatarUrl: apiData.avatarUrl || "/placeholder.svg",
            storyList: [apiData]
          };
          transformedStory = transformUserStoriesToStory(mockUserStories, currentUser?.id);
        } else {
          transformedStory = apiData;
        }

        if (transformedStory && transformedStory.content) {
          transformedStory.content = transformedStory.content.filter(
            (item) => item.id === storyId
          );
        }

        setStory(transformedStory);
      } catch (err: any) {
        console.error("Error fetching story detail:", err);
        setError(err.message || "Không thể tải chi tiết story.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoryDetail();
  }, [storyId, currentUser?.id]);

  const handleClose = () => {
    navigate("/", { replace: true });
  };

  const handleLikeChange = (storyId: string, contentId: string, isLiked: boolean) => {
    setStory((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        content: prev.content.map((item) =>
          item.id === contentId ? { ...item, isLike: isLiked } : item
        ),
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !story || !story.content || story.content.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <p className="text-lg font-medium mb-4">{error || "Tin này không tồn tại hoặc đã hết hạn."}</p>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <StoryViewer
        isOpen={true}
        onClose={handleClose}
        stories={[story]}
        initialStoryIndex={0}
        onLikeChange={handleLikeChange}
      />
    </div>
  );
};
