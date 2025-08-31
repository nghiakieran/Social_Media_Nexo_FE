import { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle,
  Share,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

const mockStories = [
  {
    id: 'story1',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    userAvatar: 'https://picsum.photos/40/40?random=101',
    media: {
      type: 'image' as const,
      url: 'https://picsum.photos/400/700?random=201',
    },
    text: 'Ngày mới tuyệt vời! 🌟',
    backgroundColor: 'transparent',
    duration: 5000,
    createdAt: '2024-01-15T10:00:00Z',
    viewsCount: 45,
    isViewed: false,
  },
  {
    id: 'story2',
    userId: 'user2',
    userName: 'Trần Thị B',
    userAvatar: 'https://picsum.photos/40/40?random=102',
    media: {
      type: 'video' as const,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    text: '',
    backgroundColor: 'transparent',
    duration: 10000,
    createdAt: '2024-01-15T11:30:00Z',
    viewsCount: 23,
    isViewed: false,
  },
  {
    id: 'story3',
    userId: 'user3',
    userName: 'Lê Văn C',
    userAvatar: 'https://picsum.photos/40/40?random=103',
    media: {
      type: 'image' as const,
      url: 'https://picsum.photos/400/700?random=203',
    },
    text: 'Cảm ơn mọi người! ❤️',
    backgroundColor: 'linear-gradient(45deg, #ff6b6b, #feca57)',
    duration: 5000,
    createdAt: '2024-01-15T14:00:00Z',
    viewsCount: 67,
    isViewed: true,
  },
];

export const StoryPage = () => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const navigate = useNavigate();

  const currentStory = mockStories[currentStoryIndex];

  const nextStory = () => {
    if (currentStoryIndex < mockStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      navigate('/');
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  // Auto-progress simulation
  useState(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  });

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Story Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex gap-1">
          {mockStories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: index < currentStoryIndex 
                    ? '100%' 
                    : index === currentStoryIndex 
                      ? `${progress}%` 
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Story Header */}
      <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 border-2 border-white">
            <AvatarImage src={currentStory.userAvatar} alt={currentStory.userName} />
            <AvatarFallback>{currentStory.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{currentStory.userName}</p>
            <p className="text-xs opacity-80">{formatTimeAgo(currentStory.createdAt)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 w-8 p-0 text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="h-8 w-8 p-0 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Story Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: currentStory.backgroundColor !== 'transparent' 
              ? currentStory.backgroundColor 
              : 'black'
          }}
        />

        {/* Media */}
        <div className="relative w-full h-full flex items-center justify-center">
          {currentStory.media.type === 'image' ? (
            <img
              src={currentStory.media.url}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={currentStory.media.url}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              loop
            />
          )}
        </div>

        {/* Story Text */}
        {currentStory.text && (
          <div className="absolute bottom-20 left-4 right-4 text-center">
            <p className="text-white text-lg font-medium drop-shadow-lg">
              {currentStory.text}
            </p>
          </div>
        )}

        {/* Navigation Areas */}
        <button
          onClick={prevStory}
          className="absolute left-0 top-0 w-1/3 h-full z-10 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity"
          disabled={currentStoryIndex === 0}
        >
          <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
        </button>
        
        <button
          onClick={nextStory}
          className="absolute right-0 top-0 w-1/3 h-full z-10 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
        </button>
      </div>

      {/* Story Actions */}
      <div className="absolute bottom-8 left-4 right-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full"
            >
              <Heart className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Story Views */}
      <div className="absolute bottom-2 left-4 text-white text-xs opacity-80">
        {currentStory.viewsCount} lượt xem
      </div>
    </div>
  );
};