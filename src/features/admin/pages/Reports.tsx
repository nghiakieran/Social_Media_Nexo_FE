import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Flag,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  FilmIcon,
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportDetailDialog } from "@/components/admin/ReportDetailDialog";
import { UserReportDetailDialog } from "@/components/admin/UserReportDetailDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { AppDispatch, useAppSelector } from "@/store";
import {
  fetchReportsAsync,
  setActiveTab,
  setStatusFilter,
  setCurrentPage,
  setSearch,
  setSelectedReport,
  type UserReport,
  type PostReelReport,
} from "../adminSlice";

// Status Config
const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: <Clock className="w-3 h-3" />,
  },
  IN_REVIEW: {
    label: "Đang xem xét",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: <Search className="w-3 h-3" />,
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const ReportTable = ({ data, onSelectReport, reportType = "post" }) => {
  return (
    <div className="rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-b border-border/50 hover:bg-transparent">
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">
              Người báo cáo
            </TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">
              {reportType === "user"
                ? "Đối tượng bị tố cáo"
                : "Chủ sở hữu nội dung"}
            </TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">
              Lý do & AI Phân tích
            </TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Ngày tạo</TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">
              Trạng thái
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((report) => {
              const status = report.reportStatus || report.status || "PENDING";
              const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

              return (
                <TableRow
                  key={report.id || `${report.reporterId}-${report.reportedId}`}
                  className="hover:bg-muted/50 border-b border-border/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shadow-sm">
                        {(report.reporterName || report.reporterUsername)
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {report.reporterName || report.reporterUsername}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-slate-600 dark:text-slate-300">
                    {report.ownerName || "N/A"}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <span
                        className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1"
                        title={report.reason}
                      >
                        {report.reason}
                      </span>
                      {/* AI Mini Badge */}
                      {report.predictAI && (
                        <div className="flex items-center gap-1.5">
                          {report.predictAI === "negative" ? (
                            <Badge
                              variant="outline"
                              className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] h-7 px-1.5 gap-1"
                            >
                              <AlertCircle className="w-5 h-5" />
                              Vi phạm ( {(report.confidence * 100).toFixed(0)}%
                              )
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-7 px-1.5 gap-1"
                            >
                              <ShieldCheck className="w-5 h-5" />
                              An toàn( {(report.confidence * 100).toFixed(0)}% )
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                    {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${config.color} gap-1.5 py-1 px-2.5 font-medium border shadow-sm`}
                    >
                      {config.icon}
                      {config.label}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-muted hover:text-indigo-500 rounded-full"
                      onClick={() => onSelectReport(report)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-40 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center gap-2">
                  <Flag className="w-8 h-8 opacity-20" />
                  <p>Không tìm thấy báo cáo nào</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    reports,
    isLoading,
    totalPages,
    totalElements,
    totalPending,
    totalProcessing,
    totalApproved,
    totalRejected,
    activeTab,
    statusFilter,
    currentPage,
    selectedReport,
    search,
  } = useAppSelector((state) => state.admin);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const getPagesToShow = () => {
    const totalPagesValue = totalPages || 1;
    const current = currentPage + 1; // 1-based for UI
    
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(
      fetchReportsAsync({
        type: activeTab,
        pageNo: currentPage,
        pageSize: 10,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        keyword: debouncedSearch || undefined,
      }),
    );
  }, [dispatch, currentPage, debouncedSearch, statusFilter, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
          <LayoutDashboard className="w-4 h-4" />
          <span className="uppercase tracking-widest text-xs">
            Hệ thống giám sát
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Quản lý{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            Vi phạm
          </span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Theo dõi và xử lý các báo cáo nội dung từ cộng đồng
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            label: "Tổng báo cáo",
            value: totalElements,
            color: "from-slate-700 to-slate-900",
            icon: <Flag />,
          },
          {
            label: "Đang chờ",
            value: totalPending,
            color: "from-amber-500 to-orange-600",
            icon: <Clock />,
          },
          {
            label: "Đang xem xét",
            value: totalProcessing,
            color: "from-blue-500 to-indigo-600",
            icon: <Search />,
          },
          {
            label: "Đã duyệt",
            value: totalApproved,
            color: "from-emerald-500 to-teal-600",
            icon: <CheckCircle2 />,
          },
          {
            label: "Từ chối",
            value: totalRejected,
            color: "from-rose-500 to-red-600",
            icon: <XCircle />,
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow cursor-default"
          >
            <CardContent className={`p-0 bg-gradient-to-br ${stat.color}`}>
              <div className="p-5 text-white flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-black">{stat.value}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => dispatch(setActiveTab(val as any))}
        className="w-full space-y-6"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
          <TabsList className="bg-muted p-1 h-auto rounded-xl flex flex-wrap gap-1">
            {[
              { val: "user", icon: <User />, label: "Thành viên" },
              { val: "post", icon: <FileText />, label: "Bài viết" },
              { val: "reel", icon: <FilmIcon />, label: "Thước phim" },
              { val: "comment", icon: <MessageCircle />, label: "Bình luận" },
            ].map((t) => (
              <TabsTrigger
                key={t.val}
                value={t.val}
                className="rounded-lg px-3 sm:px-6 py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1 sm:gap-2 font-bold transition-all text-xs sm:text-sm"
              >
                {t.icon} {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm tên người dùng, lý do..."
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className="pl-10 h-11 bg-background border-border text-foreground rounded-xl"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => dispatch(setStatusFilter(val as any))}
            >
              <SelectTrigger className="w-44 h-11 rounded-xl bg-background border-border text-foreground hover:bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" hideIcon className="focus:bg-primary/15 focus:text-primary cursor-pointer">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING" hideIcon className="focus:bg-primary/15 focus:text-primary cursor-pointer">Chờ xử lý</SelectItem>
                <SelectItem value="IN_REVIEW" hideIcon className="focus:bg-primary/15 focus:text-primary cursor-pointer">Đang xem xét</SelectItem>
                <SelectItem value="APPROVED" hideIcon className="focus:bg-primary/15 focus:text-primary cursor-pointer">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED" hideIcon className="focus:bg-primary/15 focus:text-primary cursor-pointer">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {["user", "post", "reel", "comment"].map((tab) => (
          <TabsContent
            key={tab}
            value={tab}
            className="mt-0 focus-visible:ring-0"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 bg-card rounded-3xl border border-dashed border-border">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium animate-pulse">
                  Đang truy xuất dữ liệu...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ReportTable
                  data={reports}
                  onSelectReport={(r) => dispatch(setSelectedReport(r))}
                  reportType={tab}
                />

                {totalElements > 0 && (
                  <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg gap-1 px-3"
                            onClick={() =>
                              dispatch(setCurrentPage(Math.max(currentPage - 1, 0)))
                            }
                            disabled={currentPage === 0 || totalElements === 0}
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
                                variant={page === currentPage + 1 ? "default" : "ghost"}
                                size="sm"
                                className={`w-9 h-9 p-0 rounded-lg ${page === currentPage + 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-none" : ""}`}
                                onClick={() => dispatch(setCurrentPage((page as number) - 1))}
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
                            onClick={() => {
                              const maxPages = totalPages || 1;
                              dispatch(setCurrentPage(Math.min(currentPage + 1, maxPages - 1)));
                            }}
                            disabled={currentPage >= (totalPages || 1) - 1}
                          >
                            Sau <ChevronRight className="w-4 h-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialogs */}
      {selectedReport && activeTab === "user" && (
        <UserReportDetailDialog
          open={!!selectedReport}
          onOpenChange={(open) => !open && dispatch(setSelectedReport(null))}
          report={selectedReport as UserReport}
          onStatusUpdate={() => {
            dispatch(setSelectedReport(null));
            // Refresh the reports list
            dispatch(
              fetchReportsAsync({
                type: activeTab,
                pageNo: currentPage,
                pageSize: 10,
                status: statusFilter === "ALL" ? undefined : statusFilter,
                keyword: debouncedSearch || undefined,
              }),
            );
          }}
        />
      )}

      {selectedReport && activeTab !== "user" && (
        <ReportDetailDialog
          open={!!selectedReport}
          onOpenChange={(open) => !open && dispatch(setSelectedReport(null))}
          reportId={(selectedReport as PostReelReport).id}
          reportType={activeTab}
          onStatusUpdate={() => {
            dispatch(setSelectedReport(null));
            // Refresh the reports list
            dispatch(
              fetchReportsAsync({
                type: activeTab,
                pageNo: currentPage,
                pageSize: 10,
                status: statusFilter === "ALL" ? undefined : statusFilter,
                keyword: debouncedSearch || undefined,
              }),
            );
          }}
        />
      )}
    </div>
  );
}
