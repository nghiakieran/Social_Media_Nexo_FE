import { useState } from "react";
import { Search, Filter, MoreHorizontal, Eye, CheckCircle, XCircle, Flag, User, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportDetailDialog } from "@/components/admin/ReportDetailDialog";
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

const mockReports = [
  {
    id: "1",
    reporter: "Nguyễn Văn A",
    reportedType: "post",
    reportedUser: "Trần Thị B",
    reason: "Nội dung không phù hợp",
    status: "pending",
    date: "2024-11-10",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    reportedUserAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    detailedReason: "Bài viết chứa hình ảnh nhạy cảm không phù hợp với cộng đồng. Đã nhiều người báo cáo về vấn đề này.",
    reportedContent: "Nội dung bài viết có hình ảnh không phù hợp...",
    reportedMediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    evidenceImages: [
      "https://images.unsplash.com/photo-1516841273335-e39b37888115?w=400",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    ],
  },
  {
    id: "2",
    reporter: "Lê Văn C",
    reportedType: "user",
    reportedUser: "Phạm Thị D",
    reason: "Spam",
    status: "processing",
    date: "2024-11-09",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    reportedUserAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
    detailedReason: "Tài khoản này liên tục gửi tin nhắn spam quảng cáo sản phẩm không rõ nguồn gốc.",
    evidenceImages: [
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    ],
  },
  {
    id: "3",
    reporter: "Hoàng Thị E",
    reportedType: "comment",
    reportedUser: "Vũ Văn F",
    reason: "Ngôn từ bạo lực",
    status: "resolved",
    date: "2024-11-08",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    reportedUserAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
    detailedReason: "Bình luận chứa ngôn từ thô tục, đe dọa người khác.",
    reportedContent: "Bình luận có nội dung đe dọa và xúc phạm...",
    evidenceImages: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    ],
  },
];

export default function Reports() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "warning",
      processing: "default",
      resolved: "success",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Chưa xử lý",
      processing: "Đang xử lý",
      resolved: "Đã xử lý",
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getReportedTypeIcon = (type: string) => {
    const icons = {
      post: FileText,
      user: User,
      comment: Flag,
    };
    return icons[type as keyof typeof icons] || Flag;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Báo cáo & Vi phạm
        </h1>
        <p className="text-muted-foreground">Xử lý các báo cáo từ người dùng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockReports.length}</div>
            <div className="text-sm text-muted-foreground">Tổng báo cáo</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {mockReports.filter(r => r.status === "pending").length}
            </div>
            <div className="text-sm text-muted-foreground">Chưa xử lý</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {mockReports.filter(r => r.status === "processing").length}
            </div>
            <div className="text-sm text-muted-foreground">Đang xử lý</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {mockReports.filter(r => r.status === "resolved").length}
            </div>
            <div className="text-sm text-muted-foreground">Đã xử lý</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Danh sách báo cáo</CardTitle>
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
                  <SelectItem value="pending">Chưa xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã xử lý</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người báo cáo</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>Người bị báo cáo</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReports.map((report) => {
                const TypeIcon = getReportedTypeIcon(report.reportedType);
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={report.avatar}
                          alt={report.reporter}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="font-medium">{report.reporter}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {report.reportedType}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.reportedUser}</TableCell>
                    <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(report.status)}>
                        {getStatusText(report.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {report.status === "pending" && (
                            <>
                              <DropdownMenuItem>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Duyệt báo cáo
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="w-4 h-4 mr-2" />
                                Từ chối
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedReport && (
        <ReportDetailDialog
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          report={selectedReport}
        />
      )}
    </div>
  );
}
