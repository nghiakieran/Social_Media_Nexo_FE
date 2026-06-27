import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchActivityLogsAsync } from "../profileSlice";
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
    <div>
      <div className="px-4 pt-5 pb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Lịch sử hoạt động
        </p>
      </div>
      <div className="bg-card sm:mx-4 sm:rounded-xl overflow-hidden border-t border-b sm:border border-border">
        {isActivityLogsLoading && activityLogs.length === 0 ? (
          <div className="px-4 py-3 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : activityLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 px-4">
            Chưa có hoạt động nào được ghi lại.
          </p>
        ) : (
          <>
            {activityLogs.map((log) => {
              const meta = ACTION_LABELS[log.action];
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"
                >
                  <div className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    {meta?.icon ?? <History className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
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
              <button
                className="w-full text-sm text-primary py-3 hover:bg-accent/50 transition-colors"
                onClick={handleLoadMore}
                disabled={isActivityLogsLoading}
              >
                {isActivityLogsLoading ? "Đang tải..." : "Xem thêm"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
