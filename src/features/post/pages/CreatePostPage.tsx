import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { createPostThunk, getMutualFollowersThunk } from "../postSlice";
import { PostComposer } from "../components/PostComposer";
import { CreatePostRequest } from "../types";
import { Loader } from "@/components/common/Loader";

// Interface for UI form data
interface CreatePostFormData {
  content: string;
  privacy: 'public' | 'private';
  taggedUsers: number[];
  media: File[];
}


export const CreatePostPage = () => {
  const dispatch = useAppDispatch();
  const { isCreating, error } = useAppSelector(state => state.post);
  const { user } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (postData: CreatePostFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Bạn cần đăng nhập để tạo bài viết.",
      });
      navigate('/login');
      return;
    }

    try {
      // Map UI data to API format
      const createPostRequest = {
        postId: 0,
        userId: user.id,
        caption: postData.content,
        visibility: postData.privacy.toUpperCase() as 'PUBLIC' | 'PRIVATE',
        tag: postData.taggedUsers.join(','),
      };

      const files = postData.media || [];

      await dispatch(createPostThunk({ files, postData: createPostRequest })).unwrap();

      toast({
        title: "Đăng bài thành công!",
        description: "Bài viết của bạn đã được đăng.",
      });

      // Navigate back to feed
      navigate("/");
    } catch (error) {
      console.error('Create post error:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể đăng bài. Vui lòng thử lại.",
      });
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
            <PostComposer onSubmit={handleSubmit} isLoading={isCreating} />
          </div>
        </div>

        {/* Loading Overlay */}
        {isCreating && <Loader overlay />}
      </div>
    </div>
  );
};
