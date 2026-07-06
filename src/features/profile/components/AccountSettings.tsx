import { useState, useEffect } from "react";
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Download,
  ChevronRight,
  Globe,
  Users,
  UserX,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../api/profileApi";
import { ActivityLogs } from "./ActivityLogs";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchCurrentUserProfileAsync, updateUserProfileAsync } from "../profileSlice";
import { Skeleton } from "@/components/ui/skeleton";

export const AccountSettings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const { currentProfile, isLoading } = useAppSelector((state) => state.profile);

  const [settings, setSettings] = useState(() => ({
    isPrivate: currentProfile?.isPrivate ?? false,
    allowMessageRequests: true,
    showActivity: currentProfile?.onlineStatus ?? true,
    allowTagging: true,
    allowMentions: true,
    hideStoryFrom: false,
    twoFactorEnabled: false,
  }));

  useEffect(() => {
    dispatch(fetchCurrentUserProfileAsync());
  }, [dispatch]);

  useEffect(() => {
    if (currentProfile) {
      setSettings((prev) => ({
        ...prev,
        isPrivate: currentProfile.isPrivate,
        showActivity: currentProfile.onlineStatus ?? true,
      }));
    }
  }, [currentProfile]);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSettingChange = async (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    
    if (key === "isPrivate") {
      try {
        await dispatch(
          updateUserProfileAsync({
            isPrivate: value,
          })
        ).unwrap();
        
        toast({
          variant: "success",
          title: "Đã cập nhật cài đặt",
          description: `Tài khoản đã chuyển sang chế độ ${value ? "Riêng tư" : "Công khai"}.`,
        });
      } catch (err) {
        setSettings((prev) => ({ ...prev, [key]: !value }));
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể cập nhật quyền riêng tư tài khoản.",
        });
      }
    } else if (key === "showActivity") {
      try {
        await dispatch(
          updateUserProfileAsync({
            onlineStatus: value,
          })
        ).unwrap();

        const api = (await import("@/lib/axios")).default;
        await api.post("/presence/clear-cache");

        toast({
          variant: "success",
          title: "Đã cập nhật cài đặt",
          description: `Trạng thái hoạt động đã được ${value ? "bật" : "tắt"}.`,
        });
      } catch (err) {
        setSettings((prev) => ({ ...prev, [key]: !value }));
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể cập nhật trạng thái hoạt động.",
        });
      }
    } else {
      toast({
        variant: "success",
        title: "Đã cập nhật cài đặt",
        description: "Thay đổi của bạn đã được lưu.",
      });
    }
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword,
      });

      toast({
        variant: "success",
        title: "Thành công",
        description: "Mật khẩu của bạn đã được cập nhật thành công.",
      });

      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch {
      toast({
        title: "Lỗi",
        description: "Đổi mật khẩu không thành công.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivateAccount = () => {
    toast({
      variant: "success",
      title: "Tài khoản đã được vô hiệu hóa",
      description: "Tài khoản của bạn sẽ bị ẩn cho đến khi bạn đăng nhập lại.",
    });
    setShowDeactivateDialog(false);
  };

  const handleDownloadData = () => {
    toast({
      variant: "info",
      title: "Đang chuẩn bị dữ liệu",
      description:
        "Chúng tôi sẽ gửi email cho bạn khi dữ liệu sẵn sàng để tải xuống.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-2">
      {/* Privacy Settings */}
      <div className="px-4 pt-5 pb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Quyền riêng tư
        </p>
      </div>
      <div className="bg-card sm:mx-4 sm:rounded-xl overflow-hidden sm:border border-border">
        {!currentProfile && isLoading ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full shrink-0" />
            </div>
            <div className="h-px bg-border -mx-4" />
            <div className="flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3.5 w-56" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full shrink-0" />
            </div>
          </div>
        ) : (
          <>
            {/* Private Account */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-foreground">Tài khoản riêng tư</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Chỉ người theo dõi mới xem được bài viết
                </p>
              </div>
              <Switch
                checked={settings.isPrivate}
                onCheckedChange={(checked) => handleSettingChange("isPrivate", checked)}
              />
            </div>
            <div className="h-px bg-border mx-4" />

            {/* Activity Status */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-foreground">Trạng thái hoạt động</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Hiển thị trạng thái hoạt động của bạn
                </p>
              </div>
              <Switch
                checked={settings.showActivity}
                onCheckedChange={(checked) => handleSettingChange("showActivity", checked)}
              />
            </div>
          </>
        )}
      </div>

        {/* Message Requests */}
        {/* <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-foreground">Tin nhắn từ người lạ</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Nhận tin nhắn từ người không theo dõi bạn
            </p>
          </div>
          <Switch
            checked={settings.allowMessageRequests}
            onCheckedChange={(checked) => handleSettingChange("allowMessageRequests", checked)}
          />
        </div> */}
        {/* <div className="h-px bg-border mx-4" /> */}



        {/* Tagging */}
        {/* <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-foreground">Cho phép gắn thẻ</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Người khác có thể gắn thẻ bạn trong bài viết
            </p>
          </div>
          <Switch
            checked={settings.allowTagging}
            onCheckedChange={(checked) => handleSettingChange("allowTagging", checked)}
          />
        </div> */}


      {/* Manage Lists */}
      <div className="px-4 pt-5 pb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Quản lý
        </p>
      </div>
      <div className="bg-card sm:mx-4 sm:rounded-xl overflow-hidden sm:border border-border">
        {/* Blocked */}
        <button
          onClick={() => navigate("/account/blocked")}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <UserX className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Đã chặn</p>
              <p className="text-xs text-muted-foreground mt-0.5">Quản lý danh sách người dùng đã chặn</p>
            </div>
          </div>
          <Globe className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="h-px bg-border mx-4" />

        {/* Hidden Posts */}
        {/* <button
          onClick={() => navigate("/account/hidden-posts")}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Ẩn tin</p>
              <p className="text-xs text-muted-foreground mt-0.5">Quản lý danh sách bài viết đã ẩn</p>
            </div>
          </div>
          <Globe className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="h-px bg-border mx-4" /> */}

        {/* Close Friends */}
        <button
          onClick={() => navigate("/account/close-friends")}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Bạn thân</p>
              <p className="text-xs text-muted-foreground mt-0.5">Chia sẻ tin riêng tư với bạn thân</p>
            </div>
          </div>
          <Globe className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Security Settings */}
      <div className="px-4 pt-5 pb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5" />
          Bảo mật
        </p>
      </div>
      <div className="bg-card sm:mx-4 sm:rounded-xl overflow-hidden sm:border border-border">
        {/* 2FA - temporarily hidden
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-foreground">Xác thực hai yếu tố</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Thêm lớp bảo mật cho tài khoản
            </p>
          </div>
          <Switch
            checked={settings.twoFactorEnabled}
            onCheckedChange={(checked) => handleSettingChange("twoFactorEnabled", checked)}
          />
        </div>
        <div className="h-px bg-border mx-4" />
        */}

        {/* Change Password */}
        <Dialog
          open={showPasswordDialog}
          onOpenChange={(open) => {
            setShowPasswordDialog(open);
            if (!open) {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setShowCurrentPassword(false);
              setShowNewPassword(false);
              setShowConfirmPassword(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-medium text-foreground">Đổi mật khẩu</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đổi mật khẩu</DialogTitle>
              <DialogDescription>
                Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary/10"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary/10"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  Xác nhận mật khẩu mới
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary/10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                disabled={isChangingPassword}
                tabIndex={-1}
                className="font-medium text-foreground"
              >
                Hủy
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Account Management - temporarily hidden
      <div className="px-4 pt-5 pb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quản lý tài khoản
        </p>
      </div>
      <div className="bg-card sm:mx-4 sm:rounded-xl overflow-hidden sm:border border-border">
        <button onClick={handleDownloadData} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-sm font-medium text-foreground">Tải xuống dữ liệu</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="h-px bg-border mx-4" />
        <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-destructive/10 transition-colors" onClick={() => setShowDeactivateDialog(true)}>
          <div className="flex items-center gap-3">
            <Trash2 className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">Vô hiệu hóa tài khoản</p>
          </div>
          <ChevronRight className="w-4 h-4 text-destructive/60" />
        </button>
      </div>
      */}

      {/* Activity Logs */}
      <div className="mt-6">
        <ActivityLogs />
      </div>
    </div>
  );
};
