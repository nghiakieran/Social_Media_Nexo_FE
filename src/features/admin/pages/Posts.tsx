import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Layers,
  Clapperboard,
  Loader2,
  Calendar,
  AlertTriangle,
  Hash,
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

import { AdminPostItemDTO } from "../types";
import {
  deletePostById,
  fetchAdminPosts,
  fetchAdminPostsInfo,
} from "../api/postManagementAPI";

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
  const [hashtagFilter, setHashtagFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sensitiveFilter, setSensitiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedPost, setSelectedPost] = useState<AdminPostItemDTO | null>(
    null,
  );
  const [postInfo, setPostInfo] = useState<any>(null);

  const [postToDelete, setPostToDelete] = useState<{
    id: number;
    type: string;
  } | null>(null);

  const { toast } = useToast();
  const debouncedSearch = useDebounce(search, 500);
  const debouncedHashtag = useDebounce(hashtagFilter, 500);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminPosts({
        search: debouncedSearch,
        // hashtag: debouncedHashtag,
        pageNo: currentPage - 1,
        pageSize: 10,
        type: typeFilter,
        // timeRange: timeFilter,
        // sensitive: sensitiveFilter,
      });

      setPosts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error(error);
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
  }, [
    debouncedSearch,
    debouncedHashtag,
    typeFilter,
    timeFilter,
    sensitiveFilter,
  ]);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadAdminPostsData = async () => {
    try {
      const data = await fetchAdminPostsInfo();
      setPostInfo(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAdminPostsData();
  }, []);

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await deletePostById(postToDelete.id, postToDelete.type);
      toast({
        variant: "success",
        title: "Thành công",
        description: "Đã xóa bài viết khỏi hệ thống",
      });
      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Xóa thất bại, vui lòng thử lại.",
      });
    } finally {
      setPostToDelete(null);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: any = { post: ImageIcon, reel: Video, story: FileText };
    return icons[type] || FileText;
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

  const renderThumbnail = (post: any) => {
    const TypeIcon = getTypeIcon(post.type);
    const mediaUrl =
      post.thumbnailUrl ||
      (Array.isArray(post.mediaUrl) ? post.mediaUrl[0] : post.mediaUrl);

    if (mediaUrl) {
      return (
        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted relative border">
          <img
            src={mediaUrl}
            alt="thumbnail"
            className="w-full h-full object-cover"
          />
          {post.type === "reel" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Video className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center border">
        <TypeIcon className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quản lý bài viết
        </h1>
        <p className="text-muted-foreground">
          Giám sát và kiểm duyệt toàn bộ nội dung trên nền tảng
        </p>
      </div>

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
              <ImageIcon className="w-5 h-5" />
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
            <div className="rounded-full bg-primary/15 p-3 text-primary dark:bg-primary/25">
              <Clapperboard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách & Bộ lọc nâng cao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nội dung, tác giả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative flex-1 md:max-w-xs">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Lọc hashtag (VD: #nexo)"
                  value={hashtagFilter}
                  onChange={(e) => setHashtagFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Loại nội dung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả định dạng</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="reel">Reels</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi lúc</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="week">7 ngày qua</SelectItem>
                  <SelectItem value="month">30 ngày qua</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sensitiveFilter}
                onValueChange={setSensitiveFilter}
              >
                <SelectTrigger className="w-full md:w-[220px]">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Nội dung nhạy cảm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bài viết</SelectItem>
                  <SelectItem value="flagged">Có từ khóa nhạy cảm</SelectItem>
                  <SelectItem value="safe">An toàn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  {/* <TableHead className="w-[70px]">Media</TableHead> */}
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="max-w-[200px]">Nội dung</TableHead>
                  <TableHead>Tương tác</TableHead>
                  <TableHead>Ngày đăng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" /> Đang tải dữ
                        liệu...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Không tìm thấy bài viết nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => {
                    const TypeIcon = getTypeIcon(post.type);
                    return (
                      <TableRow
                        key={post.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{post.id}
                        </TableCell>
                        {/* <TableCell>{renderThumbnail(post)}</TableCell> */}
                        <TableCell>
                          <span className="font-medium">{post.authorName}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getTypeBadge(post.type)}
                            className="capitalize"
                          >
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {post.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate text-sm" title={post.caption}>
                            {post.caption || (
                              <span className="text-muted-foreground italic">
                                Không có nội dung
                              </span>
                            )}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-3 text-xs">
                            <span className="flex items-center text-rose-500 font-medium">
                              ❤️ {post.likeQuantity || 0}
                            </span>
                            <span className="flex items-center text-blue-500 font-medium">
                              💬 {post.commentQuantity || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </TableCell>
                        <TableCell>
                          {post.isActive ? (
                            <Badge
                              variant="outline"
                              className="text-emerald-600 border-emerald-600 bg-emerald-50"
                            >
                              Công khai
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Đã ẩn</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedPost(post)}
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                setPostToDelete({
                                  id: post.id,
                                  type: post.type,
                                })
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
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị tổng số {totalElements} bài viết
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium mr-4">
                Trang {currentPage} / {totalPages || 1}
              </div>
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

      {selectedPost && (
        <PostDetailDialog
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          post={selectedPost}
          onDeleteSuccess={loadData}
        />
      )}

      <AlertDialog
        open={!!postToDelete}
        onOpenChange={(open) => !open && setPostToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bài
              viết này khỏi hệ thống Nexo?
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
