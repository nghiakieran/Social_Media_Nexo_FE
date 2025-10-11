import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBookmark } from "@/features/saved/hooks/useBookmark";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { navigateToProfile } from "@/utils/navigation";
import {
  ArrowLeft,
  Bookmark,
  Globe,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { getPostDetailThunk, getMutualFollowersThunk, deletePostThunk } from "../postSlice";
import { ActionMenuDialog } from "../components/ActionMenuDialog";
import { CommentSection } from "../components/CommentSection";
import { EditPostDialog } from "../components/EditPostDialog";
import { LikesDialog } from "../components/LikesDialog";
import { MediaSlider } from "../components/MediaSlider";
import { ShareDialog } from "../components/ShareDialog";
import { Loader } from "@/components/common/Loader";
import type { Post } from "../types";

// Interface for UI Post (extends API Post with additional UI properties)
interface UIPost extends Post {
  stats: {
    likes: number;
    comments: number;
  };
  interactions: {
    isLiked: boolean;
    isBookmarked: boolean;
    isShared: boolean;
  };
  taggedFriends: string[];
  privacy: 'public' | 'private';
  userName: string;
  avatarUrl: string;
}

// Mock data - replace with actual API call
const mockPost = {
  id: "1",
  userId: "1",
  userName: "nguyenvana",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
  caption: `Chào mọi người! Hôm nay mình có cơ hội được tham quan một công ty công nghệ rất thú vị. Không gian làm việc hiện đại, team trẻ trung và năng động. Đặc biệt là phòng chill với view thành phố rất đẹp! 

Các bạn có kinh nghiệm nào về việc chọn môi trường làm việc không? Mình đang cân nhắc giữa startup và công ty lớn. 🤔

#workplace #career #startup #technology`,
  media: [
    {
      id: "1",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      thumbnail:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      type: "video" as const,
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
    },
    {
      id: "3",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
      thumbnail:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
    },
    {
      id: "4",
      type: "video" as const,
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    },
  ],
  stats: {
    likes: 156,
    comments: 23,
    shares: 8,
    views: 1200,
  },
  interactions: {
    isLiked: false,
    isBookmarked: false,
    isShared: false,
  },
  taggedFriends: ["nguyenvanb", "tranthic"],
  createdAt: "2024-01-15T10:30:00Z",
  privacy: "public" as const,
};

export const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const { currentPost, isLoading, error } = useAppSelector(state => state.post);
  const { user } = useAppSelector(state => state.auth);

  const [post, setPost] = useState<UIPost | null>(null);
  const [interactions, setInteractions] = useState({
    isLiked: false,
    isBookmarked: false,
    isShared: false,
  });

  // Load post detail when component mounts
  useEffect(() => {
    if (postId && user) {
      dispatch(getPostDetailThunk(parseInt(postId)));
      dispatch(getMutualFollowersThunk({ pageNo: 0, pageSize: 10 }));
    }
  }, [dispatch, user, postId]);

  // Map currentPost to UIPost when loaded
  useEffect(() => {
    if (currentPost) {
      const uiPost: UIPost = {
        ...currentPost,
        stats: {
          likes: currentPost.likesCount,
          comments: currentPost.commentsCount,
        },
        interactions: {
          isLiked: currentPost.isLiked,
          isBookmarked: currentPost.isBookmarked,
          isShared: false,
        },
        taggedFriends: currentPost.taggedUsers.map(t => t.userName),
        privacy: currentPost.visibility,
      };
      setPost(uiPost);
      setInteractions({
        isLiked: currentPost.isLiked,
        isBookmarked: currentPost.isBookmarked,
        isShared: false,
      });
    }
  }, [currentPost]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLikesDialog, setShowLikesDialog] = useState<null | {
    targetId: string;
    targetType: "post" | "comment" | "reply";
  }>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const privacyIcons = {
    public: Globe,
    private: Lock,
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const handleLike = () => {
    setInteractions((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
    }));

    setPost((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        likes: prev.stats.likes + (interactions.isLiked ? -1 : 1),
      },
    }));
  };

  const handleBookmark = () => {
    toggleBookmark(post.id);
    setInteractions((prev) => ({
      ...prev,
      isBookmarked: !prev.isBookmarked,
    }));
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleOpenActionMenu = () => {
    setShowActionMenu(true);
  };

  const handleCloseActionMenu = () => {
    setShowActionMenu(false);
  };

  const handleActionMenuAction = async (action: string) => {
    switch (action) {
      case "delete":
        try {
          await dispatch(deletePostThunk(parseInt(post.id))).unwrap();
          toast({ title: "Đã xóa", description: "Bài viết đã được xóa." });
          navigate(-1);
        } catch (error) {
          toast({ 
            title: "Lỗi", 
            description: "Không thể xóa bài viết. Vui lòng thử lại.",
            variant: "destructive"
          });
        }
        break;
      case "edit":
        setShowEditDialog(true);
        break;
      case "hideLikes":
        toast({
          title: "Đã ẩn",
          description: "Số lượt thích đã được ẩn với những người khác.",
        });
        break;
      case "disableComments":
        toast({
          title: "Đã tắt",
          description: "Tính năng bình luận đã được tắt.",
        });
        break;
      case "aboutAccount":
        toast({
          title: "Thông tin tài khoản",
          description: "Đang hiển thị thông tin tài khoản...",
        });
        break;
      default:
        break;
    }
  };

  const handleEditPost = (files: File[], updateData: unknown) => {
    // TODO: Implement post update with API
    console.log('Edit post:', files, updateData);
    setShowEditDialog(false);
  };

  const handleSharePost = (
    postId: string,
    userIds: string[],
    message: string
  ) => {
    toast({
      title: "Đã chia sẻ",
      description: `Bài viết đã được chia sẻ với ${userIds.length} người dùng.`,
    });
    setShowShareDialog(false);
  };

  const handleOpenLikesDialog = (
    targetId: string,
    targetType: "post" | "comment" | "reply"
  ) => {
    setShowLikesDialog({ targetId, targetType });
  };

  const handleCloseLikesDialog = () => {
    setShowLikesDialog(null);
  };

  const handleProfileClick = () => {
    navigateToProfile(navigate, post.userName);
  };

  const handleTagClick = (userName: string) => {
    navigateToProfile(navigate, userName);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Show loading state
  if (isLoading) {
    return <Loader overlay />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => {
              if (postId) {
                dispatch(getPostDetailThunk(parseInt(postId)));
              }
            }}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Show not found state if post doesn't exist
  if (!post || !postId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy bài viết</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header - Mobile & Desktop */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-0 py-4">
          <div className="flex items-center justify-center relative">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="absolute left-0 h-10 w-10 p-0 rounded-full hover:bg-muted/80 hover:text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Title - Centered */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                Chi tiết bài viết
              </h1>
            </div>

            {/* Spacer for balance */}
            <div className="absolute right-0 w-10"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Post Content */}
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              {/* Author Info */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="relative cursor-pointer"
                      onClick={handleProfileClick}
                    >
                      <img
                        src={post.avatarUrl}
                        alt={post.userName}
                        className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-semibold text-foreground truncate cursor-pointer hover:underline"
                          onClick={handleProfileClick}
                        >
                          {post.userName}
                        </h3>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                          onClick={handleProfileClick}
                        >
                          @{post.userName}
                        </span>
                        <span>•</span>
                        {post.privacy === 'private' ? (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Globe className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Text */}
              {post.caption && (
                <div className="px-6 pb-4">
                  <div className="prose prose-sm max-w-none text-foreground">
                    {post.caption.split("\n").map((line, index) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Slider */}
              {post.media && post.media.length > 0 && (
                <div className="px-6 pb-4">
                  <MediaSlider
                    media={post.media.map((media) => ({
                      id: media.id,
                      type: media.type,
                      url: media.url,
                      alt: `Post media ${media.id}`,
                    }))}
                    className="max-h-max"
                  />
                </div>
              )}

              {/* Tagged Friends */}
              {post.taggedFriends && post.taggedFriends.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">với</span>
                    {post.taggedFriends.map((userName, index) => (
                      <span key={index}>
                        <span
                          className="font-medium text-primary hover:underline cursor-pointer"
                          onClick={() => handleTagClick(userName)}
                        >
                          {userName}
                        </span>
                        {index < post.taggedFriends.length - 1 && (
                          <span className="text-muted-foreground">, </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full transition-colors",
                        interactions.isLiked
                          ? "text-red-500 hover:text-red-600"
                          : "hover:text-red-500"
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-5 h-5",
                          interactions.isLiked && "fill-current"
                        )}
                      />
                      <span className="hidden sm:inline">Thích</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-2 rounded-full hover:text-primary"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="hidden sm:inline">Bình luận</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-2 px-3 py-2 rounded-full hover:text-green-500"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="hidden sm:inline">Chia sẻ</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBookmark}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full transition-colors",
                        isBookmarked(post.id) || interactions.isBookmarked
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "hover:text-yellow-500"
                      )}
                    >
                      <Bookmark
                        className={cn(
                          "w-5 h-5",
                          (isBookmarked(post.id) ||
                            interactions.isBookmarked) &&
                            "fill-current"
                        )}
                      />
                      <span className="hidden sm:inline">Lưu</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleOpenActionMenu}
                      className="flex items-center gap-2 px-3 py-2 rounded-full hover:text-gray-600"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Likes summary */}
                {post.stats.likes > 0 && (
                  <div className="mt-3 text-sm">
                    <button
                      type="button"
                      onClick={() => handleOpenLikesDialog(post.id, "post")}
                      className="font-medium hover:underline"
                    >
                      {post.stats.likes} lượt thích
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentSection postId={postId!} />
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        post={{
          id: post.id,
          content: post.caption,
          media: post.media || [],
          userName: post.userName,
          avatarUrl: post.avatarUrl,
          createdAt: post.createdAt,
        }}
        onShare={handleSharePost}
      />

      {/* Likes Dialog */}
      <LikesDialog
        isOpen={!!showLikesDialog}
        onClose={handleCloseLikesDialog}
        title={
          showLikesDialog?.targetType === "post"
            ? "Lượt thích"
            : "Lượt thích bình luận"
        }
      />

      {/* Action Menu Dialog */}
      <ActionMenuDialog
        isOpen={showActionMenu}
        onClose={handleCloseActionMenu}
        onAction={handleActionMenuAction}
      />

      {/* Edit Post Dialog */}
      <EditPostDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        postId={parseInt(post.id)}
        userId={parseInt(post.userId)}
        initialContent={post.caption}
        initialVisibility={post.privacy.toUpperCase() as 'PUBLIC' | 'PRIVATE'}
        initialMediaUrl={post.media.map(m => m.url)}
        onSave={handleEditPost}
      />
    </div>
  );
};
