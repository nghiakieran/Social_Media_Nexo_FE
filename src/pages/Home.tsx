import { Card, CardContent } from '@/components/ui/card';
import { ViolationDetector } from '@/components/ml/ViolationDetector';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for posts
const mockPosts = [
  {
    id: '1',
    user: {
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar: null,
    },
    content: {
      type: 'image' as const,
      url: 'https://picsum.photos/400/400?random=1',
    },
    caption: 'Sunset view from my balcony 🌅',
    likes: 42,
    comments: 5,
    violationScore: 0.1, // Safe content
  },
  {
    id: '2',
    user: {
      name: 'Trần Thị B',
      username: 'tranthib',
      avatar: null,
    },
    content: {
      type: 'image' as const,
      url: 'https://picsum.photos/400/300?random=2',
    },
    caption: 'Inappropriate content example',
    likes: 15,
    comments: 2,
    violationScore: 0.8, // High violation score
    violationType: 'Nội dung không phù hợp',
  },
  {
    id: '3',
    user: {
      name: 'Lê Văn C',
      username: 'levanc',
      avatar: null,
    },
    content: {
      type: 'image' as const,
      url: 'https://picsum.photos/400/500?random=3',
    },
    caption: 'Warning: This might need review',
    likes: 23,
    comments: 8,
    violationScore: 0.5, // Medium risk
    violationType: 'Nội dung cần xem xét',
  },
];

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Trang chủ</h1>
      
      <div className="space-y-6">
        {mockPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-story p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-instagram"></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium">{post.user.name}</h3>
                <p className="text-sm text-muted-foreground">@{post.user.username}</p>
              </div>
            </div>

            {/* Post Content with Violation Detection */}
            <ViolationDetector
              content={post.content}
              violationScore={post.violationScore}
              violationType={post.violationType}
              className="px-4"
            />

            {/* Post Caption */}
            <CardContent className="pt-4">
              <p className="mb-4">{post.caption}</p>
              
              {/* Post Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}