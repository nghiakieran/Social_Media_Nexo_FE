import { useState } from "react";
import { AlertTriangle, Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReportPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onReport: (postId: string, reason: string, details?: string) => void;
  title?: string;
}

const reportReasons = [
  {
    id: "spam",
    label: "Spam hoặc quảng cáo không mong muốn",
    description: "Nội dung spam, quảng cáo lừa đảo",
  },
  {
    id: "harassment",
    label: "Quấy rối hoặc bắt nạt",
    description: "Nội dung quấy rối, đe dọa, bắt nạt",
  },
  {
    id: "hate-speech",
    label: "Ngôn từ thù địch",
    description: "Phân biệt chủng tộc, tôn giáo, giới tính",
  },
  {
    id: "violence",
    label: "Bạo lực hoặc nội dung có hại",
    description: "Khuyến khích bạo lực, tự tử, tự hại",
  },
  {
    id: "misinformation",
    label: "Thông tin sai lệch",
    description: "Tin giả, thông tin gây hiểu lầm",
  },
  {
    id: "inappropriate",
    label: "Nội dung không phù hợp",
    description: "Nội dung khiêu dâm, bạo lực đồ họa",
  },
  {
    id: "copyright",
    label: "Vi phạm bản quyền",
    description: "Sử dụng trái phép nội dung có bản quyền",
  },
  {
    id: "other",
    label: "Khác",
    description: "Lý do khác không được liệt kê ở trên",
  },
];

export const ReportPostDialog = ({
  isOpen,
  onClose,
  postId,
  onReport,
  title,
}: ReportPostDialogProps) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn lý do",
        description: "Bạn cần chọn ít nhất một lý do để báo cáo.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const reason =
        reportReasons.find((r) => r.id === selectedReason)?.label || "";
      onReport(postId, reason, details.trim());

      toast({
        title: "Báo cáo đã được gửi",
        description:
          "Chúng tôi sẽ xem xét báo cáo của bạn trong thời gian sớm nhất.",
      });

      handleClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSelectedReason("");
      setDetails("");
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* Thêm max-h-[85vh] và flex-col để Dialog không vượt quá màn hình */}
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Flag className="w-5 h-5" />
            {title ?? "Báo cáo bài viết"}
          </DialogTitle>
        </DialogHeader>

        {/* Phần nội dung chính có thể cuộn (overflow-y-auto) */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="space-y-4">
            <Alert className="flex items-center gap-3 py-3 [&>svg]:static [&>svg]:text-foreground [&>svg~*]:pl-0 [&>svg+div]:translate-y-0">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs">
                Báo cáo này sẽ được gửi đến đội ngũ kiểm duyệt để xem xét.
              </AlertDescription>
            </Alert>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                Chọn lý do báo cáo:
              </Label>
              <RadioGroup
                value={selectedReason}
                onValueChange={setSelectedReason}
                className="space-y-3"
              >
                {reportReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={cn(
                      "flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer",
                      selectedReason === reason.id
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-primary/5"
                    )}
                    onClick={() => setSelectedReason(reason.id)}
                  >
                    <RadioGroupItem
                      value={reason.id}
                      id={reason.id}
                    />
                    <div className="grid gap-1.5 leading-none w-full">
                      <Label
                        htmlFor={reason.id}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {reason.label}
                      </Label>
                      <p className="text-xs text-muted-foreground cursor-pointer">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Chi tiết bổ sung (tùy chọn)
              </Label>
              <Textarea
                placeholder="Mô tả thêm về vấn đề bạn gặp phải..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={500}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer giữ cố định ở dưới cùng */}
        <DialogFooter className="p-6 pt-2 mt-auto border-t bg-background z-10">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 transition-colors border-none"
          >

            {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
