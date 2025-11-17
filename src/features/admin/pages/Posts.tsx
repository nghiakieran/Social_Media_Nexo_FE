import { useState } from "react";
import { Search, Filter, MoreHorizontal, Eye, Trash2, Flag, Image, Video, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostDetailDialog } from "@/components/admin/PostDetailDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockPosts = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    type: "post",
    content: "Chia sẻ về chuyến du lịch mùa hè...",
    likes: 245,
    comments: 32,
    shares: 15,
    reports: 0,
    date: "2024-11-10",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    fullContent: "Chia sẻ về chuyến du lịch mùa hè tuyệt vời! Phong cảnh núi non hùng vĩ, không khí trong lành. Cảm ơn mọi người đã theo dõi hành trình của mình 🏔️✨",
    hashtags: ["#travel", "#summer", "#mountains", "#nature"],
    location: "Sapa, Lào Cai",
  },
  {
    id: "2",
    author: "Trần Thị B",
    type: "reel",
    content: "Video hướng dẫn làm bánh...",
    likes: 1240,
    comments: 89,
    shares: 67,
    reports: 2,
    date: "2024-11-09",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-spinning-around-the-earth-29351-large.mp4",
    fullContent: "Video hướng dẫn làm bánh bông lan trứng muối siêu ngon! Dễ làm, ai cũng làm được 🍰👨‍🍳",
    hashtags: ["#cooking", "#recipe", "#baking", "#food"],
    location: "Hà Nội",
  },
  {
    id: "3",
    author: "Lê Văn C",
    type: "story",
    content: "Story về sự kiện tối qua",
    likes: 89,
    comments: 12,
    shares: 5,
    reports: 5,
    date: "2024-11-08",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    fullContent: "Story về sự kiện tối qua thật tuyệt vời! 🎉",
    hashtags: ["#event", "#party", "#nightlife"],
  },
];

export default function Posts() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<typeof mockPosts[0] | null>(null);

  const getTypeIcon = (type: string) => {
    const icons = {
      post: Image,
      reel: Video,
      story: FileText,
    };
    return icons[type as keyof typeof icons] || FileText;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quản lý bài viết
        </h1>
        <p className="text-muted-foreground">Quản lý posts, stories, reels và nội dung khác</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockPosts.length}</div>
            <div className="text-sm text-muted-foreground">Tổng bài viết</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockPosts.filter(p => p.type === "post").length}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockPosts.filter(p => p.type === "reel").length}</div>
            <div className="text-sm text-muted-foreground">Reels</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {mockPosts.reduce((sum, p) => sum + p.reports, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Báo cáo</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Danh sách bài viết</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="reel">Reels</SelectItem>
                  <SelectItem value="story">Stories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tác giả</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Tương tác</TableHead>
                <TableHead>Ngày đăng</TableHead>
                <TableHead>Báo cáo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPosts.map((post) => {
                const TypeIcon = getTypeIcon(post.type);
                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="font-medium">{post.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadge(post.type)}>
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {post.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>❤️ {post.likes}</div>
                        <div className="text-muted-foreground">💬 {post.comments} | 🔄 {post.shares}</div>
                      </div>
                    </TableCell>
                    <TableCell>{post.date}</TableCell>
                    <TableCell>
                      {post.reports > 0 ? (
                        <Badge variant="destructive">
                          <Flag className="w-3 h-3 mr-1" />
                          {post.reports}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedPost(post)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {post.reports > 0 && (
                            <DropdownMenuItem>
                              <Flag className="w-4 h-4 mr-2" />
                              Xử lý báo cáo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa bài viết
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPost && (
        <PostDetailDialog
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          post={selectedPost}
        />
      )}
    </div>
  );
}
