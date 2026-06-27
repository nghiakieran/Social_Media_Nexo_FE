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
  Share2,
  Flag,
  Trash2,
  Image as ImageIcon,
  Video,
  FileText,
  Loader2,
  AlertOctagon,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdminPostItemDTO } from "@/features/admin/types";
import {
  deletePostById,
  fetchPostById,
} from "@/features/admin/api/postManagementAPI";
import MediaSlider from "@/features/post/components/MediaSlider";
import { useToast } from "@/components/ui/use-toast";

interface PostDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: AdminPostItemDTO;
  onDeleteSuccess: () => void;
}

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
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchPostDetails();
      setShowDeleteConfirm(false);
    }
  }, [open, post.id, post.type]);

  const getTypeIcon = (type: string) => {
    const icons = {
      post: ImageIcon,
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
        variant: "success",
        title: "Thành công",
        description: "Đã xóa bài viết khỏi hệ thống",
      });
      onOpenChange(false);
      onDeleteSuccess();
    } catch (error) {
      console.error(error);
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
      const isVideo = url.includes(".mp4") || url.includes(".m3u8") || url.includes("/video/");
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
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border border-border/50 bg-card text-card-foreground shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 border-b border-border/50 bg-muted/30">
          <DialogTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-3">
              Chi tiết bài viết
              <Badge variant={getTypeBadge(post.type)} className="shadow-sm">
                {getTypeIcon(post.type)}
                <span className="ml-1 capitalize">{post.type}</span>
              </Badge>
              <Badge
                variant="outline"
                className="font-mono text-xs text-muted-foreground"
              >
                ID: {post.id}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">
              Đang tải dữ liệu bài viết...
            </p>
          </div>
        ) : !postDetails ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <AlertOctagon className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-muted-foreground font-medium">
              Không tìm thấy thông tin bài viết hoặc đã bị xóa
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-85px)]">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border border-border/50 shadow-sm">
                    <AvatarImage src={postDetails?.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {postDetails?.userName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg leading-tight text-foreground">
                      {postDetails?.userName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      {formatDate(postDetails?.createdAt)}
                      {postDetails?.location && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                          📍 {postDetails.location}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {postDetails.reports > 0 && (
                  <Badge
                    variant="destructive"
                    className="px-3 py-1 text-sm shadow-sm"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {postDetails.reports} báo cáo vi phạm
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                  {postDetails?.caption || (
                    <span className="italic text-muted-foreground">
                      Không có nội dung văn bản.
                    </span>
                  )}
                </p>

                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {hashtags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {mediaItems.length > 0 && (
                <div className="rounded-xl overflow-hidden bg-muted/30 border border-border/50 shadow-inner">
                  <MediaSlider
                    media={mediaItems}
                    className="w-full aspect-auto max-h-[500px]"
                  />
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50">
                  <Heart className="w-6 h-6 text-rose-500 mb-2" />
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {postDetails?.quantityLike || 0}
                  </p>
                  <p className="text-xs font-medium text-rose-500 uppercase tracking-wider mt-1">
                    Lượt thích
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50">
                  <MessageSquare className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {postDetails?.quantityComment || 0}
                  </p>
                  <p className="text-xs font-medium text-blue-500 uppercase tracking-wider mt-1">
                    Bình luận
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                  <Share2 className="w-6 h-6 text-emerald-500 mb-2" />
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {postDetails?.quantityShare || 0}
                  </p>
                  <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mt-1">
                    Chia sẻ
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                {postDetails.reports > 0 && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-700"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Xem chi tiết báo cáo
                  </Button>
                )}

                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa bài viết vi phạm
                  </Button>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <Button
                      variant="destructive"
                      className="flex-1 shadow-md"
                      disabled={isDeleting}
                      onClick={handleDelete}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Xác nhận xóa ngay
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Đóng
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
