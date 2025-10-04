import { useEffect, useState } from 'react';
import { UserCheck, UserX, Clock, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FollowRequestUser } from '../types';
import { useToast } from '@/hooks/use-toast';

interface FollowRequestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  followRequests: FollowRequestUser[];
  onAccept: (username: string) => void;
  onReject: (username: string) => void;
  isLoading?: boolean;
}

export const FollowRequestsDialog = ({
  isOpen,
  onClose,
  followRequests,
  onAccept,
  onReject,
  isLoading = false,
}: FollowRequestsDialogProps) => {
  const [localRequests, setLocalRequests] = useState(followRequests);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setLocalRequests(followRequests);
    }
  }, [isOpen, followRequests]);

  const handleAccept = (username: string) => {
    onAccept(username);
    setLocalRequests(prev => prev.filter(request => request.userName !== username));
    
    const user = localRequests.find(r => r.userName === username);
    toast({
      title: 'Đã chấp nhận',
      description: `Bạn đã chấp nhận ${user?.userName} theo dõi`,
    });
  };

  const handleReject = (username: string) => {
    onReject(username);
    setLocalRequests(prev => prev.filter(request => request.userName !== username));
    
    const user = localRequests.find(r => r.userName === username);
    toast({
      title: 'Đã từ chối',
      description: `Bạn đã từ chối ${user?.userName} theo dõi`,
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[560px] mx-auto bg-background p-0 overflow-hidden">
        <DialogHeader className="relative border-b border-border p-3">
          <DialogTitle className="text-center text-base font-semibold">
            Yêu cầu theo dõi
          </DialogTitle>
        </DialogHeader>

        <div className="p-3">
          {localRequests.length === 0 ? (
            <div className="h-[340px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Không có yêu cầu theo dõi nào</p>
              </div>
            </div>
          ) : (
            <div className="h-[340px] overflow-y-auto space-y-1.5">
              {localRequests.map((request) => (
                <div key={request.userName} className="flex items-center justify-between px-2 py-3 hover:bg-muted/40 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={request.avatar} alt={request.userName} />
                      <AvatarFallback>
                        {request.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm leading-5">{request.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(request.requestedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="instagram"
                      size="sm"
                      onClick={() => handleAccept(request.userName)}
                      disabled={isLoading}
                      className="text-xs gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      Chấp nhận
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request.userName)}
                      disabled={isLoading}
                      className="text-xs gap-1"
                    >
                      <UserX className="w-3 h-3" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
