import { LinkPrediction } from '@/components/ml/LinkPrediction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, TrendingUp } from 'lucide-react';

// Mock data for AI-powered friend suggestions
const mockSuggestions = [
  {
    id: '1',
    name: 'Hoàng Minh D',
    username: 'hoangminhd',
    avatar: null,
    mutualFriends: 5,
    linkScore: 0.92,
    reason: 'Cùng sở thích và bạn bè chung',
  },
  {
    id: '2',
    name: 'Phạm Thu E',
    username: 'phamthue',
    avatar: null,
    mutualFriends: 3,
    linkScore: 0.85,
    reason: 'Tương tác với nội dung tương tự',
  },
  {
    id: '3',
    name: 'Vũ Đức F',
    username: 'vuducf',
    avatar: null,
    mutualFriends: 2,
    linkScore: 0.73,
    reason: 'Cùng vị trí địa lý',
  },
  {
    id: '4',
    name: 'Đỗ Lan G',
    username: 'dolang',
    avatar: null,
    mutualFriends: 1,
    linkScore: 0.68,
    reason: 'Sở thích âm nhạc giống nhau',
  },
  {
    id: '5',
    name: 'Bùi Quốc H',
    username: 'buiquoch',
    avatar: null,
    mutualFriends: 0,
    linkScore: 0.45,
    reason: 'Cùng ngành nghề',
  },
];

export default function PeopleSuggestions() {
  const handleFollow = (userId: string) => {
    console.log('Following user:', userId);
    // TODO: Implement follow functionality
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gợi ý kết bạn</h1>
            <p className="text-muted-foreground">Được hỗ trợ bởi AI Link Prediction</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Độ chính xác</p>
                  <p className="text-lg font-semibold">87.3%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gợi ý hôm nay</p>
                  <p className="text-lg font-semibold">{mockSuggestions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model version</p>
                  <p className="text-lg font-semibold">v2.1.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Explanation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Cách AI dự đoán liên kết
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Các yếu tố được phân tích:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Bạn bè chung và mạng lưới xã hội</li>
                <li>• Sở thích và tương tác nội dung</li>
                <li>• Vị trí địa lý và check-in</li>
                <li>• Thông tin nghề nghiệp và học vấn</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Mức độ tin cậy:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-success">80-100%</Badge>
                  <span className="text-sm">Rất phù hợp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-warning">60-79%</Badge>
                  <span className="text-sm">Phù hợp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">0-59%</Badge>
                  <span className="text-sm">Có thể thích</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <LinkPrediction 
        suggestions={mockSuggestions}
        onFollow={handleFollow}
      />
    </div>
  );
}