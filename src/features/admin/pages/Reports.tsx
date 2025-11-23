import { useState, useEffect } from "react";
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
  Clock, // Add Clock Icon for IN_REVIEW
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportDetailDialog } from "@/components/admin/ReportDetailDialog";
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
  fetchReportsByType,
  ReportSummary,
} from "@/features/admin/api/reportManagementAPI";

// Mapping Status
const STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  IN_REVIEW: { label: "Đang xem xét", color: "bg-blue-100 text-blue-800" },
  APPROVED: { label: "Đã duyệt", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800" },
};

const getStatusConfig = (status) =>
  STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-800" };

const ReportTable = ({ data, onSelectReport }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Người báo cáo</TableHead>
        <TableHead>Đối tượng bị báo cáo</TableHead>
        <TableHead>Lý do</TableHead>
        <TableHead>Ngày tạo</TableHead>
        <TableHead>Trạng thái</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.length > 0 ? (
        data.map((report) => {
          const statusConfig = getStatusConfig(report.reportStatus);
          return (
            <TableRow key={report.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {/* Placeholder Avatar or fetch from API if available */}
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                    {report.reporterName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="font-medium">{report.reporterName}</span>
                </div>
              </TableCell>
              <TableCell>{report.ownerPostName}</TableCell>
              <TableCell className="max-w-xs truncate" title={report.reason}>
                {report.reason}
              </TableCell>
              <TableCell>
                {new Date(report.createdAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    getStatusConfig(report.reportStatus).color
                  }`}
                >
                  {getStatusConfig(report.reportStatus).label}
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalProcessing, setTotalProcessing] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [search, setSearch] = useState("");
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL", "PENDING", "APPROVED", "REJECTED", "IN_REVIEW"
  const [activeTab, setActiveTab] = useState("post"); // "user", "post", "reel", "comment" (if applicable)
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, statusFilter, activeTab]);

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Map UI status to API status (or undefined if ALL)
        const apiStatus = statusFilter === "ALL" ? undefined : statusFilter;

        // Map UI tab to API type ('post' | 'reel' | 'user')
        // Note: 'comment' is not yet in API, handle if needed or hide tab
        let apiType = activeTab;
        if (activeTab === "comment") {
          // Placeholder logic or fetch 'post' temporarily
          apiType = "post";
        }

        const data = await fetchReportsByType(apiType, {
          pageNo: currentPage,
          pageSize: 10,
          status: apiStatus,
          keyword: debouncedSearch,
        });

        setReports(data.reportSummaries.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(
          data.pendingQuantity +
            data.processingQuantity +
            data.approvedQuantity +
            data.rejectQuantity || 0
        );
        setTotalPending(data.pendingQuantity || 0);
        setTotalProcessing(data.processingQuantity || 0);
        setTotalApproved(data.approvedQuantity || 0);
        setTotalRejected(data.rejectQuantity || 0);
      } catch (error) {
        console.error("Failed to fetch reports", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, debouncedSearch, statusFilter, activeTab]);

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList>
            {/* <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Người dùng
            </TabsTrigger> */}
            <TabsTrigger value="post" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Bài viết
            </TabsTrigger>
            <TabsTrigger value="reel" className="flex items-center gap-2">
              <FilmIcon className="w-4 h-4" /> Thước phim
            </TabsTrigger>
            {/* Hide Comment tab if API not ready */}
            {/* <TabsTrigger value="comment" className="flex items-center gap-2">
              <Flag className="w-4 h-4" /> Bình luận
            </TabsTrigger> */}
          </TabsList>

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
        {["user", "post", "reel"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            <Card>
              <CardHeader>
                <CardTitle>
                  Danh sách báo cáo{" "}
                  {tabValue === "user"
                    ? "người dùng"
                    : tabValue === "post"
                    ? "bài viết"
                    : "thước phim"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">Đang tải dữ liệu...</div>
                ) : (
                  <>
                    <ReportTable
                      data={reports}
                      onSelectReport={setSelectedReport}
                    />
                    <PaginationFooter
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {selectedReport && (
        <ReportDetailDialog
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          reportId={selectedReport.id}
          reportType={activeTab}
        />
      )}
    </div>
  );
}
