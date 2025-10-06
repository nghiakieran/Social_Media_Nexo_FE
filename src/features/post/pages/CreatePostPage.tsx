import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostComposer } from "../components/PostComposer";

export const CreatePostPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (postData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Đăng bài thành công!",
        description: "Bài viết của bạn đã được đăng.",
      });

      // Navigate back to feed
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="h-10 w-10 p-0 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Tạo bài viết mới
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Chia sẻ khoảnh khắc của bạn với mọi người
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <PostComposer onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-border/50">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-background border-t-transparent"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold mb-1">
                  Đang đăng bài viết...
                </p>
                <p className="text-sm text-muted-foreground">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
