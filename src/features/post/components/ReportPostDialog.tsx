import { useState } from 'react';
import { AlertTriangle, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ReportPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onReport: (postId: string, reason: string, details?: string) => void;
}

const reportReasons = [
  {
    id: 'spam',
    label: 'Spam hoặc quảng cáo không mong muốn',
    description: 'Nội dung spam, quảng cáo lừa đảo',
  },
  {
    id: 'harassment',
    label: 'Quấy rối hoặc bắt nạt',
    description: 'Nội dung quấy rối, đe dọa, bắt nạt',
  },
  {
    id: 'hate-speech',
    label: 'Ngôn từ thù địch',
    description: 'Phân biệt chủng tộc, tôn giáo, giới tính',
  },
  {
    id: 'violence',
    label: 'Bạo lực hoặc nội dung có hại',
    description: 'Khuyến khích bạo lực, tự tử, tự hại',
  },
  {
    id: 'misinformation',
    label: 'Thông tin sai lệch',
    description: 'Tin giả, thông tin gây hiểu lầm',
  },
  {
    id: 'inappropriate',
    label: 'Nội dung không phù hợp',
    description: 'Nội dung khiêu dâm, bạo lực đồ họa',
  },
  {
    id: 'copyright',
    label: 'Vi phạm bản quyền',
    description: 'Sử dụng trái phép nội dung có bản quyền',
  },
  {
    id: 'other',
    label: 'Khác',
    description: 'Lý do khác không được liệt kê ở trên',
  },
];

export const ReportPostDialog = ({ 
  isOpen, 
  onClose, 
  postId, 
  onReport 
}: ReportPostDialogProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onReport(postId, selectedReason, details.trim());
      
      toast({
        title: "Báo cáo đã được gửi",
        description: "Chúng tôi sẽ xem xét báo cáo của bạn trong thời gian sớm nhất.",
      });

      onClose();
      setSelectedReason('');
      setDetails('');
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

  const selectedReasonData = reportReasons.find(r => r.id === selectedReason);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Báo cáo bài viết
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Báo cáo này sẽ được gửi đến đội ngũ kiểm duyệt để xem xét.
            </AlertDescription>
          </Alert>

          {/* Reason Selection */}
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
                <div key={reason.id} className="flex items-start space-x-2">
                  <RadioGroupItem 
                    value={reason.id} 
                    id={reason.id}
                    className="mt-0.5"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label 
                      htmlFor={reason.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {reason.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Details */}
          {selectedReason && (
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
              />
              <p className="text-xs text-muted-foreground mt-1">
                {details.length}/500 ký tự
              </p>
            </div>
          )}

          {/* Selected Reason Summary */}
          {selectedReasonData && (
            <Alert>
              <AlertDescription>
                <strong>Lý do đã chọn:</strong> {selectedReasonData.label}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedReason}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};