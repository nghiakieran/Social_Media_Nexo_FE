import { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Music, 
  Scissors, 
  Sparkles, 
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const ReelCreatePage = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          variant: "destructive",
          title: "File quá lớn",
          description: "Video không được vượt quá 100MB.",
        });
        return;
      }
      
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    } else {
      toast({
        variant: "destructive",
        title: "File không hợp lệ",
        description: "Vui lòng chọn file video.",
      });
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const addHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!hashtags.includes(cleanTag)) {
      setHashtags(prev => [...prev, cleanTag]);
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!videoFile) {
      toast({
        variant: "destructive",
        title: "Thiếu video",
        description: "Vui lòng chọn video để tạo Reel.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      toast({
        title: "Tạo Reel thành công!",
        description: "Reel của bạn đã được đăng.",
      });

      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo Reel. Vui lòng thử lại.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold text-lg">Tạo Reel</h1>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!videoFile || isUploading}
            className="bg-gradient-instagram hover:opacity-90"
            size="sm"
          >
            {isUploading ? 'Đang đăng...' : 'Đăng'}
          </Button>
        </div>

        {/* Video Preview Area */}
        <div className="relative aspect-[9/16] bg-gray-900 flex items-center justify-center">
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={handlePlay}
                  variant="ghost"
                  size="lg"
                  className="h-16 w-16 rounded-full bg-black/30 hover:bg-black/50 text-white"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
              </div>

              {/* Video Actions */}
              <div className="absolute top-4 right-4 space-y-2">
                <Button
                  onClick={handleMute}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-black/30 hover:bg-black/50 text-white"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>

              {/* Effect Buttons */}
              <div className="absolute bottom-4 right-4 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-black/30 hover:bg-black/50 text-white"
                >
                  <Music className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-black/30 hover:bg-black/50 text-white"
                >
                  <Scissors className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-black/30 hover:bg-black/50 text-white"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium mb-2">Chọn video</p>
                <p className="text-sm text-gray-400 mb-4">
                  Tải lên video dọc với tỷ lệ 9:16
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-instagram hover:opacity-90"
                >
                  Chọn từ thư viện
                </Button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Description & Settings */}
        <div className="p-4 space-y-4 bg-background">
          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">
              Mô tả
            </label>
            <Textarea
              placeholder="Viết mô tả cho Reel của bạn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-muted text-foreground"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-foreground">
              Hashtags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeHashtag(tag)}
                    className="hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Thêm hashtag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value) {
                    addHashtag(value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              className="bg-muted text-foreground"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <div>
                  <p className="font-medium mb-2">Đang tạo Reel...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {uploadProgress}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};