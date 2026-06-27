import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { createPostThunk, getMutualFollowersThunk } from "../postSlice";
import { PostComposer } from "../components/PostComposer";
import { CreatePostRequest } from "../types";
const FEED_SYNC_DELAY_MS = 1000;

// Interface for UI form data
interface CreatePostFormData {
  content: string;
  privacy: "public" | "private";
  taggedUsers: number[];
  media: File[];
}

export const CreatePostPage = () => {
  const dispatch = useAppDispatch();
  const { isCreating, error } = useAppSelector((state) => state.post);
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [isSyncingFeed, setIsSyncingFeed] = useState(false);
  const syncCancelledRef = useRef(false);

  useEffect(() => {
    syncCancelledRef.current = false;
    return () => {
      syncCancelledRef.current = true;
    };
  }, []);

  const handleSubmit = async (postData: CreatePostFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Bạn cần đăng nhập để tạo bài viết.",
      });
      navigate("/login");
      return;
    }

    try {
      // Map UI data to API format
      const createPostRequest = {
        postId: 0,
        userId: user.id,
        caption: postData.content,
        visibility: postData.privacy.toUpperCase() as "PUBLIC" | "PRIVATE",
        tag: postData.taggedUsers.join(","),
      };

      const files = postData.media || [];

      // Check file size and type for better message
      const hasVideo = files.some((file) => file.type.startsWith("video/"));
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const sizeMB = totalSize / (1024 * 1024);

      // Set appropriate message based on content
      if (hasVideo && sizeMB > 50) {
        setUploadMessage(
          "📹 Đang đăng bài viết... Video lớn có thể mất vài phút"
        );
      } else if (hasVideo || sizeMB > 10) {
        setUploadMessage("📤 Đang đăng bài viết... Vui lòng chờ");
      } else {
        setUploadMessage("⏳ Đang đăng bài viết...");
      }

      await dispatch(
        createPostThunk({ files, postData: createPostRequest })
      ).unwrap();

      toast({
        variant: "success",
        title: "Đăng bài thành công!",
        description: "Bài viết của bạn đã được đăng.",
      });

      setUploadMessage(
        "Đang đồng bộ với bảng tin",
      );
      setIsSyncingFeed(true);
      await new Promise<void>((resolve) =>
        setTimeout(resolve, FEED_SYNC_DELAY_MS),
      );

      if (syncCancelledRef.current) {
        setUploadMessage("");
        setIsSyncingFeed(false);
        return;
      }

      navigate("/");
    } catch (error) {
      console.error("Create post error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể đăng bài. Vui lòng thử lại.",
      });
      setUploadMessage("");
      setIsSyncingFeed(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-5 sm:mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between relative min-h-[56px] w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="absolute left-0 h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full transition-colors z-10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 flex flex-col items-center text-center px-10">
                <div className="flex items-center gap-2 mb-1.5 justify-center">
                  <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex-shrink-0">
                    <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Tạo bài viết mới
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Chia sẻ khoảnh khắc của bạn với mọi người
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <PostComposer
              onSubmit={handleSubmit}
              isLoading={isCreating || isSyncingFeed}
            />
          </div>
        </div>

        {/* Loading Overlay with Upload Message */}
        {(isCreating || isSyncingFeed) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full mx-auto">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full"></div>
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-lg sm:text-xl font-bold text-foreground">
                    {uploadMessage || "Đang đăng bài..."}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Vui lòng không tắt trang này
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
