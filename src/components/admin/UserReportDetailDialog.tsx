import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
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
import { CheckCircle, XCircle, User, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppDispatch } from "@/store";
import { updateUserReportStatusAsync } from "@/features/admin/adminSlice";
import { useToast } from "@/hooks/use-toast";

interface UserReportDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: {
    reporterId: number;
    reporterUsername: string;
    reportedId: number;
    reportedUsername: string;
    reason: string;
    status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED";
    createdAt: string;
  };
  onStatusUpdate?: (newStatus?: string) => void;
}

export function UserReportDetailDialog({
  open,
  onOpenChange,
  report,
  onStatusUpdate,
}: UserReportDetailDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(report.status);
  const { toast } = useToast();

  // Update local status when report prop changes
  useEffect(() => {
    setCurrentStatus(report.status);
  }, [report.status]);

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "secondary" as const,
      IN_REVIEW: "default" as const,
      APPROVED: "default" as const,
      REJECTED: "destructive" as const,
      CLOSED: "outline" as const,
    };
    return variants[status as keyof typeof variants] || "secondary";
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

  const handleChangeStatus = async (newStatus: string) => {
    if (!report) return;
    setProcessing(true);

    try {
      await dispatch(
        updateUserReportStatusAsync({
          reporterId: report.reporterId,
          reportedId: report.reportedId,
          status: newStatus as
            | "PENDING"
            | "IN_REVIEW"
            | "APPROVED"
            | "REJECTED"
            | "CLOSED",
        })
      ).unwrap();

      // Update local status immediately for better UX
      setCurrentStatus(newStatus as typeof report.status);

      toast({
        title: "Thành công",
        description: "Trạng thái báo cáo đã được cập nhật",
      });

      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          err instanceof Error
            ? err.message
            : "Không thể cập nhật trạng thái. Vui lòng thử lại.",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!report) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết báo cáo người dùng
            <Badge variant={getStatusBadge(currentStatus)}>
              {currentStatus}
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
                  <AvatarFallback>
                    {report.reporterUsername?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{report.reporterUsername}</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {report.reporterId}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reported User */}
            <div>
              <h4 className="font-semibold mb-3">Người bị báo cáo</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {report.reportedUsername?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{report.reportedUsername}</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {report.reportedId}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reason */}
            <div>
              <h4 className="font-semibold mb-3">Lý do báo cáo</h4>
              <div className="p-3 rounded-lg border">
                <p className="text-sm whitespace-pre-wrap">{report.reason}</p>
              </div>
            </div>

            <Separator />

            {/* Created Date */}
            <div>
              <h4 className="font-semibold mb-3">Thông tin</h4>
              <div className="p-3 rounded-lg border">
                <p className="text-sm">
                  <span className="font-medium">Ngày tạo:</span>{" "}
                  {formatDate(report.createdAt)}
                </p>
              </div>
            </div>

            <Label className="mt-4">Ghi chú của admin</Label>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập ghi chú xử lý..."
              className="mt-2"
            />

            {/* Status Actions */}
            {currentStatus === "PENDING" && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="default"
                    onClick={() => handleChangeStatus("IN_REVIEW")}
                    disabled={processing}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Chuyển sang xem xét
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleChangeStatus("CLOSED")}
                    disabled={processing}
                  >
                    Đóng báo cáo
                  </Button>
                </div>
              </>
            )}

            {currentStatus === "IN_REVIEW" && (
              <>
                <Separator />
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="default"
                    onClick={() => handleChangeStatus("APPROVED")}
                    disabled={processing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt báo cáo
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleChangeStatus("REJECTED")}
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleChangeStatus("CLOSED")}
                    disabled={processing}
                  >
                    Đóng báo cáo
                  </Button>
                </div>
              </>
            )}

            {currentStatus === "APPROVED" && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-green-100 border border-green-300">
                  <p className="text-sm font-semibold text-green-800">
                    Báo cáo đã được duyệt
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Báo cáo đã được xử lý và chấp nhận.
                  </p>
                </div>
              </>
            )}

            {currentStatus === "REJECTED" && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-red-100 border border-red-300">
                  <p className="text-sm font-semibold text-red-800">
                    Báo cáo đã bị từ chối
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Báo cáo không được chấp nhận.
                  </p>
                </div>
              </>
            )}

            {currentStatus === "CLOSED" && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
                  <p className="text-sm font-semibold text-gray-800">
                    Báo cáo đã được đóng
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Báo cáo đã được đóng và không còn hoạt động.
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
