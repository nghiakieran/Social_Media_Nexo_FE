import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
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
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCurrentUserProfile } from "@/features/profile";
import { logoutAsync } from "@/features/auth/authSlice";
const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Quản lý người dùng", url: "/admin/users", icon: Users },
  { title: "Quản lý bài viết", url: "/admin/posts", icon: FileText },
  { title: "Báo cáo & Vi phạm", url: "/admin/reports", icon: Flag },
  // { title: "Quản lý bình luận", url: "/admin/comments", icon: MessageSquare },
  { title: "Cài đặt hệ thống", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const currentPath = location.pathname;
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [user, setUser] = useState(null);
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
        console.error("Error:", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"}>
      <SidebarContent className="flex flex-col h-full">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">
                  Nexo Social Media
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-sidebar-accent"
                      activeClassName="bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-medium border-l-4 border-primary"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {state !== "collapsed" && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {isActive(item.url, item.end) && (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user && (
          <div className="p-4 border-t border-border space-y-3 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 group">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    className="w-10 h-10 rounded-full border-2 border-primary/20"
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-ellipsis"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <ChangePasswordDialog
          open={showChangePassword}
          onOpenChange={setShowChangePassword}
        />
        <ChangePasswordDialog
          open={showChangePassword}
          onOpenChange={setShowChangePassword}
        />
      </SidebarContent>
    </Sidebar>
  );
}
