import { useState } from 'react';
import { 
  ArrowLeft, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Users, 
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const mockComments = [
  { id: 1, user: 'Nguyễn Văn A', message: 'Hello! 👋', time: '10:30' },
  { id: 2, user: 'Trần Thị B', message: 'Chào mọi người!', time: '10:31' },
  { id: 3, user: 'Lê Văn C', message: 'Live hay quá! ❤️', time: '10:32' },
  { id: 4, user: 'Phạm Thu D', message: 'Đang xem từ Hà Nội', time: '10:33' },
];

export const LiveStudioPage = () => {
  const [isLive, setIsLive] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [liveTitle, setLiveTitle] = useState('');
  const [currentComment, setCurrentComment] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const startLive = () => {
    if (!liveTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu tiêu đề",
        description: "Vui lòng nhập tiêu đề cho buổi live.",
      });
      return;
    }

    setIsLive(true);
    setViewerCount(1);
    
    // Simulate viewer growth
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    toast({
      title: "Bắt đầu Live!",
      description: "Buổi live của bạn đã được bắt đầu.",
    });

    return () => clearInterval(interval);
  };

  const endLive = () => {
    setIsLive(false);
    setViewerCount(0);
    
    toast({
      title: "Kết thúc Live",
      description: "Buổi live đã kết thúc. Cảm ơn bạn đã chia sẻ!",
    });
  };

  const sendComment = () => {
    if (currentComment.trim()) {
      // Here you would send the comment to your live chat system
      setCurrentComment('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold text-lg">Live Studio</h1>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Live Preview */}
        <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
          {/* Camera Preview */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {isVideoOn ? (
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm opacity-80">Camera Preview</p>
                <p className="text-xs opacity-60">(Demo - Camera không khả dụng)</p>
              </div>
            ) : (
              <div className="text-center text-white">
                <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm opacity-80">Camera tắt</p>
              </div>
            )}
          </div>

          {/* Live Indicator */}
          {isLive && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="animate-pulse">
                🔴 LIVE
              </Badge>
            </div>
          )}

          {/* Live Stats */}
          {isLive && (
            <div className="absolute top-4 right-4 space-y-2">
              <div className="bg-black/50 rounded-full px-3 py-1 text-white text-sm flex items-center gap-1">
                <Users className="w-3 h-3" />
                {viewerCount}
              </div>
              <div className="bg-black/50 rounded-full px-3 py-1 text-white text-sm flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {likeCount}
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Button
              onClick={() => setIsVideoOn(!isVideoOn)}
              variant="ghost"
              size="sm"
              className={`h-12 w-12 rounded-full ${
                isVideoOn 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={() => setIsAudioOn(!isAudioOn)}
              variant="ghost"
              size="sm"
              className={`h-12 w-12 rounded-full ${
                isAudioOn 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Live Controls */}
        <div className="p-4 space-y-4">
          {!isLive ? (
            /* Setup */
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tiêu đề Live
                </label>
                <Input
                  placeholder="Nhập tiêu đề cho buổi live..."
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {liveTitle.length}/100 ký tự
                </p>
              </div>

              <Button
                onClick={startLive}
                className="w-full bg-gradient-instagram hover:opacity-90"
                size="lg"
              >
                Bắt đầu Live
              </Button>
            </div>
          ) : (
            /* Live Session */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{liveTitle}</h3>
                <Button
                  onClick={endLive}
                  variant="destructive"
                  size="sm"
                >
                  Kết thúc
                </Button>
              </div>

              {/* Live Chat */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">Bình luận trực tiếp</h4>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Heart className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Share2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-medium text-primary">
                          {comment.user}
                        </span>
                        <span className="ml-2">{comment.message}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {comment.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Thêm bình luận..."
                      value={currentComment}
                      onChange={(e) => setCurrentComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendComment}
                      size="sm"
                      disabled={!currentComment.trim()}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};