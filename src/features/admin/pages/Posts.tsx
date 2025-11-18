import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Image,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Layers,
  Clapperboard,
  Loader2, // Thêm icon loading
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Import AlertDialog cho hộp thoại xác nhận xóa
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

// Import API & Types
import { AdminPostItemDTO } from "../types";
import {
  deletePostById,
  fetchAdminPosts,
  fetchAdminPostsInfo,
} from "../api/postManagementAPI";

// Hook Debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Posts() {
  const [posts, setPosts] = useState<AdminPostItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedPost, setSelectedPost] = useState<AdminPostItemDTO | null>(
    null
  );
  const [postInfo, setPostInfo] = useState<any>(null);

  // State quản lý bài viết đang chờ xóa
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    type: string;
  } | null>(null);

  const { toast } = useToast();
  const debouncedSearch = useDebounce(search, 500);

  // --- LOAD DATA ---
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminPosts({
        search: debouncedSearch,
        pageNo: currentPage - 1,
        pageSize: 10,
        type: typeFilter,
      });

      setPosts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, typeFilter]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- LOAD STATS ---
  const loadAdminPostsData = async () => {
    try {
      const data = await fetchAdminPostsInfo();
      setPostInfo(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    }
  };
  useEffect(() => {
    loadAdminPostsData();
  }, []);

  // --- DELETE HANDLER ---
  const confirmDelete = async () => {
    // Lấy id và type từ state postToDelete
    if (!postToDelete) return;

    try {
      await deletePostById(postToDelete.id, postToDelete.type);
      toast({
        title: "Thành công",
        description: "Đã xóa bài viết khỏi hệ thống",
      });
      loadData(); // Reload lại bảng
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Xóa thất bại, vui lòng thử lại.",
      });
      console.error("Xóa thất bại:", error);
    } finally {
      setPostToDelete(null); // Đóng dialog sau khi xử lý xong
    }
  };

  // --- HELPERS ---
  const getTypeIcon = (type: string) => {
    const icons: any = { post: Image, reel: Video, story: FileText };
    const Icon = icons[type] || FileText;
    return Icon;
  };

  const getTypeBadge = (type: string): "default" | "secondary" | "outline" => {
    const colors: any = {
      post: "default",
      reel: "secondary",
      story: "outline",
    };
    return colors[type] || "default";
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quản lý bài viết
        </h1>
        <p className="text-muted-foreground">
          Quản lý posts, stories, reels và nội dung khác
        </p>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tổng bài viết
              </p>
              <p className="text-2xl font-bold">{postInfo?.totalPost || 0}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Layers className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Bài viết (Posts)
              </p>
              <p className="text-2xl font-bold">
                {postInfo?.quantityPost || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
              <Image className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Video ngắn (Reels)
              </p>
              <p className="text-2xl font-bold">
                {postInfo?.quantityReel || 0}
              </p>
            </div>
            <div className="p-3 bg-pink-100 text-pink-600 rounded-full dark:bg-pink-900/20 dark:text-pink-400">
              <Clapperboard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- TABLE --- */}
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
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" /> Đang tải dữ
                      liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => {
                  const TypeIcon = getTypeIcon(post.type);
                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{post.authorName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadge(post.type)}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {post.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={post.caption}
                      >
                        {post.caption}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>❤️ {post.likeQuantity}</div>
                          <div className="text-muted-foreground">
                            💬 {post.commentQuantity}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(post.createdAt)}</TableCell>
                      <TableCell>
                        {post.isActive ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            Đang hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Đã khóa</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Nút Xem Chi Tiết */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPost(post)}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Nút Xóa Trực Tiếp */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setPostToDelete({ id: post.id, type: post.type })
                            }
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* --- PAGINATION --- */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages || 1}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages || loading}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- POST DETAIL DIALOG --- */}
      {selectedPost && (
        <PostDetailDialog
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          post={selectedPost}
          onDeleteSuccess={loadData}
        />
      )}

      {/* --- DELETE CONFIRM DIALOG (ĐÃ FIX) --- */}
      <AlertDialog
        open={!!postToDelete}
        onOpenChange={(open) => !open && setPostToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bài
              viết này khỏi hệ thống?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
