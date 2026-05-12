import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchActivityLogsAsync } from "../profileSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { History, FileText, Heart, MessageCircle } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode }> =
  {
    POST_CREATED: {
      label: "Đăng bài viết",
      icon: <FileText className="w-4 h-4 text-blue-500" />,
    },
    POST_LIKED: {
      label: "Thích bài viết",
      icon: <Heart className="w-4 h-4 text-red-500" />,
    },
    COMMENT_CREATED: {
      label: "Bình luận",
      icon: <MessageCircle className="w-4 h-4 text-green-500" />,
    },
  };

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ActivityLogs = () => {
  const dispatch = useAppDispatch();
  const { activityLogs, activityLogsPage, activityLogsHasMore, isActivityLogsLoading } =
    useAppSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchActivityLogsAsync({ pageNo: 0, pageSize: 20 }));
  }, [dispatch]);

  const handleLoadMore = () => {
    dispatch(
      fetchActivityLogsAsync({ pageNo: activityLogsPage + 1, pageSize: 20 })
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Lịch sử hoạt động
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isActivityLogsLoading && activityLogs.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : activityLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có hoạt động nào được ghi lại.
          </p>
        ) : (
          <>
            {activityLogs.map((log) => {
              const meta = ACTION_LABELS[log.action];
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {meta?.icon ?? <History className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {meta?.label ?? log.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            {activityLogsHasMore && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleLoadMore}
                disabled={isActivityLogsLoading}
              >
                {isActivityLogsLoading ? "Đang tải..." : "Xem thêm"}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
