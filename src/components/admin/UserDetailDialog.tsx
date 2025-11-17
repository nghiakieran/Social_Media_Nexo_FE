import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, Mail, Calendar, MapPin, Shield, AlertTriangle, 
  FileText, MessageSquare, Heart, Share2, Lock, Unlock 
} from "lucide-react";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    status: string;
    joinDate: string;
    bio?: string;
    location?: string;
    posts: number;
    comments: number;
    likes: number;
    violations: number;
    followers?: number;
    following?: number;
    lastActive?: string;
    activity?: { date: string; action: string; detail: string }[];
    recentPosts?: { id: number; content: string; likes: number; comments: number; date: string }[];
    violationsData?: { date: string; type: string; detail: string; status: string }[];
  };
}

export function UserDetailDialog({ open, onOpenChange, user }: UserDetailDialogProps) {
  const getStatusBadge = (status?: string) => {
    const variants = {
      active: "success" as const,
      locked: "destructive" as const,
      pending: "warning" as const,
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  const getRoleBadge = (role?: string) => {
    const variants = {
      admin: "default" as const,
      moderator: "secondary" as const,
      user: "outline" as const,
    };
    return variants[role as keyof typeof variants] || "outline";
  };

  // fallback mock data nếu user không có activity/posts/violations
  const activityData = user?.activity ?? [
    { date: "2024-01-15", action: "Đăng bài viết", detail: "Chia sẻ ảnh du lịch Đà Lạt" },
    { date: "2024-01-14", action: "Bình luận", detail: "Bình luận trên bài viết của @user123" },
  ];

  const violationsData = user?.violationsData ?? [
    { date: "2024-01-10", type: "Spam", detail: "Đăng liên tục nhiều bài", status: "Đã xử lý" },
  ];

  const recentPosts = user?.recentPosts ?? [
    { id: 1, content: "Amazing sunset at Da Lat! 🌅", likes: 234, comments: 12, date: "2024-01-15" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <DialogTitle className="text-lg font-semibold">{user?.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getRoleBadge(user?.role)}>{user?.role}</Badge>
              <Badge variant={getStatusBadge(user?.status)}>{user?.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="max-h-[calc(70vh-120px)]">
          <div className="space-y-6 pr-4">

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Bài viết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{user?.posts ?? 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    Bình luận
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{user?.comments ?? 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4 text-destructive" />
                    Lượt thích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{user?.likes ?? 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Vi phạm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-warning">{user?.violations ?? 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Ngày tham gia:</span>
                  <span>{user?.joinDate}</span>
                </div>
                {user?.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Vị trí:</span>
                    <span>{user.location}</span>
                  </div>
                )}
                {user?.lastActive && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Hoạt động gần nhất:</span>
                    <span>{user.lastActive}</span>
                  </div>
                )}
                {user?.bio && (
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-1">Tiểu sử:</p>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 pt-2">
                  <div className="text-sm">
                    <span className="font-bold">{user?.followers ?? 0}</span>
                    <span className="text-muted-foreground ml-1">Người theo dõi</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">{user?.following ?? 0}</span>
                    <span className="text-muted-foreground ml-1">Đang theo dõi</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">Hoạt động</TabsTrigger>
                <TabsTrigger value="violations">Vi phạm</TabsTrigger>
                <TabsTrigger value="posts">Bài viết gần đây</TabsTrigger>
              </TabsList>

              {/* Activity */}
              <TabsContent value="activity" className="space-y-3 mt-4">
                {activityData.map((act, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex justify-between">
                      <div>
                        <p className="font-medium text-sm">{act.action}</p>
                        <p className="text-sm text-muted-foreground">{act.detail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{act.date}</span>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Violations */}
              <TabsContent value="violations" className="space-y-3 mt-4">
                {violationsData.length > 0 ? (
                  violationsData.map((v, i) => (
                    <Card key={i} className="border-warning/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="warning">{v.type}</Badge>
                          <span className="text-xs text-muted-foreground">{v.date}</span>
                        </div>
                        <p className="text-sm">{v.detail}</p>
                        <p className="text-sm text-muted-foreground mt-1">Trạng thái: {v.status}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Shield className="w-12 h-12 mx-auto mb-2 text-success" />
                      <p className="text-sm text-muted-foreground">Không có vi phạm nào</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Recent Posts */}
              <TabsContent value="posts" className="space-y-3 mt-4">
                {recentPosts.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <p className="text-sm mb-3">{p.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {p.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {p.comments}
                        </span>
                        <span className="ml-auto">{p.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                Xem profile
              </Button>
              <Button variant={user?.status === "locked" ? "default" : "destructive"}>
                {user?.status === "locked" ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Mở khóa
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Khóa tài khoản
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Gán quyền
              </Button>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
