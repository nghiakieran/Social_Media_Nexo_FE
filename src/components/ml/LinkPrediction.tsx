import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, TrendingUp } from 'lucide-react';

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  mutualFriends?: number;
  linkScore: number; // 0-1, higher = stronger prediction
  reason: string;
}

interface LinkPredictionProps {
  suggestions: SuggestedUser[];
  onFollow?: (userId: string) => void;
  className?: string;
}

export const LinkPrediction = ({ suggestions, onFollow, className }: LinkPredictionProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-success';
    if (score >= 0.6) return 'bg-warning';
    return 'bg-muted';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Rất phù hợp';
    if (score >= 0.6) return 'Phù hợp';
    return 'Có thể thích';
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <TrendingUp className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-semibold">Gợi ý kết bạn bởi AI</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((user) => (
          <Card key={user.id} className="hover:shadow-medium transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{user.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getScoreColor(user.linkScore)}`}
                      >
                        {getScoreLabel(user.linkScore)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    
                    {/* Prediction Reason */}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{user.reason}</p>
                      {user.mutualFriends && user.mutualFriends > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {user.mutualFriends} bạn chung
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFollow?.(user.id)}
                  className="shrink-0"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Theo dõi
                </Button>
              </div>

              {/* Prediction Score Visualization */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Độ chính xác dự đoán</span>
                  <span>{Math.round(user.linkScore * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${user.linkScore * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};