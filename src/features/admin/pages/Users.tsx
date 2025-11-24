import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Lock,
  Unlock,
  Shield,
  TrendingUp,
} from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserStatsDialog } from "@/components/admin/UserStatsDialog";
import axios from "@/lib/axios";
import { useDebouncedSearch } from "@/hooks/use-debounce-search";
import { useToast } from "@/hooks/use-toast";

interface UserResponseAdmin {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  account_status: string;
  violation_count: number | null;
  posts_count: number;
  interactions_count: number;
}

interface UserSearchResponseAdmin {
  users: UserResponseAdmin[];
  totalHits: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
  query: string;
}

interface ResponseData<T> {
  status: number;
  message: string;
  data: T;
}

interface UIUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  posts: number;
  interactions: number;
  violations: number;
  avatar: string;
}

export default function Users() {
  const {
    searchValue: searchInput,
    debouncedValue: search,
    setSearchValue: setSearch,
  } = useDebouncedSearch("", 200);
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [lockedUsers, setLockedUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [allUsers, setAllUsers] = useState<UIUser[]>([]);
  const [users, setUsers] = useState<UIUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UIUser | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedUserForStats, setSelectedUserForStats] =
    useState<UIUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        limit: 1000,
        offset: 0,
      };
      if (search) params.query = search;
      if (statusFilter !== "all")
        params.filter = `account_status = '${statusFilter.toUpperCase()}'`;

      const response = await axios.get<ResponseData<UserSearchResponseAdmin>>(
        "/users",
        { params }
      );
      const apiUsers = response.data.data.users;

      const mappedUsers: UIUser[] = apiUsers.map((apiUser) => {
        return {
          id: apiUser.id.toString(),
          name: apiUser.username,
          email: apiUser.email,
          role: apiUser.role,
          status: apiUser.account_status.toLowerCase(),
          posts: apiUser.posts_count || 0,
          interactions: apiUser.interactions_count || 0,
          violations: apiUser.violation_count || 0,
          avatar: "https://via.placeholder.com/40",
        };
      });

      setAllUsers(mappedUsers);
      setTotalHits(mappedUsers.length);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      // No fallback data
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const fetchTotalUsers = useCallback(async () => {
    try {
      const response = await axios.get<ResponseData<UserSearchResponseAdmin>>(
        "/users",
        { params: { limit: 1000, offset: 0 } }
      );
      setTotalUsers(response.data.data.totalHits);
    } catch (err) {
      // ignore
    }
  }, []);

  const fetchActiveUsers = useCallback(async () => {
    try {
      const response = await axios.get<ResponseData<UserSearchResponseAdmin>>(
        "/users",
        {
          params: {
            filter: "account_status = 'ACTIVE'",
            limit: 1000,
            offset: 0,
          },
        }
      );
      setActiveUsers(response.data.data.totalHits);
    } catch (err) {
      // ignore
    }
  }, []);

  const fetchLockedUsers = useCallback(async () => {
    try {
      const response = await axios.get<ResponseData<UserSearchResponseAdmin>>(
        "/users",
        {
          params: {
            filter: "account_status = 'LOCKED'",
            limit: 1000,
            offset: 0,
          },
        }
      );
      setLockedUsers(response.data.data.totalHits);
    } catch (err) {
      // ignore
    }
  }, []);

  const fetchPendingUsers = useCallback(async () => {
    try {
      const response = await axios.get<ResponseData<UserSearchResponseAdmin>>(
        "/users",
        {
          params: {
            filter: "account_status = 'PENDING'",
            limit: 1000,
            offset: 0,
          },
        }
      );
      setPendingUsers(response.data.data.totalHits);
    } catch (err) {
      // ignore
    }
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      await axios.post(
        `/users/assign-role/${selectedUser.name}?role=${selectedRole}`
      );
      toast({
        title: "Thành công",
        description: "Quyền đã được gán thành công",
      });
      setAssignRoleOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      fetchUsers();
    } catch (err) {
      console.error("Failed to assign role:", err);
      toast({
        title: "Lỗi",
        description: "Không thể gán quyền. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const start = (currentPage - 1) * 20;
    const end = start + 20;
    const pageUsers = allUsers.slice(start, end);
    setUsers(pageUsers);
  }, [currentPage, allUsers]);

  useEffect(() => {
    fetchTotalUsers();
  }, [fetchTotalUsers]);

  useEffect(() => {
    fetchActiveUsers();
  }, [fetchActiveUsers]);

  useEffect(() => {
    fetchLockedUsers();
  }, [fetchLockedUsers]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "destructive",
      MODERATOR: "default",
      USER: "secondary",
    } as const;
    return variants[role as keyof typeof variants] || "secondary";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      locked: "destructive",
      pending: "outline",
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

  const getPagesToShow = () => {
    const totalPages = Math.ceil(totalHits / 20);
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    if (currentPage > 4) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push("...");
    if (!pages.includes(totalPages)) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quản lý người dùng
        </h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi người dùng trong hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Tổng người dùng</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{activeUsers}</div>
            <div className="text-sm text-muted-foreground">Đang hoạt động</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{lockedUsers}</div>
            <div className="text-sm text-muted-foreground">Bị khóa</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{pendingUsers}</div>
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
                  value={searchInput}
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
          {loading && <div className="text-center py-4">Đang tải...</div>}
          {error && (
            <div className="text-center py-4 text-destructive">{error}</div>
          )}
          {!loading && !error && (
            <>
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
                  {users.map((user) => {
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
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
                            <div className="text-muted-foreground">
                              {user.interactions > 0
                                ? `${user.interactions} tương tác`
                                : "Chưa có tương tác"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.violations > 0 ? (
                            <Badge variant="destructive">
                              {user.violations}
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUserForStats(user);
                                  setStatsDialogOpen(true);
                                }}
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Xem thống kê
                              </DropdownMenuItem>
                              {user.status === "locked" ? (
                                <DropdownMenuItem>
                                  <Unlock className="w-4 h-4 mr-2" />
                                  Mở khóa tài khoản
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-destructive">
                                  <Lock className="w-4 h-4 mr-2" />
                                  Khóa tài khoản
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSelectedRole(user.role);
                                  setAssignRoleOpen(true);
                                }}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Gán quyền
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {totalHits > 20 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(currentPage - 1)}
                          />
                        </PaginationItem>
                      )}
                      {getPagesToShow().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === "..." ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => setCurrentPage(page as number)}
                              isActive={page === currentPage}
                              className={
                                page === currentPage
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : ""
                              }
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      {Math.ceil(totalHits / 20) > 7 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() =>
                              setCurrentPage(Math.ceil(totalHits / 20))
                            }
                          >
                            Cuối
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      {currentPage < Math.ceil(totalHits / 20) && (
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(currentPage + 1)}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gán quyền cho {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAssignRole} disabled={!selectedRole}>
              Gán quyền
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Stats Dialog */}
      {selectedUserForStats && (
        <UserStatsDialog
          open={statsDialogOpen}
          onOpenChange={setStatsDialogOpen}
          userId={selectedUserForStats.id}
          userName={selectedUserForStats.name}
          userEmail={selectedUserForStats.email}
          userRole={selectedUserForStats.role}
          userStatus={selectedUserForStats.status}
        />
      )}
    </div>
  );
}
