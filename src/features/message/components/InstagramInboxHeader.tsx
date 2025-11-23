import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  Edit3,
  Settings,
  MessageSquare,
  Archive,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstagramInboxHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  className?: string;
  activeView?: "primary" | "requests";
  onViewChange?: (view: "primary" | "requests") => void;
}

export const InstagramInboxHeader: React.FC<InstagramInboxHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onNewMessage,
  className,
  activeView = "primary",
  onViewChange,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadOnlineStatus = async () => {
      try {
        const { getCurrentUserProfile } = await import(
          "@/features/profile/api/profileApi"
        );
        const profile = await getCurrentUserProfile();
        if (profile.onlineStatus !== undefined) {
          setActivityStatus(profile.onlineStatus);
        }
      } catch (error) { /* empty */ }
    };

    loadOnlineStatus();
  }, []);

  const handleActivityStatusChange = async (checked: boolean) => {
    setActivityStatus(checked);
    setIsLoading(true);

    try {
      const { updateUserProfile } = await import(
        "@/features/profile/api/profileApi"
      );
      await updateUserProfile({
        onlineStatus: checked,
      });

      const api = (await import("@/lib/axios")).default;
      await api.post("/presence/clear-cache");
    } catch (error) {
      setActivityStatus(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("p-4 border-b border-border bg-background", className)}>
      {}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold">
            {activeView === "requests" ? "Yêu cầu nhắn tin" : "Tin nhắn"}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onViewChange?.("primary")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chính
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange?.("requests")}>
                <Archive className="h-4 w-4 mr-2" />
                Chờ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm cuộc trò chuyện..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted border-0 rounded-xl h-9"
        />
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cài đặt tin nhắn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Trạng thái hoạt động */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="space-y-0.5">
                <Label
                  htmlFor="activity-status"
                  className="text-base font-medium"
                >
                  Trạng thái hoạt động
                </Label>
                <p className="text-sm text-muted-foreground">
                  Hiển thị trạng thái hoạt động của bạn
                </p>
              </div>
              <Switch
                id="activity-status"
                checked={activityStatus}
                onCheckedChange={handleActivityStatusChange}
                disabled={isLoading}
              />
            </div>

            {/* Chế độ tối */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Chế độ tối
                </Label>
                <p className="text-sm text-muted-foreground">
                  Bật giao diện tối cho tin nhắn
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
