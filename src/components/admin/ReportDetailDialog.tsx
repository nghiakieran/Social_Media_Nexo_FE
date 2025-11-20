import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import MediaSlider from "@/features/post/components/MediaSlider";
import {
  CheckCircle,
  XCircle,
  Flag,
  User,
  FileText,
  Trash2,
  Lock,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  getPostReportById,
  getReelReportById,
  handelPostReportById,
  handelReelReportById,
} from "@/features/admin/api/reportManagementAPI";

interface ReportDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number;
  reportType: string;
}

export function ReportDetailDialog({
  open,
  onOpenChange,
  reportId,
  reportType,
}: ReportDetailDialogProps) {
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "warning" as const,
      in_review: "default" as const,
      approved: "success" as const,
      rejected: "destructive" as const,
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  const fetchReport = async () => {
    if (!reportId || !reportType) return;

    setLoading(true);
    console.log("Fetching report:", reportId, reportType);
    try {
      if (reportType === "post") {
        const res = await getPostReportById(reportId);
        setReport(res);
        setAdminNote(res.note || "");
      } else if (reportType === "reel") {
        const res = await getReelReportById(reportId);
        setReport(res);
        setAdminNote(res.note || "");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReport();
  }, [reportId, reportType]);

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

  const mediaItems = useMemo(() => {
    if (!report?.mediaUrls || !Array.isArray(report.mediaUrls)) return [];

    return report.mediaUrls.map((url, index) => {
      const isVideo = url.endsWith(".mp4") || url.includes(".m3u8");

      return {
        id: `post-media-${report?.id ?? "loading"}-${index}`,
        type: isVideo ? "video" : "image",
        url,
        alt: `Post media ${index + 1}`,
      };
    });
  }, [report?.id, report?.mediaUrls]);

  const handleChangeStatus = async (newStatus: string) => {
    if (!report) return;
    setProcessing(true);

    try {
      if (reportType === "post") {
        await handelPostReportById(report.id, newStatus, adminNote);
      } else if (reportType === "reel") {
        await handelReelReportById(report.id, newStatus, adminNote);
      }

      setReport({ ...report, reportStatus: newStatus });
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !report) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đang tải...</DialogTitle>
          </DialogHeader>

          <p className="text-center py-6">Đang tải dữ liệu báo cáo...</p>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết báo cáo
            <Badge
              variant={getStatusBadge(report?.reportStatus?.toLowerCase())}
            >
              {report?.reportStatus}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Reporter */}
            <div>
              <h4 className="font-semibold mb-3">Người báo cáo</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={report?.reporterAvatarUrl} />
                  <AvatarFallback>
                    {report?.reporterName?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{report?.reporterName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(report?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reported object */}
            <div>
              <h4 className="font-semibold mb-3">Đối tượng bị báo cáo</h4>

              <Badge variant="outline">
                <FileText className="w-4 h-4" />
                <span className="ml-1">{report?.reportedType}</span>
              </Badge>

              <div className="flex items-center gap-3 p-3 rounded-lg border mt-3">
                {report?.ownerPostAvatarUrl && (
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={report.ownerPostAvatarUrl} />
                    <AvatarFallback>
                      {report?.ownerPostName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <p className="font-medium">{report?.ownerPostName}</p>
                  <p className="text-sm text-muted-foreground">
                    Người bị báo cáo
                  </p>
                </div>
              </div>

              {report?.caption && (
                <div className="p-3 rounded-lg bg-muted mt-3">
                  <p className="font-medium text-sm mb-2">
                    Nội dung bị báo cáo:
                  </p>
                  <p className="text-sm">{report?.caption}</p>
                </div>
              )}
            </div>

            {mediaItems.length > 0 && (
              <div className="rounded-lg overflow-hidden bg-black/5 border">
                <MediaSlider
                  media={mediaItems}
                  className="w-full aspect-auto max-h-[500px]"
                />
              </div>
            )}
            <Separator />

            {/* Reason */}
            <div>
              <h4 className="font-semibold mb-3">Lý do báo cáo</h4>

              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-sm mb-1">Danh mục:</p>
                <p className="text-sm">{report?.reason}</p>
              </div>

              {report?.detailedReason && (
                <div className="p-3 rounded-lg border mt-3">
                  <p className="font-medium text-sm mb-1">Chi tiết:</p>
                  <p className="text-sm">{report?.detail}</p>
                </div>
              )}
            </div>

            <Label className="mt-4">Ghi chú của admin</Label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập ghi chú xử lý..."
              className="mt-2"
            />
            {/* Pending actions */}
            {report?.reportStatus === "PENDING" && (
              <>
                <Separator />

                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-300">
                  <p className="text-sm font-semibold text-yellow-800">
                    Báo cáo đang chờ xử lý
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Vui lòng xem xét nội dung để đưa ra quyết định.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 justify-end">
                  {/* Nút bắt đầu xử lý */}
                  <Button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    disabled={processing}
                    onClick={() => handleChangeStatus("IN_REVIEW")}
                  >
                    <Flag className="w-4 h-4" />
                    Đang xử lý
                  </Button>

                  {/* Nút duyệt */}
                  <Button
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors"
                    disabled={processing}
                    onClick={() => handleChangeStatus("APPROVED")}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Duyệt báo cáo
                  </Button>

                  {/* Nút từ chối */}
                  <Button
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white transition-colors"
                    disabled={processing}
                    onClick={() => handleChangeStatus("REJECTED")}
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </Button>
                </div>
              </>
            )}

            {report?.reportStatus === "IN_REVIEW" && (
              <>
                <Separator />

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-300">
                  <p className="text-sm font-semibold text-blue-800">
                    Báo cáo đang được xử lý
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Báo cáo đang được cân nhắc để xử lý.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 justify-end">
                  {/* Nút duyệt */}
                  <Button
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors"
                    disabled={processing}
                    onClick={() => handleChangeStatus("APPROVED")}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Duyệt báo cáo
                  </Button>

                  {/* Nút từ chối */}
                  <Button
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white transition-colors"
                    disabled={processing}
                    onClick={() => handleChangeStatus("REJECTED")}
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </Button>
                </div>
              </>
            )}

            {report?.reportStatus === "APPROVED" && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-green-100 border border-green-300">
                  <p className="text-sm font-semibold text-green-800">
                    Báo cáo đã được duyệt
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Nội dung vi phạm đã được xử lý theo quy định.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 justify-end">
                  {!report.isActive && (
                    <Button variant="outline" disabled={processing}>
                      <Lock className="w-4 h-4" />
                      Mở khóa bài viết
                    </Button>
                  )}
                </div>
              </>
            )}

            {report?.reportStatus === "REJECTED" && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-red-100 border border-red-300">
                  <p className="text-sm font-semibold text-red-800">
                    Báo cáo đã bị từ chối
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Báo cáo không hợp lệ hoặc không đủ cơ sở xử lý.
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
