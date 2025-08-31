import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '../friendSlice';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface BlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm?: (userId: string) => void;
}

export const BlockDialog = ({
  isOpen,
  onClose,
  user,
  onConfirm,
}: BlockDialogProps) => {
  const { toast } = useToast();

  const handleConfirm = () => {
    if (user) {
      onConfirm?.(user.id);
      toast({
        description: `Đã chặn ${user.name}`,
      });
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <DialogTitle className="text-center">Chặn người dùng?</DialogTitle>
          <DialogDescription className="text-center">
            Bạn có chắc chắn muốn chặn người dùng này không?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-instagram text-white font-medium">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{user.name}</h3>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Khi bạn chặn người này:</p>
          <ul className="space-y-1 ml-4">
            <li>• Họ sẽ không thể xem trang cá nhân của bạn</li>
            <li>• Họ sẽ không thể tìm thấy bạn khi tìm kiếm</li>
            <li>• Họ sẽ không thể gửi tin nhắn cho bạn</li>
            <li>• Tất cả kết nối hiện tại sẽ bị hủy</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            className="w-full sm:w-auto"
          >
            Chặn người dùng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};