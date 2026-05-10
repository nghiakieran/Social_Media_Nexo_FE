import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Lock,
  Unlock,
  Shield,
  TrendingUp,
  BadgeCheck,
  Calendar as CalendarIcon,
  Ban,
  Trash2,
  History,
  AlertTriangle,
  FileText,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserStatsDialog } from "@/components/admin/UserStatsDialog";
import axios from "@/lib/axios";
import { useDebouncedSearch } from "@/hooks/use-debounce-search";
import { useToast } from "@/hooks/use-toast";
import { banUser, unbanUser } from "../api/userManagementAPI";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@radix-ui/react-scroll-area";

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
  is_verified: boolean;
  created_at: string;
  avatar_url: string | null;
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
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  posts: number;
  interactions: number;
  violations: number;
  avatar: string;
  isVerified: boolean;
  createdAt: string;
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

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7");

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
        { params },
      );
      const apiUsers = response.data.data.users;

      const mappedUsers: UIUser[] = apiUsers.map((apiUser) => ({
        id: apiUser.id.toString(),
        username: apiUser.username,
        fullName: apiUser.fullName || apiUser.username,
        email: apiUser.email,
        role: apiUser.role,
        status: apiUser.account_status.toLowerCase(),
        posts: apiUser.posts_count || 0,
        interactions: apiUser.interactions_count || 0,
        violations: apiUser.violation_count || 0,
        avatar:
          apiUser.avatar_url ||
          "https://ui-avatars.com/api/?name=" + apiUser.username,
        isVerified: apiUser.is_verified || false,
        createdAt: apiUser.created_at || new Date().toISOString(),
      }));

      setAllUsers(mappedUsers);
      setTotalHits(mappedUsers.length);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      await axios.post(
        `/users/assign-role/${selectedUser.username}?role=${selectedRole}`,
      );
      toast({
        variant: "success",
        title: "Thành công",
        description: "Quyền đã được gán thành công",
      });
      setAssignRoleOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      fetchUsers();
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể gán quyền. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleBanUserSubmit = async () => {
    if (!selectedUser || !banReason) return;
    try {
      await banUser(
        selectedUser.username,
        //   ,
        //   {
        //   reason: banReason,
        //   durationDays: parseInt(banDuration),
        // }
      );
      toast({
        variant: "success",
        title: "Thành công",
        description: `Tài khoản ${selectedUser.username} đã bị khóa ${banDuration} ngày.`,
      });
      setBanDialogOpen(false);
      setDetailsDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể khóa tài khoản.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVerify = async (user: UIUser) => {
    try {
      toast({
        variant: "success",
        title: "Thành công",
        description: `Đã ${user.isVerified ? "thu hồi" : "cấp"} tick xanh cho ${user.username}`,
      });
      fetchUsers();
    } catch (error) { }
  };

  const handleDeleteAvatar = async (user: UIUser) => {
    try {
      toast({
        variant: "success",
        title: "Thành công",
        description: `Đã xóa avatar của ${user.username}`,
      });
      fetchUsers();
    } catch (error) { }
  };

  const fetchSummaryStats = useCallback(async () => {
    try {
      const [total, active, locked, pending] = await Promise.all([
        axios.get("/users", { params: { limit: 1, offset: 0 } }),
        axios.get("/users", {
          params: { filter: "account_status = 'ACTIVE'", limit: 1 },
        }),
        axios.get("/users", {
          params: { filter: "account_status = 'LOCKED'", limit: 1 },
        }),
        axios.get("/users", {
          params: { filter: "account_status = 'PENDING'", limit: 1 },
        }),
      ]);
      setTotalUsers(total.data.data.totalHits);
      setActiveUsers(active.data.data.totalHits);
      setLockedUsers(locked.data.data.totalHits);
      setPendingUsers(pending.data.data.totalHits);
    } catch (err) {
      console.error("Failed to load summary stats");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSummaryStats();
  }, [fetchUsers, fetchSummaryStats]);

  useEffect(() => {
    const start = (currentPage - 1) * 20;
    const end = start + 20;
    const pageUsers = allUsers.slice(start, end);
    setUsers(pageUsers);
  }, [currentPage, allUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "bg-rose-500 hover:bg-rose-600 border-none shadow-sm",
      MODERATOR: "bg-indigo-500 hover:bg-indigo-600 border-none shadow-sm",
      USER: "bg-slate-500 hover:bg-slate-600 border-none shadow-sm",
    } as const;
    switch (role) {
      case "ADMIN":
        return "bg-rose-500 hover:bg-rose-600 border-none shadow-sm text-white";
      case "MODERATOR":
        return "bg-indigo-500 hover:bg-indigo-600 border-none shadow-sm text-white";
      default:
        return "bg-slate-500 hover:bg-slate-600 border-none shadow-sm text-white";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm text-white";
      case "locked":
        return "bg-rose-500 hover:bg-rose-600 border-none shadow-sm text-white";
      default:
        return "bg-amber-500 hover:bg-amber-600 border-none shadow-sm text-white";
    }
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: "Hoạt động",
      locked: "Bị khóa",
      pending: "Chờ xác thực",
    };
    return texts[status as keyof typeof texts] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
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

  const summaryCards = [
    {
      label: "Tổng người dùng",
      value: totalUsers,
      icon: UsersIcon,
      color: "from-blue-600 to-indigo-600",
    },
    {
      label: "Đang hoạt động",
      value: activeUsers,
      icon: BadgeCheck,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Bị khóa",
      value: lockedUsers,
      icon: Ban,
      color: "from-rose-500 to-red-600",
    },
    {
      label: "Chờ xác thực",
      value: pendingUsers,
      icon: History,
      color: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Quản lý{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Thành viên
            </span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Điều hành và giám sát quyền truy cập hệ thống Nexo
          </p>
        </div>
      </div>

      {/* Summary Cards với Gradient */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <Card
            key={i}
            className="border-none shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <CardContent
              className={`p-0 bg-gradient-to-br ${card.color} text-white`}
            >
              <div className="p-6 flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase mb-1 tracking-widest">
                    {card.label}
                  </p>
                  <h3 className="text-3xl font-black tracking-tighter">
                    {card.value.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md group-hover:scale-110 group-hover:rotate-12 transition-transform">
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800">
                Cơ sở dữ liệu người dùng
              </CardTitle>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên, email, username..."
                  value={searchInput}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-indigo-500 shadow-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 h-11 rounded-xl bg-white shadow-sm">
                  <Filter className="w-4 h-4 mr-2 text-indigo-500" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">● Hoạt động</SelectItem>
                  <SelectItem value="locked">● Bị khóa</SelectItem>
                  <SelectItem value="pending">● Chờ xác thực</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent border-b-slate-100">
                  <TableHead className="font-bold py-5 pl-8 text-slate-700">
                    Thành viên
                  </TableHead>
                  <TableHead className="font-bold text-slate-700">
                    Ngày gia nhập
                  </TableHead>
                  <TableHead className="font-bold text-slate-700">
                    Vai trò
                  </TableHead>
                  <TableHead className="font-bold text-slate-700">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-bold text-slate-700">
                    Chỉ số
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">
                    Vi phạm
                  </TableHead>
                  <TableHead className="pr-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 text-rose-500">
                        <AlertTriangle className="w-8 h-8" />
                        <p className="font-bold">{error}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-40 text-center text-slate-400"
                    >
                      Không tìm thấy người dùng nào phù hợp
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="group cursor-pointer hover:bg-indigo-50/30 transition-all border-b-slate-50"
                      onClick={() => {
                        setSelectedUser(user);
                        setDetailsDialogOpen(true);
                        setActiveTab("overview");
                      }}
                    >
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative group-hover:scale-105 transition-transform">
                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm rounded-2xl">
                              <AvatarImage
                                src={user.avatar}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {user.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${user.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                            />
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                              {user.fullName}
                              {user.isVerified && (
                                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              @{user.username}
                            </div>
                            <div className="text-[10px] text-slate-400 italic">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm font-medium text-slate-600">
                          <CalendarIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(user.status)}>
                          {getStatusText(user.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <FileText className="w-3 h-3 text-indigo-500" />{" "}
                            {user.posts}{" "}
                            <span className="font-normal text-slate-400">
                              bài viết
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />{" "}
                            {user.interactions}{" "}
                            <span className="font-normal text-slate-400">
                              tương tác
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.violations > 0 ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-black text-xs border border-rose-100">
                            {user.violations}
                          </div>
                        ) : (
                          <span className="text-slate-300 font-medium">-</span>
                        )}
                      </TableCell>
                      <TableCell
                        className="pr-8 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-slate-200"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 rounded-xl p-2 shadow-2xl border-slate-100"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setDetailsDialogOpen(true);
                                setActiveTab("overview");
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2 text-slate-500" />{" "}
                              Chi tiết hồ sơ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForStats(user);
                                setStatsDialogOpen(true);
                              }}
                            >
                              <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />{" "}
                              Thống kê tăng trưởng
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedRole(user.role);
                                setAssignRoleOpen(true);
                              }}
                            >
                              <Shield className="w-4 h-4 mr-2 text-amber-500" />{" "}
                              Phân quyền
                            </DropdownMenuItem>
                            <div className="h-px bg-slate-100 my-1" />
                            {user.status === "locked" ? (
                              <DropdownMenuItem
                                className="text-emerald-600 focus:text-emerald-700"
                                onClick={async () => {
                                  try {
                                    await unbanUser(user.username);
                                    toast({
                                      variant: "success",
                                      title: "Thành công",
                                      description: "Tài khoản đã được mở khóa",
                                    });
                                    setTimeout(() => fetchUsers(), 1000);
                                  } catch (error) {
                                    toast({
                                      title: "Lỗi",
                                      description: "Không thể mở khóa",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Unlock className="w-4 h-4 mr-2" /> Mở khóa tài
                                khoản
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-700"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setBanDialogOpen(true);
                                }}
                              >
                                <Lock className="w-4 h-4 mr-2" /> Khóa tài khoản
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalHits > 20 && (
            <div className="p-6 border-t border-slate-50 bg-slate-50/30">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg gap-1 px-3"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" /> Trước
                    </Button>
                  </PaginationItem>

                  {getPagesToShow().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === "..." ? (
                        <PaginationEllipsis />
                      ) : (
                        <Button
                          variant={page === currentPage ? "default" : "ghost"}
                          size="sm"
                          className={`w-9 h-9 p-0 rounded-lg ${page === currentPage ? "bg-indigo-600 shadow-indigo-200 shadow-lg" : ""}`}
                          onClick={() => setCurrentPage(page as number)}
                        >
                          {page}
                        </Button>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg gap-1 px-3"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage >= Math.ceil(totalHits / 20)}
                    >
                      Sau <ChevronRight className="w-4 h-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL GÁN QUYỀN */}
      <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Phân quyền người dùng
            </DialogTitle>
            <p className="text-slate-500 text-sm italic">
              Thiết lập vai trò mới cho {selectedUser?.fullName}
            </p>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <Avatar className="w-12 h-12 rounded-xl">
                <AvatarImage src={selectedUser?.avatar} />
              </Avatar>
              <div>
                <p className="font-bold">@{selectedUser?.username}</p>
                <Badge variant="outline" className="text-[10px]">
                  {selectedUser?.role}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase text-slate-400">
                Chọn vai trò mới
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="USER">
                    USER - Người dùng phổ thông
                  </SelectItem>
                  <SelectItem value="MODERATOR">
                    MODERATOR - Người kiểm duyệt
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    ADMIN - Quản trị viên hệ thống
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setAssignRoleOpen(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedRole}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 shadow-lg shadow-indigo-100"
            >
              Cập nhật quyền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CHI TIẾT HỒ SƠ */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
          {selectedUser && (
            <div className="flex h-full">
              {/* Sidebar Profile */}
              <div className="w-[320px] bg-slate-900 text-white p-8 flex flex-col items-center">
                <div className="relative mb-6 group">
                  <Avatar className="w-32 h-32 rounded-[2.5rem] border-4 border-white/10 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                    <AvatarImage
                      src={selectedUser.avatar}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl bg-indigo-600">
                      {selectedUser.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  {selectedUser.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 p-2 rounded-2xl border-4 border-slate-900 shadow-xl">
                      <BadgeCheck className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-black text-center mb-1 leading-tight">
                  {selectedUser.fullName}
                </h3>
                <p className="text-indigo-400 font-bold text-sm mb-4 tracking-tighter">
                  @{selectedUser.username}
                </p>
                <p className="text-slate-400 text-xs mb-8 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  {selectedUser.email}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mb-10">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                      Vai trò
                    </p>
                    <p className="font-black text-xs text-indigo-300">
                      {selectedUser.role}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                      Status
                    </p>
                    <p
                      className={`font-black text-xs ${selectedUser.status === "active" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {selectedUser.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-3 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-start border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                    onClick={() => handleToggleVerify(selectedUser)}
                  >
                    <BadgeCheck className="w-4 h-4 mr-2 text-blue-400" />{" "}
                    {selectedUser.isVerified ? "Hủy xác minh" : "Cấp xác minh"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-start border-white/10 bg-white/5 hover:bg-white/10 text-rose-400 hover:text-rose-300 rounded-xl"
                    onClick={() => handleDeleteAvatar(selectedUser)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa Avatar vi phạm
                  </Button>
                  {selectedUser.status !== "locked" ? (
                    <Button
                      variant="destructive"
                      className="w-full h-11 justify-start bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-900/20"
                      onClick={() => setBanDialogOpen(true)}
                    >
                      <Ban className="w-4 h-4 mr-2" /> Khóa vĩnh viễn
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="w-full h-11 justify-start bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                      onClick={() => unbanUser(selectedUser.username)}
                    >
                      <Unlock className="w-4 h-4 mr-2" /> Mở khóa ngay
                    </Button>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col bg-slate-50">
                <div className="flex p-6 bg-white border-b gap-8">
                  {[
                    {
                      id: "overview",
                      label: "Hoạt động",
                      icon: <TrendingUp className="w-4 h-4" />,
                    },
                    {
                      id: "reports",
                      label: "Vi phạm",
                      icon: <AlertTriangle className="w-4 h-4" />,
                    },
                    {
                      id: "login",
                      label: "Bảo mật",
                      icon: <History className="w-4 h-4" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <ScrollArea className="flex-1 p-8">
                  {activeTab === "overview" && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                      <div className="grid grid-cols-2 gap-6">
                        <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                              Nội dung đã đăng
                            </p>
                            <div className="text-4xl font-black text-slate-800">
                              {selectedUser.posts}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Bài viết & Thước phim
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                              Tổng lượt tương tác
                            </p>
                            <div className="text-4xl font-black text-slate-800">
                              {selectedUser.interactions}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Tim, Bình luận, Chia sẻ
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-500" /> Hoạt
                          động mới nhất
                        </h4>
                        <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 text-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold italic">
                            Danh sách hoạt động đang được đồng bộ...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "reports" && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                      <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-rose-700">
                              Lịch sử vi phạm
                            </h4>
                            <p className="text-rose-600/70 text-sm font-medium">
                              Người dùng này đã có {selectedUser.violations} báo
                              cáo vi phạm.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 text-center">
                        <p className="text-slate-400 font-bold italic">
                          Chi tiết các vi phạm đang được tải...
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "login" && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                      <h4 className="font-black text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-500" /> Phiên
                        làm việc gần đây
                      </h4>
                      <div className="space-y-3">
                        {[
                          {
                            time: "Hôm nay, 10:23 AM",
                            dev: "Chrome - Windows 11",
                            ip: "113.190.23.45",
                            status: "Thành công",
                          },
                          {
                            time: "Hôm qua, 08:15 PM",
                            dev: "Nexo App - iPhone 15 Pro",
                            ip: "14.232.11.12",
                            status: "Thành công",
                          },
                        ].map((session, i) => (
                          <div
                            key={i}
                            className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                <CalendarIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">
                                  {session.dev}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                  {session.time} • {session.ip}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50">
                              {session.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL KHÓA TÀI KHOẢN */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-rose-600 flex items-center gap-2">
              <Ban className="w-6 h-6" /> Khóa tài khoản người dùng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <Avatar className="w-12 h-12 rounded-xl">
                <AvatarImage src={selectedUser?.avatar} />
              </Avatar>
              <div>
                <p className="font-bold text-rose-700">
                  {selectedUser?.fullName}
                </p>
                <p className="text-xs text-rose-600 opacity-70">
                  @{selectedUser?.username}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">
                Thời gian đình chỉ
              </Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="3">Tạm đình chỉ 3 ngày</SelectItem>
                  <SelectItem value="7">Tạm đình chỉ 7 ngày</SelectItem>
                  <SelectItem value="30">Đình chỉ 1 tháng (30 ngày)</SelectItem>
                  <SelectItem value="9999">
                    Khóa vĩnh viễn (Permanent)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">
                Lý do kỷ luật
              </Label>
              <Input
                placeholder="Nhập lý do cụ thể..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="h-12 rounded-xl focus:ring-rose-500"
              />
              <p className="text-[10px] text-slate-400">
                * Lý do này sẽ được gửi tới email người dùng.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setBanDialogOpen(false)}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUserSubmit}
              disabled={!banReason}
              className="bg-rose-600 hover:bg-rose-700 rounded-xl px-8 shadow-lg shadow-rose-200"
            >
              Xác nhận kỷ luật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL THỐNG KÊ */}
      {selectedUserForStats && (
        <UserStatsDialog
          open={statsDialogOpen}
          onOpenChange={setStatsDialogOpen}
          userId={selectedUserForStats.id}
          userName={selectedUserForStats.username}
          userEmail={selectedUserForStats.email}
          userRole={selectedUserForStats.role}
          userStatus={selectedUserForStats.status}
        />
      )}
    </div>
  );
}

function TableSkeleton() {
  return Array(7)
    .fill(0)
    .map((_, i) => (
      <TableRow key={i} className="hover:bg-transparent border-none">
        <TableCell className="pl-8 py-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-16 rounded-lg" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-16 rounded-lg" />
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
        </TableCell>
        <TableCell className="pr-8">
          <Skeleton className="h-8 w-8 ml-auto rounded-full" />
        </TableCell>
      </TableRow>
    ));
}

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

function Label({ children, className }: LabelProps) {
  return (
    <label className={`text-sm font-medium leading-none ${className}`}>
      {children}
    </label>
  );
}
