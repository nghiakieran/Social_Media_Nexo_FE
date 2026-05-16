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
import {
  CheckCircle,
  XCircle,
  Flag,
  FileText,
  BrainCircuit,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Info,
  CheckCircle2,
  AlertCircle,
  Zap,
  Search,
  Clock,
  FileCheck,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  getCommentReportById,
  getPostReportById,
  getReelReportById,
  handelCommentReportById,
  handelPostReportById,
  handelReelReportById,
} from "@/features/admin/api/reportManagementAPI";
import MediaSlider from "@/features/post/components/MediaSlider";
import { useToast } from "@/hooks/use-toast";

export function ReportDetailDialog({
  open,
  onOpenChange,
  reportId,
  reportType,
  onStatusUpdate,
}: any) {
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // --- HÀM FETCH DỮ LIỆU ---
  const fetchReport = async () => {
    if (!reportId || !reportType) return;
    setLoading(true);
    try {
      let res;
      if (reportType === "post") res = await getPostReportById(reportId);
      else if (reportType === "reel") res = await getReelReportById(reportId);
      else res = await getCommentReportById(reportId);

      setReport(res);
      setAdminNote(res.note || "");
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchReport();
  }, [reportId, reportType, open]);

  // --- HÀM XỬ LÝ CẬP NHẬT TRẠNG THÁI (FIXED) ---
  const getStatusMessage = (status: string) => {
    const messages: {
      [key: string]: { icon: React.ReactNode; message: string };
    } = {
      APPROVED: {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        message: "Báo cáo đã được duyệt và nội dung sẽ được gỡ",
      },
      REJECTED: {
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        message: "Báo cáo đã bị từ chối, nội dung được giữ lại",
      },
      IN_REVIEW: {
        icon: <Search className="w-5 h-5 text-blue-600" />,
        message: "Báo cáo đang chờ xem xét kỹ hơn",
      },
      PENDING: {
        icon: <Clock className="w-5 h-5 text-amber-600" />,
        message: "Báo cáo đã được đặt lại trạng thái chờ xử lý",
      },
    };
    return (
      messages[status] || {
        icon: <FileCheck className="w-5 h-5 text-slate-600" />,
        message: "Trạng thái báo cáo đã được cập nhật",
      }
    );
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!report) return;
    setProcessing(true);

    try {
      if (reportType === "post") {
        await handelPostReportById(reportId, newStatus, adminNote);
      } else if (reportType === "reel") {
        await handelReelReportById(reportId, newStatus, adminNote);
      } else if (reportType === "comment") {
        await handelCommentReportById(reportId, newStatus, adminNote);
      }

      setReport((prev: any) => ({ ...prev, reportStatus: newStatus }));

      const statusMsg = getStatusMessage(newStatus);
      toast({
        title: "Cập nhật thành công",
        description: statusMsg.message,
        className:
          "border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg",
      });

      if (onStatusUpdate) {
        onStatusUpdate();
      }

      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      toast({
        title: "Lỗi xảy ra",
        description:
          err instanceof Error
            ? err.message
            : "Không thể cập nhật trạng thái. Vui lòng thử lại!",
        className:
          "border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAIStatus = (label: string) => {
    if (label === "negative")
      return {
        color: "text-red-600",
        bg: "bg-red-50",
        icon: <AlertTriangle className="w-4 h-4" />,
        text: "Vi phạm (Negative)",
      };
    if (label === "normal")
      return {
        color: "text-green-600",
        bg: "bg-green-50",
        icon: <ShieldCheck className="w-4 h-4" />,
        text: "An toàn (Normal)",
      };
    return {
      color: "text-gray-500",
      bg: "bg-gray-50",
      icon: <Info className="w-4 h-4" />,
      text: "Chưa phân tích",
    };
  };

  const aiInfo = getAIStatus(report?.predictAI);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium text-slate-600">
              Đang tải dữ liệu báo cáo...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden border-none shadow-2xl [&>button]:text-white [&>button]:hover:text-white [&>button]:bg-white/10 hover:[&>button]:bg-white/20 [&>button]:rounded-full">
        <DialogHeader className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
          <div className="flex justify-between items-center pr-10">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Flag className="w-6 h-6 text-red-400" />
              Chi tiết xử lý vi phạm
            </DialogTitle>
            <Badge className="text-sm px-4 py-1 bg-white/20 border-none text-white backdrop-blur-md italic">
              Trạng thái: {report?.reportStatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(95vh-100px)]">
          {/* CỘT TRÁI: NỘI DUNG VI PHẠM */}
          <div className="flex-1 bg-slate-50 overflow-y-auto border-r">
            <div className="p-6 space-y-6">
              <section>
                <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 block">
                  Nội dung hiển thị
                </Label>
                {report?.mediaUrls?.length > 0 ? (
                  <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white">
                    <MediaSlider
                      media={report.mediaUrls.map((url: any, i: any) => ({
                        id: i,
                        type: url.includes(".mp4") ? "video" : "image",
                        url,
                      }))}
                      className="w-full aspect-video"
                    />
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400">
                    <FileText className="w-12 h-12 mb-2 opacity-20" />
                    <p>Báo cáo dạng văn bản</p>
                  </div>
                )}
                {(report?.caption || report?.content) && (
                  <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                    <p className="text-slate-700 leading-relaxed italic">
                      "{report?.caption || report?.content}"
                    </p>
                  </div>
                )}
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <Label className="text-xs text-slate-400 block mb-2">
                    Người báo cáo
                  </Label>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={report?.reporterAvatarUrl} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">
                        {report?.reporterName}
                      </p>
                      <p className="text-[10px] flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" />{" "}
                        {formatDate(report?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <Label className="text-xs text-slate-400 block mb-2">
                    Người bị báo cáo
                  </Label>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={report?.ownerPostAvatarUrl} />
                      <AvatarFallback>O</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-red-600">
                        {report?.ownerPostName || report?.ownerCommentName}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        ID: #{report?.id}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h4 className="text-amber-800 font-bold flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" /> Lý do: {report?.reason}
                </h4>
                <p className="text-sm text-amber-700">
                  {report?.detail || "Không có mô tả chi tiết."}
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: AI & ACTION */}
          <div className="w-80 bg-white p-6 flex flex-col shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
            <ScrollArea className="flex-1">
              <div className="space-y-8">
                {/* AI INSIGHT CARD */}
                <div
                  className={`p-5 rounded-2xl border-2 ${aiInfo.bg} ${aiInfo.color.replace("text", "border")}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`p-2 rounded-lg ${aiInfo.color.replace("text", "bg").replace("600", "100")}`}
                    >
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase text-xs tracking-tighter">
                      AI Moderation
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-bold">
                        <span>Trạng thái</span>
                        <span className={aiInfo.color}>{aiInfo.text}</span>
                      </div>
                    </div>

                    {report?.confidence && (
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 opacity-70">
                          <span>Độ tin cậy</span>
                          <span>{(report.confidence * 100).toFixed(2)}%</span>
                        </div>
                        <Progress
                          value={report.confidence * 100}
                          className={`h-2 ${report.predictAI === "negative" ? "bg-red-100" : "bg-green-100"}`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Ghi chú điều hành
                  </Label>
                  <Textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Nhập lý do xử lý..."
                    className="min-h-[120px] bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </ScrollArea>

            {/* ACTION BUTTONS */}
            <div className="pt-6 space-y-2">
              {report?.reportStatus === "PENDING" ||
                report?.reportStatus === "IN_REVIEW" ? (
                <>
                  <Button
                    className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-12 shadow-lg transition-all active:scale-95"
                    onClick={() => handleChangeStatus("APPROVED")}
                    disabled={processing}
                  >
                    {processing ? (
                      "Đang xử lý..."
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" /> Duyệt & Gỡ nội
                        dung
                      </>
                    )}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => handleChangeStatus("REJECTED")}
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Từ chối
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleChangeStatus("IN_REVIEW")}
                      disabled={
                        processing || report?.reportStatus === "IN_REVIEW"
                      }
                    >
                      Xem xét
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-slate-100 rounded-xl text-center border border-dashed border-slate-300">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Đã hoàn tất xử lý
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
