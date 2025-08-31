import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserProfile } from '../profileSlice';
import { useToast } from '@/hooks/use-toast';

interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const BlockUserDialog = ({ isOpen, onClose, user }: BlockUserDialogProps) => {
  const { toast } = useToast();

  const handleBlock = () => {
    toast({
      title: 'Đã chặn người dùng',
      description: `Bạn đã chặn ${user.name}. Họ sẽ không thể nhìn thấy hồ sơ, bài viết hoặc liên hệ với bạn.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader className="text-center space-y-4">
          <Avatar className="w-20 h-20 mx-auto">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <DialogTitle>Chặn {user.username}?</DialogTitle>
          <DialogDescription className="text-center">
            Họ sẽ không thể tìm thấy hồ sơ, bài viết hoặc story của bạn trên Instagram. 
            Instagram sẽ không cho họ biết rằng bạn đã chặn họ.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="space-y-2">
          <Button 
            variant="destructive" 
            onClick={handleBlock}
            className="w-full"
          >
            Chặn
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};