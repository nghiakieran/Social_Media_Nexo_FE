import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Flag, 
  MessageSquare, 
  Settings,
  ChevronRight
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

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Quản lý người dùng", url: "/admin/users", icon: Users },
  { title: "Quản lý bài viết", url: "/admin/posts", icon: FileText },
  { title: "Báo cáo & Vi phạm", url: "/admin/reports", icon: Flag },
  { title: "Quản lý bình luận", url: "/admin/comments", icon: MessageSquare },
  { title: "Cài đặt hệ thống", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string, end?: boolean) => {
    if (end) return currentPath === path;
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"}>
      <SidebarContent>
        <div className="px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-instagram-purple via-instagram-pink to-instagram-orange flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Nexo Social Media</p>
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
      </SidebarContent>
    </Sidebar>
  );
}
