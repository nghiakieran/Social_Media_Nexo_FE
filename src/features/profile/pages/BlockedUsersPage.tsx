import { ArrowLeft, UserX, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Mock data for blocked users
const mockBlockedUsers = [
  {
    id: '1',
    username: 'spam_user_1',
    name: 'Spam User 1',
    avatar: 'https://picsum.photos/150/150?random=1',
    blockedAt: '2024-01-15',
    reason: 'Spam'
  },
  {
    id: '2',
    username: 'harassment_user',
    name: 'Harassment User',
    avatar: 'https://picsum.photos/150/150?random=2',
    blockedAt: '2024-01-10',
    reason: 'Quấy rối'
  },
  {
    id: '3',
    username: 'fake_account',
    name: 'Fake Account',
    avatar: 'https://picsum.photos/150/150?random=3',
    blockedAt: '2024-01-05',
    reason: 'Tài khoản giả mạo'
  }
];

export const BlockedUsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUnblock = (userId: string, username: string) => {
    toast({
      title: 'Đã bỏ chặn',
      description: `Đã bỏ chặn ${username}`,
    });
    // TODO: Implement unblock API call
    console.log('Unblock user:', userId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Đã chặn</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            Những người dùng bạn đã chặn sẽ không thể xem nội dung của bạn, tag bạn hoặc gửi tin nhắn cho bạn.
          </p>
        </div>

        {mockBlockedUsers.length > 0 ? (
          <div className="space-y-3">
            {mockBlockedUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">{user.name}</h3>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Shield className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Chặn vì: {user.reason}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(user.id, user.username)}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Bỏ chặn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <UserX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa chặn ai</h3>
              <p className="text-muted-foreground text-sm">
                Bạn chưa chặn người dùng nào. Khi bạn chặn ai đó, họ sẽ xuất hiện ở đây.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
