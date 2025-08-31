import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostComposer } from '../components/PostComposer';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const CreatePostPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (postData: any) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Đăng bài thành công!",
        description: "Bài viết của bạn đã được đăng.",
      });

      // Navigate back to feed
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="font-semibold text-lg">Tạo bài viết</h1>
            </div>
            
            <Button
              onClick={() => {/* Handle quick post */}}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-primary"
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Post Composer */}
        <div className="p-4">
          <PostComposer
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm font-medium">Đang đăng bài viết...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};