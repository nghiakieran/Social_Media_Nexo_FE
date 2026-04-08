import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  MessageSquare,
  Share2, // Giữ lại import theo ý bạn
  Flag, // Giữ lại import theo ý bạn
  Trash2,
  Image,
  Video,
  FileText,
  Loader2, // <--- THÊM ICON LOADER
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdminPostItemDTO } from "@/features/admin/types";
import {
  deletePostById,
  fetchPostById,
} from "@/features/admin/api/postManagementAPI";
import MediaSlider from "@/features/post/components/MediaSlider";

interface PostDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: AdminPostItemDTO;
  onDeleteSuccess: () => void;
}
import { useToast } from "@/components/ui/use-toast";

export function PostDetailDialog({
  open,
  onOpenChange,
  post,
  onDeleteSuccess,
}: PostDetailDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postDetails, setPostDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!post?.id) return;

      setIsLoading(true);
      setPostDetails(null);

      try {
        const data = await fetchPostById(post.id, post.type);
        setPostDetails(data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết bài viết:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchPostDetails();
    }
  }, [open, post.id, post.type]);

  const getTypeIcon = (type: string) => {
    const icons = {
      post: Image,
      reel: Video,
      story: FileText,
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeBadge = (type: string): "default" | "secondary" | "outline" => {
    const colors = {
      post: "default" as const,
      reel: "secondary" as const,
      story: "outline" as const,
    };
    return colors[type as keyof typeof colors] || "default";
  };

  const hashtags = postDetails?.caption?.match(/#[\p{L}\p{N}_]+/gu) || [];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePostById(post.id, post.type);
      toast({
        title: "Thành công",
        description: "Đã xóa bài viết khỏi hệ thống",
      });
      onOpenChange(false);
      onDeleteSuccess();
    } catch (error) {
      console.error("Xóa thất bại:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  const mediaItems = useMemo(() => {
    if (!postDetails?.mediaUrl) return [];

    if (post.type === "reel") {
      const videoUrl = postDetails.mediaUrl as string;
      return [
        {
          id: "video-main",
          type: "video" as const,
          url: videoUrl,
        },
      ];
    }

    const imageUrls = Array.isArray(postDetails.mediaUrl)
      ? postDetails.mediaUrl
      : [postDetails.mediaUrl];

    return imageUrls.map((url, index) => {
      const isVideo = url.includes(".m3u8") || url.endsWith(".mp4");

      return {
        id: `post-media-${post.id}-${index}`,
        type: isVideo ? "video" : "image",
        url: url,
        alt: `Post media ${index + 1}`,
      };
    });
  }, [postDetails?.mediaUrl, post?.type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết bài viết
            <Badge variant={getTypeBadge(post.type)}>
              {getTypeIcon(post.type)}
              <span className="ml-1 capitalize">{post.type}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* --- LOGIC CHECK LOADING & NULL --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : !postDetails ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin bài viết
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={postDetails?.avatarUrl} />
                    <AvatarFallback>
                      {postDetails?.userName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{postDetails?.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(postDetails?.createdAt)}
                    </p>
                    {postDetails?.location && (
                      <p className="text-xs text-muted-foreground">
                        📍 {postDetails.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* PHẦN BẠN COMMENT: REPORTS */}
                {/* {post.reports > 0 && (
                  <Badge variant="destructive">
                    <Flag className="w-3 h-3 mr-1" />
                    {post.reports} báo cáo
                  </Badge>
                )} */}
              </div>

              <Separator />
              {/* Content */}
              <div>
                <h4 className="font-semibold mb-2">Nội dung</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {postDetails?.caption}
                </p>
              </div>
              {/* Media */}
              {mediaItems.length > 0 && (
                <div className="rounded-lg overflow-hidden bg-black/5 border">
                  <MediaSlider
                    media={mediaItems}
                    className="w-full aspect-auto max-h-[500px]"
                  />
                </div>
              )}

              {/* PHẦN BẠN COMMENT: HASHTAGS */}
              {hashtags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Heart className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lượt thích</p>
                    <p className="text-xl font-bold">
                      {postDetails?.quantityLike || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bình luận</p>
                    <p className="text-xl font-bold">
                      {postDetails?.quantityComment || 0}
                    </p>
                  </div>
                </div>
                {/* PHẦN BẠN COMMENT: SHARE */}
                {/* <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Share2 className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chia sẻ</p>
                    <p className="text-xl font-bold">{post.shares}</p>
                  </div>
                </div> */}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                {/* PHẦN BẠN COMMENT: REPORT ACTION */}
                {/* {post.reports > 0 && (
                  <Button variant="outline" className="flex-1">
                    <Flag className="w-4 h-4 mr-2" />
                    Xem báo cáo ({post.reports})
                  </Button>
                )} */}

                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa bài viết
                  </Button>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={isDeleting}
                      onClick={handleDelete}
                    >
                      Xác nhận xóa
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
