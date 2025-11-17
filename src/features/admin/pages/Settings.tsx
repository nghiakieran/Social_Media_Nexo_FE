import { Shield, Key, Settings as SettingsIcon, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Cài đặt hệ thống
        </h1>
        <p className="text-muted-foreground">Quản lý cấu hình và bảo mật hệ thống</p>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">
            <Shield className="w-4 h-4 mr-2" />
            Vai trò
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Key className="w-4 h-4 mr-2" />
            Quyền hạn
          </TabsTrigger>
          <TabsTrigger value="system">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Hệ thống
          </TabsTrigger>
          <TabsTrigger value="api">
            <Database className="w-4 h-4 mr-2" />
            API & Dịch vụ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý vai trò</CardTitle>
              <CardDescription>Tạo và quản lý các vai trò người dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Admin</h4>
                    <p className="text-sm text-muted-foreground">Toàn quyền quản trị hệ thống</p>
                  </div>
                  <Button variant="outline" size="sm">Chỉnh sửa</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Moderator</h4>
                    <p className="text-sm text-muted-foreground">Kiểm duyệt nội dung và người dùng</p>
                  </div>
                  <Button variant="outline" size="sm">Chỉnh sửa</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">User</h4>
                    <p className="text-sm text-muted-foreground">Người dùng thông thường</p>
                  </div>
                  <Button variant="outline" size="sm">Chỉnh sửa</Button>
                </div>
              </div>
              <Separator />
              <Button className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Tạo vai trò mới
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý quyền hạn</CardTitle>
              <CardDescription>Cấu hình quyền truy cập cho từng vai trò</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quản lý người dùng</Label>
                    <p className="text-sm text-muted-foreground">Cho phép xem và chỉnh sửa người dùng</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Xóa bài viết</Label>
                    <p className="text-sm text-muted-foreground">Cho phép xóa bài viết của người khác</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Xử lý báo cáo</Label>
                    <p className="text-sm text-muted-foreground">Cho phép duyệt và xử lý báo cáo</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cài đặt hệ thống</Label>
                    <p className="text-sm text-muted-foreground">Cho phép thay đổi cấu hình hệ thống</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình hệ thống</CardTitle>
              <CardDescription>Thiết lập giới hạn và cấu hình upload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kích thước ảnh tối đa (MB)</Label>
                <Input type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label>Kích thước video tối đa (MB)</Label>
                <Input type="number" defaultValue="100" />
              </div>
              <div className="space-y-2">
                <Label>Số bài viết tối đa mỗi ngày</Label>
                <Input type="number" defaultValue="50" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bật kiểm duyệt tự động</Label>
                  <p className="text-sm text-muted-foreground">Sử dụng AI để lọc nội dung</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <Button className="w-full">Lưu thay đổi</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API & Dịch vụ</CardTitle>
              <CardDescription>Quản lý API keys và cấu hình dịch vụ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Server (SMTP)</Label>
                <Input placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label>OAuth Client ID</Label>
                <Input placeholder="your-client-id" />
              </div>
              <div className="space-y-2">
                <Label>OAuth Client Secret</Label>
                <Input type="password" placeholder="your-client-secret" />
              </div>
              <div className="space-y-2">
                <Label>API Key Storage</Label>
                <Input placeholder="your-storage-key" />
              </div>
              <Separator />
              <Button className="w-full">Lưu cấu hình</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
