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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  const [contentFilter, setContentFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
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
  const debouncedSearch = useDebounce(search, 800);
  const debouncedHashtag = useDebounce(hashtagFilter, 500);
  const debouncedContent = useDebounce(contentFilter, 500);
  const debouncedAuthor = useDebounce(authorFilter, 500);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminPosts({
        search: debouncedSearch,
        hashtag: debouncedHashtag,
        content: debouncedContent,
        authorName: debouncedAuthor,
        pageNo: currentPage - 1,
        pageSize: 10,
        type: typeFilter,
        startDate: startDateFilter
          ? new Date(startDateFilter).toISOString()
          : undefined,
        endDate: endDateFilter
          ? new Date(endDateFilter).toISOString()
          : undefined,
      });

      setPosts(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
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
    debouncedContent,
    debouncedAuthor,
    typeFilter,
    startDateFilter,
    endDateFilter,
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

  const getPagesToShow = () => {
    const totalPagesValue = totalPages || 1;
    const current = currentPage; // 1-based for UI
    
    if (totalPagesValue <= 7) {
      return Array.from({ length: totalPagesValue }, (_, i) => i + 1);
    }
    
    const pages: (number | string)[] = [1];
    if (current > 4) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPagesValue - 1, current + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (current < totalPagesValue - 3) pages.push("...");
    if (!pages.includes(totalPagesValue)) pages.push(totalPagesValue);
    
    return pages;
  };

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Quản lý{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Bài viết
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Giám sát và kiểm duyệt toàn bộ nội dung trên nền tảng Nexo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="border-none shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <div className="p-6 flex justify-between items-start">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase mb-1 tracking-widest">
                  Tổng bài viết
                </p>
                <h3 className="text-3xl font-black tracking-tighter">
                  {(postInfo?.totalPost || 0).toLocaleString()}
                </h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md group-hover:scale-110 group-hover:rotate-12 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="p-6 flex justify-between items-start">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase mb-1 tracking-widest">
                  Bài viết (Posts)
                </p>
                <h3 className="text-3xl font-black tracking-tighter">
                  {(postInfo?.quantityPost || 0).toLocaleString()}
                </h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md group-hover:scale-110 group-hover:rotate-12 transition-transform">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white">
            <div className="p-6 flex justify-between items-start">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase mb-1 tracking-widest">
                  Video ngắn (Reels)
                </p>
                <h3 className="text-3xl font-black tracking-tighter">
                  {(postInfo?.quantityReel || 0).toLocaleString()}
                </h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md group-hover:scale-110 group-hover:rotate-12 transition-transform">
                <Clapperboard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 shadow-xl rounded-[2rem] overflow-hidden bg-card text-card-foreground">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Cơ sở dữ liệu bài viết
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {/* 1. Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm nội dung..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-background shadow-sm border-border text-foreground focus-visible:border-primary focus-visible:ring-0 transition-colors hover:bg-muted/50 w-full"
              />
            </div>

            {/* 2. Hashtag */}
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Hashtag (VD: #nexo)"
                value={hashtagFilter}
                onChange={(e) => setHashtagFilter(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-background shadow-sm border-border text-foreground focus-visible:border-primary focus-visible:ring-0 transition-colors hover:bg-muted/50 w-full"
              />
            </div>

            {/* 3. Author */}
            <div className="relative">
              <Input
                placeholder="Tên tác giả..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="pl-4 h-11 rounded-xl bg-background shadow-sm border-border text-foreground focus-visible:border-primary focus-visible:ring-0 transition-colors hover:bg-muted/50 w-full"
              />
            </div>

            {/* 4. Type */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full h-11 rounded-xl bg-background shadow-sm border-border text-foreground focus:border-primary focus:ring-0 transition-colors hover:bg-muted/50">
                <SelectValue placeholder="Loại nội dung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" hideIcon className="focus:bg-primary/15 focus:text-primary cursor-pointer">Tất cả định dạng</SelectItem>
                <SelectItem value="post" hideIcon className="focus:bg-primary/15 focus:text-primary cursor-pointer">Posts</SelectItem>
                <SelectItem value="reel" hideIcon className="focus:bg-primary/15 focus:text-primary cursor-pointer">Reels</SelectItem>
              </SelectContent>
            </Select>

            {/* 5. Start Date */}
            <div className="relative">
              <Input
                type="date"
                placeholder="Từ ngày"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full h-11 rounded-xl bg-background shadow-sm border-border text-foreground focus-visible:border-primary focus-visible:ring-0 transition-colors hover:bg-muted/50"
              />
            </div>

            {/* 6. End Date */}
            <div className="relative">
              <Input
                type="date"
                placeholder="Đến ngày"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full h-11 rounded-xl bg-background shadow-sm border-border text-foreground focus-visible:border-primary focus-visible:ring-0 transition-colors hover:bg-muted/50"
              />
            </div>
          </div>

          <div className="rounded-md border border-border/50 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
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
                        className="hover:bg-muted/50 border-b border-border/50 transition-colors"
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
                              className="text-emerald-600 dark:text-emerald-500 border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
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

          {totalElements > 0 && (
            <div className="mt-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg gap-1 px-3"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || loading || totalElements === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Trước
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
                          className={`w-9 h-9 p-0 rounded-lg ${page === currentPage ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-none" : ""}`}
                          onClick={() => setCurrentPage(page as number)}
                          disabled={loading}
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
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
                      disabled={currentPage >= (totalPages || 1) || loading}
                    >
                      Sau <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
