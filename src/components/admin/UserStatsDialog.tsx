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
import { BarChart3, ArrowUp, ArrowDown, FileText, Heart, UserCheck } from "lucide-react";
import { getUserStatistics } from "@/features/admin/api/userManagementAPI";
import { Skeleton } from "../ui/skeleton";
import Users from "@/features/admin/pages/Users";

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
      const fetchStats = async () => {
        setLoading(true);
        try {
          const res = await getUserStatistics(userId);
          const growth =
            res.totalFollowersCount > 0
              ? (res.newFollowersCount / res.totalFollowersCount) * 100
              : 0;
          setStats({ ...res, followersGrowthPercentage: growth });
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="p-8 bg-slate-900 text-white relative">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-4 border-white/10 shadow-xl rounded-2xl">
              <AvatarFallback className="bg-indigo-600 text-2xl font-black">
                {userName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black">
                {userName}
              </DialogTitle>
              <div className="flex gap-2">
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white">
                  {userRole}
                </Badge>
                <Badge
                  className={`${userStatus === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"} border-none`}
                >
                  {userStatus === "active" ? "● Trực tuyến" : "○ Bị khóa"}
                </Badge>
              </div>
              <p className="text-white/50 text-sm">{userEmail}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 bg-slate-50">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-3xl" />
                ))}
            </div>
          ) : (
            stats && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Bài viết",
                      value: stats.postsCount,
                      icon: FileText,
                      color: "text-blue-600",
                    },
                    {
                      label: "Tương tác",
                      value: stats.interactionsCount,
                      icon: Heart,
                      color: "text-rose-600",
                    },
                    {
                      label: "Followers",
                      value: stats.totalFollowersCount,
                      icon: Users,
                      color: "text-indigo-600",
                      trend: stats.followersGrowthPercentage,
                    },
                    {
                      label: "Following",
                      value: stats.totalFollowingCount,
                      icon: UserCheck,
                      color: "text-slate-600",
                    },
                  ].map((item, i) => (
                    <Card
                      key={i}
                      className="border-none shadow-sm rounded-3xl group hover:shadow-md transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          {item.trend !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.trend >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                            >
                              {item.trend >= 0 ? "+" : ""}
                              {item.trend.toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-black text-slate-800">
                          {item.value.toLocaleString()}
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">
                          {item.label}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
