import { useState } from "react";
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
import { CheckCircle, XCircle, Flag, User, FileText, Trash2, Lock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReportDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: {
    id: string;
    reporter: string;
    reportedType: string;
    reportedUser: string;
    reason: string;
    status: string;
    date: string;
    avatar: string;
    detailedReason?: string;
    evidenceImages?: string[];
    reportedContent?: string;
    reportedMediaUrl?: string;
    reportedUserAvatar?: string;
  };
}

export function ReportDetailDialog({ open, onOpenChange, report }: ReportDetailDialogProps) {
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "warning" as const,
      processing: "default" as const,
      resolved: "success" as const,
    };
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
    const Icon = icons[type as keyof typeof icons] || Flag;
    return <Icon className="w-4 h-4" />;
  };

  const handleApprove = () => {
    setProcessing(true);
    // Handle approval logic
    console.log("Approving report:", report.id, "Note:", adminNote);
    setTimeout(() => {
      setProcessing(false);
      onOpenChange(false);
    }, 1000);
  };

  const handleReject = () => {
    setProcessing(true);
    // Handle rejection logic
    console.log("Rejecting report:", report.id, "Note:", adminNote);
    setTimeout(() => {
      setProcessing(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết báo cáo
            <Badge variant={getStatusBadge(report.status)}>
              {getStatusText(report.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Reporter Info */}
            <div>
              <h4 className="font-semibold mb-3">Người báo cáo</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={report.avatar} />
                  <AvatarFallback>{report.reporter[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{report.reporter}</p>
                  <p className="text-sm text-muted-foreground">{report.date}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reported Object */}
            <div>
              <h4 className="font-semibold mb-3">Đối tượng bị báo cáo</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getReportedTypeIcon(report.reportedType)}
                    <span className="ml-1">{report.reportedType}</span>
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  {report.reportedUserAvatar && (
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={report.reportedUserAvatar} />
                      <AvatarFallback>{report.reportedUser[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-medium">{report.reportedUser}</p>
                    <p className="text-sm text-muted-foreground">Người bị báo cáo</p>
                  </div>
                </div>

                {/* Reported Content */}
                {report.reportedContent && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-2">Nội dung bị báo cáo:</p>
                    <p className="text-sm">{report.reportedContent}</p>
                  </div>
                )}

                {/* Reported Media */}
                {report.reportedMediaUrl && (
                  <div className="rounded-lg overflow-hidden border">
                    {report.reportedType === "reel" ? (
                      <video 
                        src={report.reportedMediaUrl} 
                        controls 
                        className="w-full max-h-[300px] object-contain"
                      >
                        Trình duyệt không hỗ trợ video
                      </video>
                    ) : (
                      <img 
                        src={report.reportedMediaUrl} 
                        alt="Reported content" 
                        className="w-full max-h-[300px] object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Reason */}
            <div>
              <h4 className="font-semibold mb-3">Lý do báo cáo</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium text-sm mb-1">Danh mục:</p>
                  <p className="text-sm">{report.reason}</p>
                </div>

                {report.detailedReason && (
                  <div className="p-3 rounded-lg border">
                    <p className="font-medium text-sm mb-1">Chi tiết:</p>
                    <p className="text-sm whitespace-pre-wrap">{report.detailedReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Images */}
            {report.evidenceImages && report.evidenceImages.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Ảnh chứng minh ({report.evidenceImages.length})</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {report.evidenceImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="rounded-lg border w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {report.status === "pending" && (
              <>
                <Separator />
                <div>
                  <Label htmlFor="admin-note">Ghi chú của admin</Label>
                  <Textarea
                    id="admin-note"
                    placeholder="Thêm ghi chú về quyết định xử lý..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant="default" 
                    onClick={handleApprove}
                    disabled={processing}
                    className="bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt báo cáo
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleReject}
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={processing}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Khóa tài khoản
                  </Button>
                </div>
              </>
            )}

            {report.status === "processing" && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium">Báo cáo đang được xử lý</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vui lòng hoàn tất xử lý hoặc chuyển trạng thái
                  </p>
                </div>
              </>
            )}

            {report.status === "resolved" && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm font-medium text-success">Báo cáo đã được xử lý</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Không còn hành động nào cần thực hiện
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
