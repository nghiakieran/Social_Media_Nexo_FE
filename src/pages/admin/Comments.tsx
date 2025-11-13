import { useState } from "react";
import { Search, Filter, MoreHorizontal, Eye, Trash2, Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const mockComments = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    content: "Bài viết rất hay và bổ ích!",
    post: "Chia sẻ về chuyến du lịch...",
    likes: 12,
    reports: 0,
    date: "2024-11-10",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  },
  {
    id: "2",
    author: "Trần Thị B",
    content: "Không đồng ý với quan điểm này",
    post: "Thảo luận về công nghệ...",
    likes: 3,
    reports: 2,
    date: "2024-11-09",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
  },
  {
    id: "3",
    author: "Lê Văn C",
    content: "Spam content here...",
    post: "Video hướng dẫn...",
    likes: 0,
    reports: 5,
    date: "2024-11-08",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
  },
];

export default function Comments() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quản lý bình luận
        </h1>
        <p className="text-muted-foreground">Theo dõi và kiểm duyệt bình luận</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockComments.length}</div>
            <div className="text-sm text-muted-foreground">Tổng bình luận</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {mockComments.filter(c => c.reports > 0 && c.reports < 3).length}
            </div>
            <div className="text-sm text-muted-foreground">Cần xem xét</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {mockComments.filter(c => c.reports >= 3).length}
            </div>
            <div className="text-sm text-muted-foreground">Vi phạm nghiêm trọng</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Danh sách bình luận</CardTitle>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Bài viết</TableHead>
                <TableHead>Lượt thích</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Báo cáo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">{comment.author}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{comment.content}</div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {comment.post}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">❤️ {comment.likes}</span>
                  </TableCell>
                  <TableCell>{comment.date}</TableCell>
                  <TableCell>
                    {comment.reports > 0 ? (
                      <Badge variant={comment.reports >= 3 ? "destructive" : "warning"}>
                        <Flag className="w-3 h-3 mr-1" />
                        {comment.reports}
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
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa bình luận
                        </DropdownMenuItem>
                        {comment.reports > 0 && (
                          <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2" />
                            Xử lý báo cáo
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
