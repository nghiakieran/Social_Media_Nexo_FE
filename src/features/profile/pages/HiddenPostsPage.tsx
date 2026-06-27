import { ArrowLeft, EyeOff, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LazyImage } from '@/components/common/LazyImage';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Mock data for hidden posts
const mockHiddenPosts = [
  {
    id: '1',
    thumbnail: 'https://picsum.photos/400/400?random=1',
    type: 'image',
    caption: 'Bài viết bị ẩn 1',
    hiddenAt: '2024-01-15',
    author: {
      username: 'user1',
      name: 'User 1',
      avatar: 'https://picsum.photos/150/150?random=10'
    }
  },
  {
    id: '2',
    thumbnail: 'https://picsum.photos/400/400?random=2',
    type: 'video',
    caption: 'Video bị ẩn 1',
    hiddenAt: '2024-01-10',
    author: {
      username: 'user2',
      name: 'User 2',
      avatar: 'https://picsum.photos/150/150?random=11'
    }
  },
  {
    id: '3',
    thumbnail: 'https://picsum.photos/400/400?random=3',
    type: 'image',
    caption: 'Bài viết bị ẩn 2',
    hiddenAt: '2024-01-05',
    author: {
      username: 'user3',
      name: 'User 3',
      avatar: 'https://picsum.photos/150/150?random=12'
    }
  }
];

export const HiddenPostsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUnhide = (postId: string) => {
    toast({
      title: 'Đã hiện bài viết',
      description: 'Bài viết đã được hiện lại trên feed',
    });
    // TODO: Implement unhide API call
    console.log('Unhide post:', postId);
  };

  const handleDelete = (postId: string) => {
    toast({
      title: 'Đã xóa bài viết',
      description: 'Bài viết đã được xóa vĩnh viễn',
    });
    // TODO: Implement delete API call
    console.log('Delete post:', postId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 lg:top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-center px-4 py-3 relative min-h-[48px] max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground text-center">Ẩn tin</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            Những bài viết bạn đã ẩn sẽ không xuất hiện trên feed của bạn nữa.
          </p>
        </div>

        {mockHiddenPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockHiddenPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden group">
                <div className="relative aspect-square">
                  <LazyImage
                    src={post.thumbnail}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Video indicator */}
                  {post.type === 'video' && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/60 rounded-full p-1">
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Hidden indicator */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-black/60 rounded-full p-1">
                      <EyeOff className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnhide(post.id)}
                        className="gap-1 border-primary/25 bg-background/90 hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="w-4 h-4" />
                        Hiện lại
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="gap-1"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium">{post.author.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.caption}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ẩn ngày {new Date(post.hiddenAt).toLocaleDateString('vi-VN')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <EyeOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa ẩn tin nào</h3>
              <p className="text-muted-foreground text-sm">
                Bạn chưa ẩn bài viết nào. Khi bạn ẩn bài viết, chúng sẽ xuất hiện ở đây.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
