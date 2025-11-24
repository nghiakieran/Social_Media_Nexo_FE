import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '../profileSlice';
import { useToast } from '@/hooks/use-toast';

interface ReportUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSubmit: (reason: string) => Promise<void>;
}

const reportReasons = [
  { id: 'spam', label: 'Thư rác' },
  { id: 'inappropriate', label: 'Nội dung không phù hợp' },
  { id: 'harassment', label: 'Quấy rối hoặc bắt nạt' },
  { id: 'hate-speech', label: 'Ngôn từ thù địch' },
  { id: 'violence', label: 'Bạo lực hoặc nguy hiểm' },
  { id: 'fake-account', label: 'Tài khoản giả mạo' },
  { id: 'intellectual-property', label: 'Vi phạm sở hữu trí tuệ' },
  { id: 'other', label: 'Lý do khác' },
];

export const ReportUserDialog = ({ isOpen, onClose, user, onSubmit }: ReportUserDialogProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast({
        title: 'Vui lòng chọn lý do',
        description: 'Bạn cần chọn ít nhất một lý do để báo cáo.',
        variant: 'destructive',
      });
      return;
    }

    // Combine selected reason and additional info
    const reasonLabel = reportReasons.find(r => r.id === selectedReason)?.label || selectedReason;
    let finalReason = reasonLabel;
    
    if (selectedReason === 'other' && additionalInfo.trim()) {
      finalReason = additionalInfo.trim();
    } else if (additionalInfo.trim()) {
      finalReason = `${reasonLabel}: ${additionalInfo.trim()}`;
    }

    // Validate max length (500 characters)
    if (finalReason.length > 500) {
      toast({
        title: 'Lý do quá dài',
        description: 'Lý do báo cáo không được vượt quá 500 ký tự.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(finalReason);
      toast({
        title: 'Đã gửi báo cáo',
        description: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét báo cáo của bạn.',
      });
      setSelectedReason('');
      setAdditionalInfo('');
      onClose();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Báo cáo {user.username}</DialogTitle>
          <DialogDescription>
            Vui lòng cho chúng tôi biết tại sao bạn báo cáo tài khoản này.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-80 overflow-y-auto">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {reportReasons.map((reason) => (
              <div key={reason.id} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.id} id={reason.id} />
                <Label htmlFor={reason.id} className="text-sm">
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="additional-info">Thông tin bổ sung</Label>
              <Textarea
                id="additional-info"
                placeholder="Vui lòng mô tả chi tiết vấn đề..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            className="w-full"
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};