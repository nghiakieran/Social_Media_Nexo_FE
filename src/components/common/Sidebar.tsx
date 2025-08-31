import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Compass, 
  Film, 
  MessageCircle, 
  Heart, 
  PlusSquare, 
  User,
  Settings,
  Users,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Trang chủ', href: '/', icon: Home },
  { name: 'Tìm kiếm', href: '/search', icon: Search },
  { name: 'Khám phá', href: '/explore', icon: Compass },
  { name: 'Reels', href: '/reels', icon: Film },
  { name: 'Tin nhắn', href: '/messages', icon: MessageCircle },
  { name: 'Thông báo', href: '/notifications', icon: Heart },
  { name: 'Tạo', href: '/create', icon: PlusSquare },
  { name: 'Hồ sơ', href: '/profile', icon: User },
];

const mlFeatures = [
  { name: 'Gợi ý kết bạn', href: '/people/suggestions', icon: Users },
  { name: 'Kiểm duyệt nội dung', href: '/admin/moderation', icon: Shield },
];

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-background/50 backdrop-blur-sm">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
        
        {/* ML Features Section */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            AI Features
          </h3>
          <ul className="space-y-2">
            {mlFeatures.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-instagram text-white shadow-glow'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          Cài đặt
        </NavLink>
      </div>
    </aside>
  );
};