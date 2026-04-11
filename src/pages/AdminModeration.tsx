import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ViolationDetector } from '@/components/ml/ViolationDetector';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';

// Mock data for content moderation
const mockReports = [
  {
    id: '1',
    type: 'image',
    url: 'https://picsum.photos/300/200?random=10',
    reportedBy: 'user123',
    reportReason: 'Nội dung không phù hợp',
    aiScore: 0.89,
    aiType: 'Hình ảnh nhạy cảm',
    status: 'pending',
    timestamp: '2024-01-15 14:30',
  },
  {
    id: '2',
    type: 'text',
    content: 'This is an example of potentially harmful text content that needs review...',
    reportedBy: 'user456',
    reportReason: 'Ngôn từ thù địch',
    aiScore: 0.75,
    aiType: 'Hate speech',
    status: 'pending',
    timestamp: '2024-01-15 13:15',
  },
  {
    id: '3',
    type: 'image',
    url: 'https://picsum.photos/300/200?random=11',
    reportedBy: 'user789',
    reportReason: 'Spam',
    aiScore: 0.45,
    aiType: 'Nội dung spam',
    status: 'approved',
    timestamp: '2024-01-15 12:00',
  },
];

const stats = {
  totalReports: 156,
  pendingReports: 23,
  todayProcessed: 45,
  aiAccuracy: 91.2,
};

export default function AdminModeration() {
  const handleApprove = (reportId: string) => {
    console.log('Approving report:', reportId);
  };

  const handleReject = (reportId: string) => {
    console.log('Rejecting report:', reportId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      case 'approved':
        return <Badge className="bg-success">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return { label: 'Cao', color: 'text-red-500' };
    if (score >= 0.4) return { label: 'Trung bình', color: 'text-yellow-500' };
    return { label: 'Thấp', color: 'text-green-500' };
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Kiểm duyệt nội dung</h1>
            <p className="text-muted-foreground">Hệ thống AI phát hiện vi phạm tự động</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng báo cáo</p>
                  <p className="text-lg font-semibold">{stats.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chờ xử lý</p>
                  <p className="text-lg font-semibold">{stats.pendingReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Xử lý hôm nay</p>
                  <p className="text-lg font-semibold">{stats.todayProcessed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Độ chính xác AI</p>
                  <p className="text-lg font-semibold">{stats.aiAccuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reports */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Báo cáo cần xử lý</h2>
        
        {mockReports.map((report) => {
          const riskLevel = getRiskLevel(report.aiScore);
          
          return (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Báo cáo #{report.id}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    <Badge variant="outline" className={riskLevel.color}>
                      Risk: {riskLevel.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Content Preview */}
                  <div>
                    <h4 className="font-medium mb-3">Nội dung được báo cáo:</h4>
                    {report.type === 'image' ? (
                      <ViolationDetector
                        content={{
                          type: 'image',
                          url: report.url,
                        }}
                        violationScore={report.aiScore}
                        violationType={report.aiType}
                        className="max-w-sm"
                      />
                    ) : (
                      <ViolationDetector
                        content={{
                          type: 'text',
                          text: report.content,
                        }}
                        violationScore={report.aiScore}
                        violationType={report.aiType}
                        className="p-4 bg-muted rounded-lg"
                      />
                    )}
                  </div>

                  {/* Report Details */}
                  <div>
                    <h4 className="font-medium mb-3">Chi tiết báo cáo:</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Người báo cáo:</p>
                        <p className="font-medium">@{report.reportedBy}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Lý do báo cáo:</p>
                        <p className="font-medium">{report.reportReason}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Phân tích AI:</p>
                        <p className="font-medium">{report.aiType}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">Confidence:</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${report.aiScore * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(report.aiScore * 100)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Thời gian:</p>
                        <p className="font-medium">{report.timestamp}</p>
                      </div>

                      {/* Actions */}
                      {report.status === 'pending' && (
                        <div className="flex gap-2 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => handleApprove(report.id)}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Duyệt
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleReject(report.id)}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}