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
import { Logo } from './Logo';

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

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-4 border-b border-border">
        <Logo size="xl" />
      </div>

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
    </>
  );

  // Mobile bottom navigation items: Home, Search, Reels, Messages, Profile
  const mobileNavItems = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Tìm kiếm', href: '/search', icon: Search },
    { name: 'Reels', href: '/reels', icon: Film },
    { name: 'Tin nhắn', href: '/messages', icon: MessageCircle },
    { name: 'Hồ sơ', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <NavLink
              to="/create"
              className={({ isActive }) =>
                cn(
                  'p-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              <PlusSquare className="h-6 w-6" />
            </NavLink>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                cn(
                  'p-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              <Heart className="h-6 w-6" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around py-3 px-4">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-background/50 backdrop-blur-sm h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
};
