import { useState } from "react";
import { Users, FileText, Heart, Flag, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

const mockChartData = [
  { date: "01/11", users: 400, posts: 240, interactions: 1200, reports: 12 },
  { date: "05/11", users: 450, posts: 280, interactions: 1400, reports: 10 },
  { date: "10/11", users: 520, posts: 320, interactions: 1600, reports: 8 },
  { date: "15/11", users: 580, posts: 380, interactions: 1800, reports: 15 },
  { date: "20/11", users: 640, posts: 420, interactions: 2100, reports: 11 },
  { date: "25/11", users: 720, posts: 480, interactions: 2400, reports: 9 },
  { date: "30/11", users: 800, posts: 520, interactions: 2800, reports: 7 },
];

const topHashtags = [
  { tag: "#travel", count: 1250, trend: "+12%" },
  { tag: "#food", count: 980, trend: "+8%" },
  { tag: "#fashion", count: 875, trend: "+15%" },
  { tag: "#fitness", count: 720, trend: "+5%" },
  { tag: "#photography", count: 650, trend: "+10%" },
];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(2024, 10, 1),
    to: new Date(2024, 10, 30),
  });

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
                ? `${format(dateRange.from, "dd/MM/yyyy", { locale: vi })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: vi })}`
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
          value="15,234"
          change={12.5}
          icon={Users}
          trend="up"
          gradient="bg-gradient-to-br from-instagram-purple to-instagram-pink"
        />
        <StatsCard
          title="Bài viết"
          value="8,420"
          change={8.2}
          icon={FileText}
          trend="up"
          gradient="bg-gradient-to-br from-instagram-pink to-instagram-orange"
        />
        <StatsCard
          title="Tương tác"
          value="45.6K"
          change={15.3}
          icon={Heart}
          trend="up"
          gradient="bg-gradient-to-br from-instagram-orange to-instagram-yellow"
        />
        <StatsCard
          title="Báo cáo"
          value="127"
          change={-5.4}
          icon={Flag}
          trend="down"
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
              <LineChart data={mockChartData}>
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
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="posts" fill="hsl(var(--instagram-pink))" radius={[8, 8, 0, 0]} />
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
              <LineChart data={mockChartData}>
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
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="reports" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
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
                  <p className="text-sm text-muted-foreground">{hashtag.count} lượt sử dụng</p>
                </div>
                <span className="text-sm font-medium text-success">{hashtag.trend}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
