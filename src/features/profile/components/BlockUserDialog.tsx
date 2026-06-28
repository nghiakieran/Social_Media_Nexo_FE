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
      <DialogContent className="max-w-[340px] w-[90%] rounded-2xl p-6 gap-0 mx-auto">
        <DialogHeader className="text-center space-y-3">
          <Avatar className="w-20 h-20 mx-auto mb-2">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <DialogTitle className="text-xl font-bold">Chặn {user.username}?</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground leading-normal px-1 pb-4">
            Họ sẽ không thể tìm thấy hồ sơ, bài viết hoặc story của bạn trên Nexo. 
            Nexo sẽ không cho họ biết rằng bạn đã chặn họ.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full rounded-full h-11 text-sm font-semibold border-muted-foreground/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            disabled={isBlocking}
          >
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleBlock}
            className="w-full rounded-full h-11 text-sm font-semibold gap-2"
            disabled={isBlocking}
          >
            {isBlocking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Đang chặn...
              </>
            ) : (
              'Chặn'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};