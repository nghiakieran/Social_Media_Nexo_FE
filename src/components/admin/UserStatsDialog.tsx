import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { getUserStatistics } from "@/features/admin/api/userManagementAPI";

interface UserStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userStatus: string;
}

interface UserStats {
  postsCount: number;
  interactionsCount: number;
  totalFollowersCount: number;
  totalFollowingCount: number;
  newFollowersCount: number;
  followersGrowthPercentage: number; 
}

export function UserStatsDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
  userRole,
  userStatus,
}: UserStatsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      const fetchStats = async () => {
        try {
          const response = await getUserStatistics(userId);

          // Tính phần trăm tăng trưởng: (newFollowersCount / totalFollowersCount) * 100
          const followersGrowthPercentage =
            response.totalFollowersCount > 0
              ? (response.newFollowersCount / response.totalFollowersCount) *
                100
              : 0;

          setStats({
            postsCount: response.postsCount,
            interactionsCount: response.interactionsCount,
            totalFollowersCount: response.totalFollowersCount,
            totalFollowingCount: response.totalFollowingCount,
            newFollowersCount: response.newFollowersCount,
            followersGrowthPercentage: followersGrowthPercentage,
          });
        } catch (error) {
          console.error("Lỗi khi tải thống kê:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [open, userId]);

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "destructive" as const,
      MODERATOR: "default" as const,
      USER: "secondary" as const,
    };
    return variants[role as keyof typeof variants] || "secondary";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default" as const,
      locked: "destructive" as const,
      pending: "outline" as const,
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  if (loading || !stats) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Đang tải thống kê...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl">{userName}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleBadge(userRole)}>{userRole}</Badge>
                <Badge variant={getStatusBadge(userStatus)}>
                  {userStatus === "active" ? "Hoạt động" : userStatus}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Tổng quan */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tổng quan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bài viết */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Tổng bài viết
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {stats.postsCount.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                {/* Tương tác */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Tổng tương tác
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {stats.interactionsCount.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                {/* Người theo dõi */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Người theo dõi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {stats.totalFollowersCount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {stats.followersGrowthPercentage > 0 ? (
                        <>
                          <ArrowUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-500 font-medium">
                            +{stats.followersGrowthPercentage.toFixed(2)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-3 h-3 text-red-500" />
                          <span className="text-red-500 font-medium">
                            {stats.followersGrowthPercentage.toFixed(2)}%
                          </span>
                        </>
                      )}
                      <span className="ml-1">tăng trưởng (30 ngày)</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      +{stats.newFollowersCount.toLocaleString()} người mới
                    </div>
                  </CardContent>
                </Card>

                {/* Đang theo dõi */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Đang theo dõi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {stats.totalFollowingCount.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
