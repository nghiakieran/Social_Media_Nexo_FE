import { useState } from "react";
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
import { Heart, MessageSquare, Share2, Flag, Trash2, Image, Video, FileText } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PostDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    author: string;
    type: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    reports: number;
    date: string;
    avatar: string;
    mediaUrl?: string;
    fullContent?: string;
    hashtags?: string[];
    location?: string;
  };
}

export function PostDetailDialog({ open, onOpenChange, post }: PostDetailDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết bài viết
            <Badge variant={getTypeBadge(post.type)}>
              {getTypeIcon(post.type)}
              <span className="ml-1">{post.type}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.avatar} />
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author}</p>
                  <p className="text-sm text-muted-foreground">{post.date}</p>
                  {post.location && (
                    <p className="text-xs text-muted-foreground">📍 {post.location}</p>
                  )}
                </div>
              </div>
              
              {post.reports > 0 && (
                <Badge variant="destructive">
                  <Flag className="w-3 h-3 mr-1" />
                  {post.reports} báo cáo
                </Badge>
              )}
            </div>

            <Separator />

            {/* Media Content */}
            {post.mediaUrl && (
              <div className="rounded-lg overflow-hidden bg-muted">
                {post.type === "reel" ? (
                  <video 
                    src={post.mediaUrl} 
                    controls 
                    className="w-full max-h-[500px] object-contain"
                  >
                    Trình duyệt không hỗ trợ video
                  </video>
                ) : (
                  <img 
                    src={post.mediaUrl} 
                    alt="Post content" 
                    className="w-full max-h-[500px] object-contain"
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div>
              <h4 className="font-semibold mb-2">Nội dung</h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {post.fullContent || post.content}
              </p>
            </div>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Heart className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Lượt thích</p>
                  <p className="text-xl font-bold">{post.likes}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Bình luận</p>
                  <p className="text-xl font-bold">{post.comments}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Share2 className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Chia sẻ</p>
                  <p className="text-xl font-bold">{post.shares}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              {post.reports > 0 && (
                <Button variant="outline" className="flex-1">
                  <Flag className="w-4 h-4 mr-2" />
                  Xem báo cáo ({post.reports})
                </Button>
              )}
              
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
                    onClick={() => {
                      // Handle delete
                      console.log("Deleting post:", post.id);
                      onOpenChange(false);
                    }}
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
      </DialogContent>
    </Dialog>
  );
}
