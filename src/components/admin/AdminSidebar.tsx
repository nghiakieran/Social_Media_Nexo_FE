import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  Settings,
  ChevronDown,
  KeyRound,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/store";
import { useEffect, useState } from "react";
import { getCurrentUserProfile } from "@/features/profile";
import { logoutAsync } from "@/features/auth/authSlice";

// Types
interface UserProfile {
  username: string;
  email?: string;
  avatarUrl?: string;
}

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Quản lý người dùng", url: "/admin/users", icon: Users },
  { title: "Quản lý bài viết", url: "/admin/posts", icon: FileText },
  { title: "Báo cáo & Vi phạm", url: "/admin/reports", icon: Flag },
  { title: "Cài đặt hệ thống", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const currentPath = location.pathname;

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const isCollapsed = state === "collapsed";

  const isActive = (path: string, end?: boolean) => {
    if (end) return currentPath === path;
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getCurrentUserProfile();
        setUser(profileData);
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <Sidebar
      className={
        isCollapsed
          ? "w-16 transition-all duration-300 !z-50"
          : "w-64 transition-all duration-300 !z-50"
      }
    >
      <SidebarContent className="flex flex-col h-full bg-background border-r border-border/50">
        {/* Lô-gô & Tiêu đề */}
        <div className="px-4 py-6 border-b border-border/50">
          <div
            className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary flex items-center justify-center shadow-glow flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-lg tracking-tight truncate">
                  Admin Panel
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  Nexo Social Media
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Điều Hướng */}
        <SidebarGroup className="flex-1 px-2">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Menu quản lý
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.url, item.end);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.end}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${isCollapsed ? "justify-center" : ""} ${
                          active
                            ? "bg-primary/15 text-primary font-semibold shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {/* Left border indicator khi active */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                        )}
                        <item.icon
                          className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                        />
                        {!isCollapsed && (
                          <span className="flex-1 truncate">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile (Bottom) */}
        {user && (
          <div className="p-4 mt-auto border-t border-border/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-all duration-200 group ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${user.username}&background=random`
                    }
                    alt={user.username}
                    className="w-9 h-9 rounded-full border border-border object-cover flex-shrink-0"
                  />
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                side="right"
                sideOffset={isCollapsed ? 10 : 0}
                className="w-56 rounded-lg shadow-lg border border-border"
              >
                <div className="px-3 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold text-foreground">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={() => setShowChangePassword(true)}
                  className="focus:bg-primary/15 focus:text-primary cursor-pointer rounded-md mx-1 my-1"
                >
                  <KeyRound className="w-4 h-4 mr-2 opacity-70" />
                  <span>Đổi mật khẩu</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-md mx-1 my-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Modal đổi mật khẩu */}
        <ChangePasswordDialog
          open={showChangePassword}
          onOpenChange={setShowChangePassword}
        />
      </SidebarContent>
    </Sidebar>
  );
}
