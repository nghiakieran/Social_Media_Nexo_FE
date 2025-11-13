import { useState } from "react";
import { Search, Filter, MoreHorizontal, Lock, Unlock, Shield, Eye, TrendingUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockUsers = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    role: "user",
    status: "active",
    posts: 45,
    interactions: 1200,
    violations: 0,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    role: "moderator",
    status: "active",
    posts: 120,
    interactions: 3400,
    violations: 1,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@email.com",
    role: "user",
    status: "locked",
    posts: 25,
    interactions: 450,
    violations: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "phamthid@email.com",
    role: "user",
    status: "pending",
    posts: 0,
    interactions: 0,
    violations: 0,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
  },
];

export default function Users() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      moderator: "default",
      user: "secondary",
    } as const;
    return variants[role as keyof typeof variants] || "secondary";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "success",
      locked: "destructive",
      pending: "warning",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: "Hoạt động",
      locked: "Bị khóa",
      pending: "Chờ xác thực",
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quản lý người dùng
        </h1>
        <p className="text-muted-foreground">Quản lý và theo dõi người dùng trong hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <div className="text-sm text-muted-foreground">Tổng người dùng</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.status === "active").length}</div>
            <div className="text-sm text-muted-foreground">Đang hoạt động</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.status === "locked").length}</div>
            <div className="text-sm text-muted-foreground">Bị khóa</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.status === "pending").length}</div>
            <div className="text-sm text-muted-foreground">Chờ xác thực</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Danh sách người dùng</CardTitle>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="locked">Bị khóa</SelectItem>
                  <SelectItem value="pending">Chờ xác thực</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hoạt động</TableHead>
                <TableHead>Vi phạm</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadge(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(user.status)}>
                      {getStatusText(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.posts} bài viết</div>
                      <div className="text-muted-foreground">{user.interactions} tương tác</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.violations > 0 ? (
                      <Badge variant="destructive">{user.violations}</Badge>
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
                        <DropdownMenuItem>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Xem thống kê
                        </DropdownMenuItem>
                        {user.status === "locked" ? (
                          <DropdownMenuItem>
                            <Unlock className="w-4 h-4 mr-2" />
                            Mở khóa
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-destructive">
                            <Lock className="w-4 h-4 mr-2" />
                            Khóa tài khoản
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Shield className="w-4 h-4 mr-2" />
                          Gán quyền
                        </DropdownMenuItem>
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
