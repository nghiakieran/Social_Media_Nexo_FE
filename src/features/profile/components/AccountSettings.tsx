import { useState } from "react";
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Download,
  ChevronRight,
  Lock,
  Globe,
  Users,
  UserX,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

export const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    isPrivate: false,
    allowMessageRequests: true,
    showActivity: true,
    allowTagging: true,
    allowMentions: true,
    hideStoryFrom: false,
    twoFactorEnabled: false,
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "Đã cập nhật cài đặt",
      description: "Thay đổi của bạn đã được lưu.",
    });
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
      title: "Tài khoản đã được vô hiệu hóa",
      description: "Tài khoản của bạn sẽ bị ẩn cho đến khi bạn đăng nhập lại.",
    });
    setShowDeactivateDialog(false);
  };

  const handleDownloadData = () => {
    toast({
      title: "Đang chuẩn bị dữ liệu",
      description:
        "Chúng tôi sẽ gửi email cho bạn khi dữ liệu sẵn sàng để tải xuống.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Quyền riêng tư
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Tài khoản riêng tư</Label>
              <p className="text-sm text-muted-foreground">
                Chỉ người theo dõi bạn mới xem được bài viết
              </p>
            </div>
            <Switch
              checked={settings.isPrivate}
              onCheckedChange={(checked) =>
                handleSettingChange("isPrivate", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">
                Cho phép tin nhắn từ người lạ
              </Label>
              <p className="text-sm text-muted-foreground">
                Nhận tin nhắn từ những người không theo dõi bạn
              </p>
            </div>
            <Switch
              checked={settings.allowMessageRequests}
              onCheckedChange={(checked) =>
                handleSettingChange("allowMessageRequests", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">
                Hiển thị trạng thái hoạt động
              </Label>
              <p className="text-sm text-muted-foreground">
                Cho phép người khác biết khi bạn đang hoạt động
              </p>
            </div>
            <Switch
              checked={settings.showActivity}
              onCheckedChange={(checked) =>
                handleSettingChange("showActivity", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Cho phép gắn thẻ</Label>
              <p className="text-sm text-muted-foreground">
                Người khác có thể gắn thẻ bạn trong bài viết
              </p>
            </div>
            <Switch
              checked={settings.allowTagging}
              onCheckedChange={(checked) =>
                handleSettingChange("allowTagging", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Đã chặn</Label>
              <p className="text-sm text-muted-foreground">
                Quản lý danh sách người dùng đã chặn
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/account/blocked")}
              className="gap-2"
            >
              <UserX className="w-4 h-4" />
              Xem danh sách
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Ẩn tin</Label>
              <p className="text-sm text-muted-foreground">
                Quản lý danh sách bài viết đã ẩn
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/account/hidden-posts")}
              className="gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Xem danh sách
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Bạn thân</Label>
              <p className="text-sm text-muted-foreground">
                Quản lý danh sách bạn thân để chia sẻ tin riêng tư
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/account/close-friends")}
              className="gap-2"
            >
              <Heart className="w-4 h-4" />
              Xem danh sách
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Xác thực hai yếu tố</Label>
              <p className="text-sm text-muted-foreground">
                Thêm lớp bảo mật cho tài khoản của bạn
              </p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) =>
                handleSettingChange("twoFactorEnabled", checked)
              }
            />
          </div>

          <Separator />

          <Dialog
            open={showPasswordDialog}
            onOpenChange={(open) => {
              setShowPasswordDialog(open);
              if (!open) {
                // Reset all states when dialog closes
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
              <Button variant="outline" className="w-full justify-between">
                <span>Đổi mật khẩu</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
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
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
        </CardContent>
      </Card>

      {/* Data & Account Management */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={handleDownloadData}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Tải xuống dữ liệu của bạn</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Separator />

          <Dialog
            open={showDeactivateDialog}
            onOpenChange={setShowDeactivateDialog}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Vô hiệu hóa tài khoản</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vô hiệu hóa tài khoản</DialogTitle>
                <DialogDescription>
                  Tài khoản của bạn sẽ bị ẩn cho đến khi bạn đăng nhập lại. Bạn
                  có chắc muốn tiếp tục?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeactivateDialog(false)}
                >
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleDeactivateAccount}>
                  Vô hiệu hóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};
