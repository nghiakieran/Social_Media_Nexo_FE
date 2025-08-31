import { useState, useRef } from 'react';
import { 
  Image, 
  Video, 
  MapPin, 
  Users, 
  Globe, 
  Lock, 
  Eye,
  X,
  Camera,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaUploader } from './MediaUploader';
import { TagFriends } from './TagFriends';
import { HashtagInput } from './HashtagInput';
import { PrivacySelect } from './PrivacySelect';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  file: File;
}

interface PostComposerProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const PostComposer = ({ onSubmit, isLoading = false }: PostComposerProps) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showTagFriends, setShowTagFriends] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();


  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập nội dung hoặc thêm media.",
      });
      return;
    }

    try {
      await onSubmit({
        content: content.trim(),
        media,
        privacy,
        taggedUsers: taggedFriends,
        hashtags,
        location: location.trim(),
      });

      // Reset form
      setContent('');
      setMedia([]);
      setTaggedFriends([]);
      setHashtags([]);
      setLocation('');
      setPrivacy('public');
    } catch (error) {
      console.error('Post submission error:', error);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const removeMedia = (id: string) => {
    setMedia(prev => prev.filter(item => item.id !== id));
  };

  

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* User Avatar & Privacy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-story p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-instagram"></div>
                </div>
              </div>
              <div>
                <p className="font-medium">Demo User</p>
                <PrivacySelect 
                  value={privacy} 
                  onChange={setPrivacy}
                  className="w-auto h-auto p-1 border-0 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Content Input */}
          <div>
            <Textarea
              ref={textareaRef}
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={handleContentChange}
              className="border-0 resize-none text-lg p-0 min-h-[80px] max-h-[200px] focus-visible:ring-0"
            />
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => setHashtags(prev => prev.filter(t => t !== tag))}
                    className="hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Tagged Friends */}
          {taggedFriends.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>với {taggedFriends.join(', ')}</span>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>tại {location}</span>
            </div>
          )}

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {media.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                  </div>
                  <button
                    onClick={() => removeMedia(item.id)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Media Uploader */}
          {showMediaUploader && (
            <MediaUploader
              onUpload={setMedia}
              onClose={() => setShowMediaUploader(false)}
              existingMedia={media}
            />
          )}

          {/* Tag Friends */}
          {showTagFriends && (
            <TagFriends
              selectedFriends={taggedFriends}
              onSelectionChange={setTaggedFriends}
              onClose={() => setShowTagFriends(false)}
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaUploader(!showMediaUploader)}
                className="gap-2"
              >
                <Image className="w-4 h-4 text-success" />
                Ảnh/Video
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTagFriends(!showTagFriends)}
                className="gap-2"
              >
                <Users className="w-4 h-4 text-primary" />
                Gắn thẻ
              </Button>

              <HashtagInput
                onHashtagAdd={(tag) => {
                  if (!hashtags.includes(tag)) {
                    setHashtags(prev => [...prev, tag]);
                  }
                }}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && media.length === 0)}
              variant="instagram"
              className="px-8"
            >
              {isLoading ? 'Đang đăng...' : 'Đăng'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};