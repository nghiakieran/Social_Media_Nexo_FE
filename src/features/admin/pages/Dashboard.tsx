import { useState, useEffect } from "react";
import { Users, FileText, Heart, Flag, TrendingUp } from "lucide-react";
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
  Legend,
} from "recharts";
import { MockChartData, MockTopHashtags } from "../__mocks__/mockDatas";
import {
  fetchDashboardCardData,
  fetchUserChartData,
  fetchPostChartData,
  fetchInteractChartData,
  fetchReportChartData,
} from "../api/dashBoardAPI";

const mockChartData = MockChartData;

const topHashtags = MockTopHashtags;

export default function Dashboard() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: firstDayOfMonth,
    to: today,
  });
  const [dashboardDataCard, setDashboardDataCard] = useState(null);
  const [userChart, setUserChart] = useState(null);
  const [postChart, setPostChart] = useState(null);
  const [interactChart, setInteractChart] = useState(null);
  const [reportChart, setReportChart] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (dateRange.from && dateRange.to) {
        const userRes = await fetchUserChartData(dateRange.from, dateRange.to);
        const postRes = await fetchPostChartData(dateRange.from, dateRange.to);
        const interactRes = await fetchInteractChartData(
          dateRange.from,
          dateRange.to
        );
        const reportRes = await fetchReportChartData(
          dateRange.from,
          dateRange.to
        );

        // console.log("User Data:", userRes);
        // console.log("Post Data:", postRes);
        // console.log("Interact Data:", interactRes);
        // console.log("Report Data:", reportRes);
        setUserChart(
          formatChartData(userRes.data.time, userRes.data.data, "users")
        );
        setPostChart(
          formatChartData(postRes.data.time, postRes.data.data, "posts")
        );
        setInteractChart(
          formatChartData(
            interactRes.data.time,
            interactRes.data.data,
            "interactions"
          )
        );
        setReportChart(
          formatChartData(reportRes.data.time, reportRes.data.data, "reports")
        );
      }
    };
    loadData();
    if (dateRange.from && dateRange.to) {
      fetchUserChartData(dateRange.from, dateRange.to);
    }
  }, [dateRange]);

  useEffect(() => {
    const loadCardData = async () => {
      const data = await fetchDashboardCardData();
      setDashboardDataCard(data.data);
    };
    loadCardData();
  }, []);

  const formatChartData = (time: string[], data: number[], key: string) => {
    return time.map((t, i) => ({ date: t, [key]: data[i] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Tổng quan hoạt động hệ thống</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {dateRange.from && dateRange.to
                ? `${format(dateRange.from, "dd/MM/yyyy", {
                    locale: vi,
                  })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: vi })}`
                : "Chọn khoảng thời gian"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange(range || {})}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng người dùng"
          value={dashboardDataCard?.totalUser || 0}
          change={dashboardDataCard?.percentUser || 0}
          icon={Users}
          trend={dashboardDataCard?.percentUser >= 0 ? "up" : "down"}
          gradient="bg-gradient-to-br from-instagram-purple to-instagram-pink"
        />
        <StatsCard
          title="Bài viết"
          value={dashboardDataCard?.totalPost || 0}
          change={dashboardDataCard?.percentPost || 0}
          icon={FileText}
          trend={dashboardDataCard?.percentPost >= 0 ? "up" : "down"}
          gradient="bg-gradient-to-br from-instagram-pink to-instagram-orange"
        />
        <StatsCard
          title="Tương tác"
          value={dashboardDataCard?.totalInteract || 0}
          change={dashboardDataCard?.percentInteract || 0}
          icon={Heart}
          trend={dashboardDataCard?.percentInteract >= 0 ? "up" : "down"}
          gradient="bg-gradient-to-br from-instagram-orange to-instagram-yellow"
        />
        <StatsCard
          title="Báo cáo"
          value={dashboardDataCard?.quantityReport || 0}
          change={dashboardDataCard?.percentReport || 0}
          icon={Flag}
          trend={dashboardDataCard?.percentReport >= 0 ? "up" : "down"}
          gradient="bg-gradient-to-br from-destructive/80 to-destructive"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Người dùng mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--instagram-purple))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--instagram-purple))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Bài viết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={postChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar
                  dataKey="posts"
                  fill="hsl(var(--instagram-pink))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Lượt tương tác
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={interactChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="interactions"
                  stroke="hsl(var(--instagram-orange))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--instagram-orange))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Báo cáo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar
                  dataKey="reports"
                  fill="hsl(var(--destructive))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 5 Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHashtags.map((hashtag, index) => (
              <div key={hashtag.tag} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{hashtag.tag}</p>
                  <p className="text-sm text-muted-foreground">
                    {hashtag.count} lượt sử dụng
                  </p>
                </div>
                <span className="text-sm font-medium text-success">
                  {hashtag.trend}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
