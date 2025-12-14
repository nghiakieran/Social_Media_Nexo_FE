import { Bell, Search, Heart, MessageCircle, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';

export const Header = () => {
  const navigate = useNavigate();
  const { chats } = useAppSelector((state) => state.message);
  
  // Calculate total unread messages
  const unreadCount = chats.reduce((total, chat) => total + chat.unreadCount, 0);
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold bg-gradient-instagram bg-clip-text text-transparent">Nexo</h1>
          
          {/* Search */}
          <div className="hidden md:block relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm..." 
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate('/messages')}
          >
            <MessageCircle className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <PlusSquare className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
          
          {/* Profile */}
          <div className="w-8 h-8 rounded-full bg-gradient-story p-0.5">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-instagram"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};