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
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  IN_REVIEW: {
    label: "Đang xem xét",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Search className="w-3 h-3" />,
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const ReportTable = ({ data, onSelectReport, reportType = "post" }) => {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="font-bold text-slate-700">
              Người báo cáo
            </TableHead>
            <TableHead className="font-bold text-slate-700">
              {reportType === "user"
                ? "Đối tượng bị tố cáo"
                : "Chủ sở hữu nội dung"}
            </TableHead>
            <TableHead className="font-bold text-slate-700">
              Lý do & AI Phân tích
            </TableHead>
            <TableHead className="font-bold text-slate-700">Ngày tạo</TableHead>
            <TableHead className="font-bold text-slate-700">
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
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                        {(report.reporterName || report.reporterUsername)
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {report.reporterName || report.reporterUsername}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-slate-600">
                    {report.ownerName || "N/A"}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <span
                        className="text-sm text-slate-700 line-clamp-1"
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
                              className="bg-red-50 text-red-600 border-red-200 text-[10px] h-7 px-1.5 gap-1"
                            >
                              <AlertCircle className="w-5 h-5" />
                              Vi phạm ( {(report.confidence * 100).toFixed(0)}%
                              )
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600 border-green-200 text-[10px] h-7 px-1.5 gap-1"
                            >
                              <ShieldCheck className="w-5 h-5" />
                              An toàn( {(report.confidence * 100).toFixed(0)}% )
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-500 text-sm">
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
                      className="hover:bg-indigo-50 hover:text-indigo-600 rounded-full"
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
                className="h-40 text-center text-slate-400"
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
    <div className="space-y-8 p-2">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
            <LayoutDashboard className="w-5 h-5" />
            <span className="uppercase tracking-widest text-xs">
              Hệ thống giám sát
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Quản lý{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Vi phạm
            </span>
          </h1>
          <p className="text-slate-500 font-medium">
            Theo dõi và xử lý các báo cáo nội dung từ cộng đồng
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
          <TabsList className="bg-slate-100 p-1 h-12 rounded-xl">
            {[
              { val: "user", icon: <User />, label: "Thành viên" },
              { val: "post", icon: <FileText />, label: "Bài viết" },
              { val: "reel", icon: <FilmIcon />, label: "Thước phim" },
              { val: "comment", icon: <MessageCircle />, label: "Bình luận" },
            ].map((t) => (
              <TabsTrigger
                key={t.val}
                value={t.val}
                className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 font-bold transition-all"
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
                className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-indigo-500"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => dispatch(setStatusFilter(val as any))}
            >
              <SelectTrigger className="w-44 h-11 rounded-xl bg-slate-50">
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
              <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-3xl border border-dashed">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">
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

                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border shadow-sm">
                  <span className="text-sm font-medium text-slate-500 italic">
                    Hiển thị {reports.length} trên tổng số {totalElements} kết
                    quả
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-9"
                      onClick={() =>
                        dispatch(setCurrentPage(Math.max(currentPage - 1, 0)))
                      }
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(totalPages, 5) }).map(
                        (_, i) => (
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "ghost"}
                            size="sm"
                            className="w-9 h-9 p-0 rounded-lg"
                            onClick={() => dispatch(setCurrentPage(i))}
                          >
                            {i + 1}
                          </Button>
                        ),
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-9"
                      onClick={() =>
                        dispatch(
                          setCurrentPage(
                            Math.min(currentPage + 1, totalPages - 1),
                          ),
                        )
                      }
                      disabled={currentPage >= totalPages - 1}
                    >
                      Sau <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
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
