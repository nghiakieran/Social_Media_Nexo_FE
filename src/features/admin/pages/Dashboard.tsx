import { useState, useEffect, useCallback } from "react";
import {
  Users,
  FileText,
  Heart,
  Flag,
  TrendingUp,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  fetchDashboardCardData,
  fetchUserChartData,
  fetchPostChartData,
  fetchInteractChartData,
  fetchReportChartData,
} from "../api/dashBoardAPI";
import { getExploreHashtags } from "@/features/explore/api/exploreApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export default function Dashboard() {
  const { theme } = useTheme();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: firstDayOfMonth,
    to: today,
  });

  const [isChartsLoading, setIsChartsLoading] = useState(false);
  const [dashboardDataCard, setDashboardDataCard] = useState<any>(null);
  const [charts, setCharts] = useState({
    user: [] as any[],
    post: [] as any[],
    interact: [] as any[],
    report: [] as any[],
  });
  const [topHashtags, setTopHashtags] = useState<any[]>([]);

  // Helper format dữ liệu
  const formatData = (res: any, key: string) => {
    if (!res?.data) return [];
    return res.data.time.map((t: string, i: number) => ({
      date: t,
      [key]: res.data.data[i],
    }));
  };

  // Tối ưu hóa việc gọi API biểu đồ bằng Promise.all
  const loadChartsData = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;

    setIsChartsLoading(true);
    try {
      const [userRes, postRes, interactRes, reportRes] = await Promise.all([
        fetchUserChartData(dateRange.from, dateRange.to),
        fetchPostChartData(dateRange.from, dateRange.to),
        fetchInteractChartData(dateRange.from, dateRange.to),
        fetchReportChartData(dateRange.from, dateRange.to),
      ]);

      setCharts({
        user: formatData(userRes, "users"),
        post: formatData(postRes, "posts"),
        interact: formatData(interactRes, "interactions"),
        report: formatData(reportRes, "reports"),
      });
    } catch (error) {
      console.error("Failed to load charts:", error);
    } finally {
      setIsChartsLoading(false);
    }
  }, [dateRange]);

  // Load Card & Hashtags (Chỉ gọi 1 lần khi mount)
  useEffect(() => {
    const initData = async () => {
      try {
        const [cardRes, hashtagRes] = await Promise.all([
          fetchDashboardCardData(),
          getExploreHashtags(),
        ]);
        setDashboardDataCard(cardRes.data);
        setTopHashtags(hashtagRes.slice(0, 5));
      } catch (error) {
        console.error("Init failed:", error);
      }
    };
    initData();
  }, []);

  // Gọi lại biểu đồ khi dateRange thay đổi
  useEffect(() => {
    loadChartsData();
  }, [loadChartsData]);

  // Chart theme configurations
  const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9";
  const tickColor = theme === "dark" ? "#94a3b8" : "#64748b";

  return (
    <div className="p-1 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Tổng quan <span className="text-indigo-600 dark:text-indigo-400">Hệ thống</span>
          </h1>
          <p className="font-medium text-slate-500 dark:text-slate-400">
            Báo cáo hoạt động chi tiết Nexo Social
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal w-[280px] h-11 rounded-xl shadow-sm bg-background border-border text-foreground hover:bg-muted"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
              {dateRange.from && dateRange.to
                ? `${format(dateRange.from, "dd MMM, yyyy", { locale: vi })} - ${format(dateRange.to, "dd MMM, yyyy", { locale: vi })}`
                : "Chọn khoảng thời gian"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 rounded-2xl shadow-2xl border border-border/50"
            align="end"
          >
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange(range || {})}
              numberOfMonths={2}
              locale={vi}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng người dùng"
          value={dashboardDataCard?.totalUser || 0}
          change={dashboardDataCard?.percentUser || 0}
          icon={Users}
          trend={dashboardDataCard?.percentUser >= 0 ? "up" : "down"}
          gradient="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/15 dark:shadow-none"
        />
        <StatsCard
          title="Bài viết"
          value={dashboardDataCard?.totalPost || 0}
          change={dashboardDataCard?.percentPost || 0}
          icon={FileText}
          trend={dashboardDataCard?.percentPost >= 0 ? "up" : "down"}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-rose-500/15 dark:shadow-none"
        />
        <StatsCard
          title="Tương tác"
          value={dashboardDataCard?.totalInteract || 0}
          change={dashboardDataCard?.percentInteract || 0}
          icon={Heart}
          trend={dashboardDataCard?.percentInteract >= 0 ? "up" : "down"}
          gradient="bg-gradient-to-br from-orange-400 to-amber-600 shadow-lg shadow-amber-500/15 dark:shadow-none"
        />
        <StatsCard
          title="Báo cáo"
          value={dashboardDataCard?.quantityReport || 0}
          change={dashboardDataCard?.percentReport || 0}
          icon={Flag}
          trend={dashboardDataCard?.percentReport >= 0 ? "up" : "down"}
          gradient="bg-gradient-to-br from-red-500 to-slate-800 shadow-lg shadow-red-500/15 dark:shadow-none"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Tăng trưởng người dùng"
          icon={Users}
          loading={isChartsLoading}
        >
          <AreaChart data={charts.user}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
          </AreaChart>
        </ChartContainer>

        <ChartContainer
          title="Nội dung bài viết"
          icon={FileText}
          loading={isChartsLoading}
        >
          <BarChart data={charts.post}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="posts"
              fill="#ec4899"
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ChartContainer>

        <ChartContainer
          title="Lượt tương tác"
          icon={Heart}
          loading={isChartsLoading}
        >
          <LineChart data={charts.interact}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="interactions"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4, fill: "#f59e0b" }}
            />
          </LineChart>
        </ChartContainer>

        <ChartContainer
          title="Khiếu nại & Báo cáo"
          icon={Flag}
          loading={isChartsLoading}
        >
          <BarChart data={charts.report}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="reports"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Trending Hashtags Section */}
      <Card className="overflow-hidden border border-border/50 shadow-xl rounded-[2rem] bg-card text-card-foreground">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
          <CardTitle className="flex items-center gap-3 text-xl font-black">
            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Xu hướng thịnh hành (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {topHashtags.length > 0 ? (
              topHashtags.map((hashtag, index) => (
                <div
                  key={hashtag.id}
                  className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/50 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 font-black rounded-xl bg-muted text-muted-foreground group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {hashtag.name}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {hashtag.usageCount.toLocaleString()} lượt thảo luận
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:border-emerald-500/30">
                      HOT
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                Đang cập nhật dữ liệu xu hướng...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ChartContainer = ({ title, icon: Icon, children, loading }: any) => (
  <Card className="border border-border/50 shadow-xl rounded-3xl overflow-hidden bg-card text-card-foreground group">
    <CardHeader className="pb-0">
      <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6 relative min-h-[300px]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/85 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 shadow-2xl rounded-xl">
        <p className="text-slate-400 text-xs font-bold uppercase mb-1">
          {label}
        </p>
        <p className="text-white text-lg font-black">
          {payload[0].value.toLocaleString()}{" "}
          <span className="text-xs font-normal opacity-50">đơn vị</span>
        </p>
      </div>
    );
  }
  return null;
};
