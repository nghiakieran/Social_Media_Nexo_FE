import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Trash2, AlertTriangle, Eye, Heart, MessageSquare, 
  User, FileText, Clock, Flag
} from "lucide-react";

interface CommentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: {
    id: string;
    author: string;
    avatar: string;
    content: string;
    post: string;
    postAuthor?: string;
    likes: number;
    replies: number;
    reports: number;
    date: string;
    status?: string;
    reportReasons?: string[];
  };
}

export function CommentDetailDialog({ open, onOpenChange, comment }: CommentDetailDialogProps) {
  const mockReplies = [
    {
      id: "1",
      author: "User Reply 1",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=reply1",
      content: "Đồng ý với bạn!",
      likes: 5,
      date: "2024-01-14 15:30",
    },
    {
      id: "2",
      author: "User Reply 2",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=reply2",
      content: "Cảm ơn bạn đã chia sẻ",
      likes: 3,
      date: "2024-01-14 16:00",
    },
  ];

  const mockReportDetails = [
    {
      reporter: "User Report 1",
      reason: "Spam",
      detail: "Bình luận lặp đi lặp lại nhiều lần",
      date: "2024-01-14 14:00",
    },
    {
      reporter: "User Report 2",
      reason: "Ngôn từ không phù hợp",
      detail: "Sử dụng từ ngữ thô tục",
      date: "2024-01-14 14:30",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết bình luận
            {comment.reports > 0 && (
              <Badge variant="destructive" className="ml-2">
                {comment.reports} báo cáo
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Comment Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.author}</span>
                      {comment.status && (
                        <Badge variant={comment.status === "flagged" ? "destructive" : "secondary"}>
                          {comment.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Clock className="w-3 h-3" />
                      {comment.date}
                    </div>
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {comment.likes} lượt thích
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> {comment.replies} phản hồi
                      </span>
                      {comment.reports > 0 && (
                        <span className="flex items-center gap-1 text-destructive">
                          <Flag className="w-4 h-4" /> {comment.reports} báo cáo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Post Context */}
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Bài viết gốc:
                  </p>
                  <div className="pl-6">
                    <p className="text-sm text-muted-foreground">{comment.post}</p>
                    {comment.postAuthor && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tác giả: {comment.postAuthor}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replies */}
            {comment.replies > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Phản hồi ({mockReplies.length})
                </h4>
                <div className="space-y-3">
                  {mockReplies.map((reply) => (
                    <Card key={reply.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={reply.avatar} />
                            <AvatarFallback>{reply.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{reply.author}</span>
                              <span className="text-xs text-muted-foreground">{reply.date}</span>
                            </div>
                            <p className="text-sm">{reply.content}</p>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                              <Heart className="w-3 h-3" /> {reply.likes}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Report Details */}
            {comment.reports > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Chi tiết báo cáo ({mockReportDetails.length})
                </h4>
                <div className="space-y-3">
                  {mockReportDetails.map((report, index) => (
                    <Card key={index} className="border-destructive/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {report.reporter}
                            </p>
                            <Badge variant="destructive" className="mt-1">
                              {report.reason}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{report.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{report.detail}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Xem bài viết
              </Button>
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                Xem profile
              </Button>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa bình luận
              </Button>
            </div>

            {comment.reports > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="default" className="bg-success hover:bg-success/90">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Giữ bình luận
                </Button>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa & Cảnh cáo
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
