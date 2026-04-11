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
import { useAppDispatch } from '@/store';
import { blockUserAsync } from '../profileSlice';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const BlockUserDialog = ({ isOpen, onClose, user }: BlockUserDialogProps) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isBlocking, setIsBlocking] = useState(false);

  const handleBlock = async () => {
    if (!user) return;
    
    setIsBlocking(true);
    
    try {
      await dispatch(blockUserAsync(user.username)).unwrap();
      
      toast({
        title: 'Đã chặn người dùng',
        description: `Bạn đã chặn ${user.name}. Họ sẽ không thể nhìn thấy hồ sơ, bài viết hoặc liên hệ với bạn.`,
      });
      
      onClose();
      
      // Navigate về trang chủ sau khi block (vì không thể xem profile người bị block)
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể chặn người dùng',
        variant: 'destructive',
      });
    } finally {
      setIsBlocking(false);
    }
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
          <DialogDescription className="text-justify">
            Họ sẽ không thể tìm thấy hồ sơ, bài viết hoặc story của bạn trên Nexo. 
            Nexo sẽ không cho họ biết rằng bạn đã chặn họ.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button 
            variant="destructive" 
            onClick={handleBlock}
            className="w-full gap-2"
            disabled={isBlocking}
          >
            {isBlocking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Đang chặn...
              </>
            ) : (
              'Chặn'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
            disabled={isBlocking}
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};