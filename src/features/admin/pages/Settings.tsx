import { useState } from "react";
import {
  Shield,
  Key,
  Settings as SettingsIcon,
  Database,
  Loader2,
  Save,
  BrainCircuit,
  Server,
  AlertTriangle,
  X,
  Rocket,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [loading, setLoading] = useState({
    posts: false,
    reels: false,
    trending: false,
  });

  const API_BASE = import.meta.env.VITE_AI_API_URL || "http://localhost:8001";
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    title: "",
  });
  const executeTraining = async () => {
    const { type } = confirmDialog;
    if (!type) return;

    const endpoints = {
      posts: "/train-recommendations",
      reels: "/train-reels-recommendations",
      trending: "/train-trending",
    };

    setLoading((prev) => ({ ...prev, [type]: true }));
    setConfirmDialog({ isOpen: false, type: null, title: "" });

    try {
      const res = await fetch(`${API_BASE}${endpoints[type]}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(`Khởi chạy huấn luyện AI (${type}) thành công!`, {
        description: "Hệ thống đang chạy ngầm tiến trình này.",
      });
    } catch (err) {
      console.error(err);
      toast.error(`Lỗi khi khởi chạy huấn luyện (${type})`, {
        description: "Vui lòng kiểm tra lại kết nối server.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleTrainPosts = () =>
    setConfirmDialog({ isOpen: true, type: "posts", title: "Train Posts" });
  const handleTrainReels = () =>
    setConfirmDialog({ isOpen: true, type: "reels", title: "Train Reels" });
  const handleTrainTrending = () =>
    setConfirmDialog({
      isOpen: true,
      type: "trending",
      title: "Train Trending",
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Cài đặt{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Hệ thống
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Quản lý cấu hình, bảo mật và dịch vụ AI của Nexo
          </p>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <div className="bg-muted p-1.5 rounded-2xl border border-border/50 shadow-sm w-max">
          <TabsList className="bg-transparent h-12 w-full justify-start gap-2">
            <TabsTrigger value="roles" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md transition-all font-semibold">
              <Shield className="w-4 h-4 mr-2" />
              Vai trò
            </TabsTrigger>
            <TabsTrigger value="permissions" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md transition-all font-semibold">
              <Key className="w-4 h-4 mr-2" />
              Quyền hạn
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md transition-all font-semibold">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Hệ thống
            </TabsTrigger>
            <TabsTrigger value="api" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-md transition-all font-semibold">
              <Database className="w-4 h-4 mr-2" />
              API & Dịch vụ
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ROLES */}
        <TabsContent value="roles" className="space-y-4 focus-visible:outline-none">
          <Card className="border border-border/50 shadow-xl rounded-[2rem] overflow-hidden bg-card text-card-foreground">
            <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
              <CardTitle className="text-xl font-bold text-foreground">Quản lý vai trò</CardTitle>
              <CardDescription>
                Tạo và quản lý các vai trò người dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {["Admin", "Moderator", "User"].map((role) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-4 border border-border/50 bg-muted/10 rounded-xl"
                >
                  <div>
                    <h4 className="font-semibold text-foreground">{role}</h4>
                    <p className="text-sm text-muted-foreground">
                      {role === "Admin" && "Toàn quyền quản trị hệ thống"}
                      {role === "Moderator" &&
                        "Kiểm duyệt nội dung và người dùng"}
                      {role === "User" && "Người dùng thông thường"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Chỉnh sửa
                  </Button>
                </div>
              ))}
              <Separator />
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/10 dark:shadow-none">
                <Shield className="w-4 h-4 mr-2" />
                Tạo vai trò mới
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERMISSIONS */}
        <TabsContent value="permissions" className="space-y-4 focus-visible:outline-none">
          <Card className="border border-border/50 shadow-xl rounded-[2rem] overflow-hidden bg-card text-card-foreground">
            <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
              <CardTitle className="text-xl font-bold text-foreground">Quản lý quyền hạn</CardTitle>
              <CardDescription>Cấu hình quyền truy cập</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {[
                "Quản lý người dùng",
                "Xóa bài viết",
                "Xử lý báo cáo",
                "Cài đặt hệ thống",
              ].map((label, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">{label}</Label>
                    <Switch defaultChecked={i < 3} />
                  </div>
                  <Separator className="my-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYSTEM */}
        <TabsContent value="system" className="space-y-4 focus-visible:outline-none">
          <Card className="border border-border/50 shadow-xl rounded-[2rem] overflow-hidden bg-card text-card-foreground">
            <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
              <CardTitle className="text-xl font-bold text-foreground">Cấu hình hệ thống</CardTitle>
              <CardDescription>Thiết lập hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Input
                type="number"
                defaultValue="10"
                placeholder="Max image size"
                className="bg-background border-border text-foreground"
              />
              <Input
                type="number"
                defaultValue="100"
                placeholder="Max video size"
                className="bg-background border-border text-foreground"
              />
              <Input
                type="number"
                defaultValue="50"
                placeholder="Max posts/day"
                className="bg-background border-border text-foreground"
              />
              <Separator />
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Bật kiểm duyệt AI</Label>
                <Switch defaultChecked />
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/10 dark:shadow-none">Lưu thay đổi</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API */}
        <TabsContent
          value="api"
          className="space-y-4 focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="border border-border/50 shadow-xl rounded-[2rem] overflow-hidden bg-card text-card-foreground">
            <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                API & Dịch vụ
              </CardTitle>
              <CardDescription className="text-sm">
                Quản lý kết nối hệ thống, khóa bảo mật và tiến trình huấn luyện
                AI
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* KHU VỰC CẤU HÌNH API */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  Thông tin xác thực (Credentials)
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="smtp" className="text-foreground">SMTP Server</Label>
                    <Input
                      id="smtp"
                      placeholder="smtp.example.com"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-id" className="text-foreground">OAuth Client ID</Label>
                    <Input
                      id="client-id"
                      placeholder="Nhập Client ID..."
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-secret" className="text-foreground">OAuth Secret</Label>
                    <Input
                      id="client-secret"
                      type="password"
                      placeholder="••••••••••••"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* KHU VỰC HUẤN LUYỆN AI */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <BrainCircuit className="w-4 h-4 text-muted-foreground" />
                    Tác vụ Huấn luyện AI
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Button
                    onClick={handleTrainPosts}
                    disabled={loading.posts}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {loading.posts ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4" />
                    )}
                    {loading.posts ? "Đang xử lý..." : "Train Posts"}
                  </Button>

                  <Button
                    onClick={handleTrainReels}
                    disabled={loading.reels}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {loading.reels ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SettingsIcon className="w-4 h-4" />
                    )}
                    {loading.reels ? "Đang xử lý..." : "Train Reels"}
                  </Button>

                  <Button
                    onClick={handleTrainTrending}
                    disabled={loading.trending}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {loading.trending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    {loading.trending ? "Đang xử lý..." : "Train Trending"}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* NÚT LƯU CẤU HÌNH */}
              <div className="flex justify-end pt-2">
                <Button className="w-full sm:w-auto flex items-center gap-2 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/10 dark:shadow-none">
                  <Save className="w-4 h-4" />
                  Lưu cấu hình
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) =>
          setConfirmDialog((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Xác nhận khởi chạy
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn chạy tác vụ{" "}
              <strong className="text-foreground">{confirmDialog.title}</strong>{" "}
              không? Quá trình này có thể tiêu tốn một lượng lớn tài nguyên máy
              chủ và mất vài phút để hoàn thành.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex items-center gap-1.5">
              <X className="w-4 h-4" />
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeTraining}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Rocket className="w-4 h-4" />
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
