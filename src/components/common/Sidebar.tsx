import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { logoutAsync } from "@/features/auth/authSlice";
import { Theme, useTheme } from "@/contexts/ThemeContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  MoreHorizontal,
  Settings,
  Bookmark,
  Sun,
  Moon,
  LogOut,
  Users,
  Shield,
  ChevronLeft,
  Video,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SwitchAccountDialog } from "@/features/auth";
import { CreateContentDialog } from "@/features/story/components/CreateContentDialog";

const navigation = [
  { name: "Trang chủ", href: "/", icon: Home },
  { name: "Tìm kiếm", href: "/search", icon: Search },
  { name: "Khám phá", href: "/explore", icon: Compass },
  { name: "Reels", href: "/reels", icon: Film },
  { name: "Tin nhắn", href: "/messages", icon: MessageCircle },
  { name: "Thông báo", href: "/notifications", icon: Heart },
  { name: "Tạo bài viết", href: "/create", icon: PlusSquare },
  { name: "Tạo Reel", href: "/reels/create", icon: Video },
  { name: "Hồ sơ", href: "/profile", icon: User, dynamic: true },
  // { name: "Giới thiệu", href: "/about", icon: Moon },
];

const mlFeatures = [
  { name: "Gợi ý kết bạn", href: "/people/suggestions", icon: Users },
  { name: "Kiểm duyệt nội dung", href: "/admin/moderation", icon: Shield },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, token } = useAppSelector((state) => state.auth);
  const unreadNotificationCount = useAppSelector(
    (state) => state.notification.unreadCount,
  );
  const { isConnected } = useWebSocket(token || "", user?.username || "");

  const { setTheme } = useTheme();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMobileThemeMenuOpen, setIsMobileThemeMenuOpen] = useState(false);
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  const handleThemeToggle = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
    setIsMobileThemeMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Logo size="xl" />
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const href = item.dynamic && user ? `/${user.username}` : item.href;
            const isNotificationItem = item.name === "Thông báo";
            return (
              <li key={item.name}>
                <NavLink
                  to={href}
                  end
                  caseSensitive
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-glow hover:bg-primary/80"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20",
                    )
                  }
                >
                  <div className="relative">
                    <item.icon className="h-5 w-5" />

                    {isNotificationItem && unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border border-background">
                        {unreadNotificationCount > 9
                          ? "9+"
                          : unreadNotificationCount}
                      </span>
                    )}
                  </div>
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Temporarily hidden AI Features */}
        {/* <div className="mt-8">
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
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div> */}
      </nav>

      <div className="p-4 border-t border-border">
        <Popover open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
            >
              <MoreHorizontal className="h-5 w-5" />
              Xem thêm
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              {/* Cài đặt */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2.5 text-sm"
                onClick={() => {
                  navigate("/account/settings");
                  setIsMoreMenuOpen(false);
                }}
              >
                <Settings className="h-4 w-4" />
                Cài đặt
              </Button>

              {/* Đã lưu */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2.5 text-sm"
                onClick={() => {
                  const profileUrl = user ? `/${user.username}?tab=saved` : "/";
                  navigate(profileUrl);
                  setIsMoreMenuOpen(false);
                }}
              >
                <Bookmark className="h-4 w-4" />
                Đã lưu
              </Button>

              {/* Chuyển chế độ */}
              <Button
                ref={themeButtonRef}
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2.5 text-sm"
                onClick={() => {
                  setIsThemeMenuOpen(true);
                  setIsMoreMenuOpen(false);
                }}
              >
                <Sun className="h-4 w-4" />
                Chuyển chế độ
              </Button>

              {/* Chuyển tài khoản */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2.5 text-sm"
                onClick={() => {
                  setIsSwitchAccountOpen(true);
                  setIsMoreMenuOpen(false);
                }}
              >
                <User className="h-4 w-4" />
                Chuyển tài khoản
              </Button>

              {/* Đăng xuất */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  handleLogout();
                  setIsMoreMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Theme Menu Popover - Using Popover component with proper positioning */}
      <Popover open={isThemeMenuOpen} onOpenChange={setIsThemeMenuOpen}>
        <PopoverTrigger asChild>
          <Button ref={themeButtonRef} className="hidden" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-0"
          side="right"
          sideOffset={15}
          style={{
            translate: "0% 234%",
          }}
        >
          {/* Header with back button */}
          <div className="flex items-center gap-3 p-3 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsThemeMenuOpen(false);
                setIsMoreMenuOpen(true);
              }}
              className="p-1 h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-semibold">Chuyển chế độ</p>
          </div>

          {/* Theme options */}
          <div className="p-4">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-3 text-sm h-auto"
                onClick={() => handleThemeToggle("light")}
              >
                <Sun className="h-5 w-5" />
                <div className="text-left font-medium">Chế độ sáng</div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-3 text-sm h-auto"
                onClick={() => handleThemeToggle("dark")}
              >
                <Moon className="h-5 w-5" />
                <div className="text-left font-medium">Chế độ tối</div>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );

  // Mobile bottom navigation items: Home, Search, Reels, Messages, Profile
  const mobileNavItems = [
    { name: "Trang chủ", href: "/", icon: Home },
    { name: "Tìm kiếm", href: "/search", icon: Search },
    { name: "Reels", href: "/reels", icon: Film },
    { name: "Tin nhắn", href: "/messages", icon: MessageCircle },
    { name: "Hồ sơ", href: "/profile", icon: User, dynamic: true },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Logo size="md" />
          </button>
          <div className="flex items-center gap-4">
            <div title={isConnected ? "Đã kết nối" : "Mất kết nối"}>
              {isConnected ? (
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              ) : (
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
              )}
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-primary"
            >
              <PlusSquare className="h-6 w-6" />
            </button>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                cn(
                  "p-2 rounded-lg transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <div className="relative">
                <Heart className="h-6 w-6" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border-2 border-background">
                    {unreadNotificationCount > 9
                      ? "9+"
                      : unreadNotificationCount}
                  </span>
                )}
              </div>
            </NavLink>

            {/* Mobile Menu Button */}
            <Popover
              open={isMobileMoreMenuOpen}
              onOpenChange={setIsMobileMoreMenuOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-primary"
                >
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2.5 text-sm"
                    onClick={() => {
                      setIsMobileThemeMenuOpen(true);
                      setIsMobileMoreMenuOpen(false);
                    }}
                  >
                    <Sun className="h-4 w-4" />
                    Chuyển chế độ
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2.5 text-sm text-destructive hover:text-destructive"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMoreMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around py-2 px-2">
          {mobileNavItems.map((item) => {
            const href = item.dynamic && user ? `/${user.username}` : item.href;

            return (
              <NavLink
                key={item.name}
                to={href}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-background/50 backdrop-blur-sm h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Switch Account Dialog - Outside sidebar container */}
      <SwitchAccountDialog
        isOpen={isSwitchAccountOpen}
        onClose={() => setIsSwitchAccountOpen(false)}
      />

      {/* Mobile Theme Menu Popover */}
      <Popover
        open={isMobileThemeMenuOpen}
        onOpenChange={setIsMobileThemeMenuOpen}
      >
        <PopoverTrigger asChild>
          <Button className="hidden" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          className="w-48 p-0"
          align="end"
          style={{
            position: "fixed",
            transform: "translate(167px, 56px)",
          }}
        >
          {/* Header with back button */}
          <div className="flex items-center gap-1 p-3 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMobileThemeMenuOpen(false);
                setIsMobileMoreMenuOpen(true);
              }}
              className="p-1 h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-semibold">Chuyển chế độ</p>
          </div>

          {/* Theme options */}
          <div className="p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2.5 text-sm"
                onClick={() => handleThemeToggle("light")}
              >
                <Sun className="h-4 w-4" />
                Chế độ sáng
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2.5 text-sm"
                onClick={() => handleThemeToggle("dark")}
              >
                <Moon className="h-4 w-4" />
                Chế độ tối
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Create Content Dialog */}
      <CreateContentDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </>
  );
};
