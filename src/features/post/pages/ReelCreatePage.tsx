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
import { useAppDispatch, useAppSelector } from '@/store';
import { createReelThunk } from '@/features/reel/reelSlice';
import { PrivacySelect } from '@/features/post/components/PrivacySelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export const ReelCreatePage = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
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
      const reelData = {
        userId: user?.id ? parseInt(user.id.toString()) : 0,
        caption: description + (hashtags.length > 0 ? ' ' + hashtags.join(' ') : ''),
        visibility: (privacy === 'public' ? 'PUBLIC' : 'PRIVATE') as "PUBLIC" | "PRIVATE",
        mediaUrl: [],
      };

      await dispatch(createReelThunk({ files: [videoFile], reelData })).unwrap();

      toast({
        title: "Tạo Reel thành công!",
        description: "Reel của bạn đã được đăng.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error || "Có lỗi xảy ra khi tạo Reel. Vui lòng thử lại.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
      <div className="container mx-auto max-w-4xl px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-5 sm:mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between relative min-h-[56px] w-full">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="absolute left-0 h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full transition-colors z-10 hover:bg-muted/80"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </Button>
              <div className="flex-1 flex flex-col items-center text-center px-10">
                <div className="flex items-center gap-2 mb-1.5 justify-center">
                  <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex-shrink-0">
                    <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Tạo reel mới
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Chia sẻ video ngắn với mọi người
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!videoFile || isUploading}
                variant="default"
                size="sm"
                className="absolute right-0 h-8 sm:h-9 rounded-xl px-4 shadow-md font-semibold z-10"
              >
                {isUploading ? 'Đang đăng...' : 'Đăng'}
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Card className="border border-border/50 shadow-xl bg-card/80 backdrop-blur-sm w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8 space-y-6">
              {/* Video Preview / Upload Area */}
              <div className="relative aspect-[9/16] max-w-xs sm:max-w-sm mx-auto bg-muted rounded-2xl overflow-hidden flex items-center justify-center border border-border/50 shadow-md">
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Button
                        onClick={handlePlay}
                        variant="ghost"
                        size="lg"
                        className="h-14 w-14 rounded-full bg-black/40 hover:bg-black/60 text-white p-0 shadow-lg border border-white/10"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </Button>
                    </div>

                    {/* Video Actions */}
                    <div className="absolute top-3 right-3 space-y-2">
                      <Button
                        onClick={handleMute}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white shadow-md border border-white/10"
                      >
                        {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                      </Button>
                    </div>

                    {/* Effect Buttons */}
                    <div className="absolute bottom-3 right-3 space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white shadow-md border border-white/10"
                      >
                        <Music className="w-4.5 h-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white shadow-md border border-white/10"
                      >
                        <Scissors className="w-4.5 h-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white shadow-md border border-white/10"
                      >
                        <Sparkles className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-bold mb-1.5 text-foreground">Chọn video cho Reel</p>
                      <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed mb-4">
                        Kéo thả file vào đây hoặc click để chọn. Chỉ hỗ trợ file video (MP4, MOV, AVI...) • Tối đa 100MB
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="default"
                        size="sm"
                        className="rounded-xl shadow-md font-semibold"
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

              {/* Form Fields */}
              <div className="space-y-4 sm:space-y-5">
                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-semibold">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Viết mô tả cho Reel của bạn..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] resize-none rounded-xl border border-border/50 focus-visible:ring-0 p-3 text-sm"
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <Label htmlFor="hashtags" className="text-sm font-semibold">Hashtags</Label>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 px-2 py-0.5 rounded-full text-xs font-medium">
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
                    placeholder="Thêm hashtag (ấn Enter để thêm)..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          addHashtag(value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="h-10 rounded-xl border border-border/50 text-sm focus-visible:ring-0"
                  />
                </div>

                {/* Privacy Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Quyền riêng tư</Label>
                  <div className="border border-border/50 rounded-xl p-3 bg-muted/5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Ai có thể xem Reel này?</span>
                    <PrivacySelect
                      value={privacy}
                      onChange={(val) => setPrivacy(val)}
                      className="w-auto"
                    />
                  </div>
                </div>
              </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl border border-border/50">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <p className="font-bold text-lg text-foreground">Đang tải Reel lên...</p>
                <Progress value={uploadProgress} className="w-full h-2 rounded-full" />
                <p className="text-xs text-muted-foreground font-semibold">
                  {uploadProgress}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};