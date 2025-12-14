import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  FilmIcon,
  Clock,
  MessageCircle, // Add Clock Icon for IN_REVIEW
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

// Mapping Status
const STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  IN_REVIEW: { label: "Đang xem xét", color: "bg-blue-100 text-blue-800" },
  APPROVED: { label: "Đã duyệt", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800" },
};

const getStatusConfig = (status) =>
  STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-800" };

const ReportTable = ({ data, onSelectReport, reportType = "post" }) => {
  // Xử lý format khác nhau cho user reports vs post/reel reports
  const getReporterName = (report) => {
    if (reportType === "user") {
      return report.reporterUsername || "N/A";
    }
    return report.reporterName || "N/A";
  };

  const getReportedName = (report) => {
    if (reportType === "user") {
      return report.reportedUsername || "N/A";
    }
    return report.ownerPostName || "N/A";
  };

  const getStatus = (report) => {
    if (reportType === "user") {
      return report.status || "PENDING";
    }
    return report.reportStatus || "PENDING";
  };

  const getReportId = (report) => {
    if (reportType === "user") {
      // User reports không có id duy nhất, dùng composite key
      return `${report.reporterId}-${report.reportedId}`;
    }
    return report.id;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Người báo cáo</TableHead>
          <TableHead>
            {reportType === "user"
              ? "Người bị báo cáo"
              : "Đối tượng bị báo cáo"}
          </TableHead>
          <TableHead>Lý do</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((report) => {
            const status = getStatus(report);
            const statusConfig = getStatusConfig(status);
            return (
              <TableRow key={getReportId(report)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                      {getReporterName(report)?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="font-medium">
                      {getReporterName(report)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getReportedName(report)}</TableCell>
                <TableCell className="max-w-xs truncate" title={report.reason}>
                  {report.reason}
                </TableCell>
                <TableCell>
                  {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectReport(report)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              Không có dữ liệu
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

const PaginationFooter = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-end space-x-2 py-4">
    <div className="flex-1 text-sm text-muted-foreground">
      Trang {currentPage + 1} / {totalPages || 1}
    </div>
    <div className="space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
        disabled={currentPage >= totalPages - 1}
      >
        Sau
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    reports,
    isLoading: loading,
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

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  useEffect(() => {
    const apiStatus = statusFilter === "ALL" ? undefined : statusFilter;
    const apiType = activeTab as "post" | "reel" | "user" | "comment";

    dispatch(
      fetchReportsAsync({
        type: apiType,
        pageNo: currentPage,
        pageSize: 10,
        status: apiStatus,
        keyword: debouncedSearch || undefined,
      })
    );
  }, [dispatch, currentPage, debouncedSearch, statusFilter, activeTab]);

  // Helper to count specific statuses (Mock logic for stats cards as API doesn't return counts yet)
  // Ideally, you'd have a separate stats API or the list API returns metadata.
  // For now, using totalElements as a general indicator or 0.
  const pendingCount = 0; // Placeholder
  const approvedCount = 0; // Placeholder
  const rejectedCount = 0; // Placeholder

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Báo cáo & Vi phạm
        </h1>
        <p className="text-muted-foreground">Xử lý các báo cáo từ người dùng</p>
      </div>

      {/* Thống kê - Currently using placeholders or derived data if possible */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalElements}</div>
            <div className="text-sm text-muted-foreground">
              Tổng báo cáo (Current Filter)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {totalPending}
            </div>
            <div className="text-sm text-muted-foreground">Chưa xử lý</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {totalProcessing}
            </div>
            <div className="text-sm text-muted-foreground">Đang xem xét</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {totalApproved}
            </div>
            <div className="text-sm text-muted-foreground">Đã duyệt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {totalRejected}
            </div>
            <div className="text-sm text-muted-foreground">Từ chối</div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          dispatch(setActiveTab(value as "post" | "reel" | "user" | "comment"))
        }
        className="w-full"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Người dùng
            </TabsTrigger>
            <TabsTrigger value="post" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Bài viết
            </TabsTrigger>
            <TabsTrigger value="reel" className="flex items-center gap-2">
              <FilmIcon className="w-4 h-4" /> Thước phim
            </TabsTrigger>
            <TabsTrigger value="comment" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Bình luận
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                dispatch(
                  setStatusFilter(
                    value as
                      | "ALL"
                      | "PENDING"
                      | "IN_REVIEW"
                      | "APPROVED"
                      | "REJECTED"
                  )
                )
              }
            >
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="IN_REVIEW">Đang xem xét</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content cho các Tabs - Sử dụng chung logic render vì cấu trúc bảng giống nhau */}
        {["user", "post", "reel", "comment"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            <Card>
              <CardHeader>
                <CardTitle>
                  Danh sách báo cáo{" "}
                  {tabValue === "user"
                    ? "người dùng"
                    : tabValue === "post"
                    ? "bài viết"
                    : tabValue === "reel"
                    ? "thước phim"
                    : "bình luận"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">Đang tải dữ liệu...</div>
                ) : (
                  <>
                    <ReportTable
                      data={reports}
                      onSelectReport={(report) =>
                        dispatch(setSelectedReport(report))
                      }
                      reportType={tabValue}
                    />
                    <PaginationFooter
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => dispatch(setCurrentPage(page))}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {selectedReport && activeTab === "user" && (
        <UserReportDetailDialog
          open={!!selectedReport}
          onOpenChange={(open) => !open && dispatch(setSelectedReport(null))}
          report={selectedReport as UserReport}
          onStatusUpdate={() => {
            // Refresh data after status update - Redux will automatically trigger refetch
            dispatch(setSelectedReport(null));
            // Trigger refetch by dispatching fetchReportsAsync again
            const apiStatus = statusFilter === "ALL" ? undefined : statusFilter;
            dispatch(
              fetchReportsAsync({
                type: activeTab,
                pageNo: currentPage,
                pageSize: 10,
                status: apiStatus,
                keyword: debouncedSearch || undefined,
              })
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
        />
      )}
    </div>
  );
}
