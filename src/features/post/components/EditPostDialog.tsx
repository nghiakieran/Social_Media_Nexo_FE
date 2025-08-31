import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    privacy: 'public' | 'friends' | 'private';
    hashtags: string[];
    taggedUsers: string[];
    location?: string;
  };
  onSave: (postId: string, updatedData: any) => void;
}

export const EditPostDialog = ({ 
  isOpen, 
  onClose, 
  post, 
  onSave 
}: EditPostDialogProps) => {
  const [content, setContent] = useState(post.content);
  const [privacy, setPrivacy] = useState(post.privacy);
  const [hashtags, setHashtags] = useState(post.hashtags);
  const [taggedUsers, setTaggedUsers] = useState(post.taggedUsers);
  const [location, setLocation] = useState(post.location || '');
  const { toast } = useToast();

  useEffect(() => {
    setContent(post.content);
    setPrivacy(post.privacy);
    setHashtags(post.hashtags);
    setTaggedUsers(post.taggedUsers);
    setLocation(post.location || '');
  }, [post]);

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Nội dung bài viết không được để trống.",
      });
      return;
    }

    onSave(post.id, {
      content: content.trim(),
      privacy,
      hashtags,
      taggedUsers,
      location: location.trim(),
    });

    toast({
      title: "Cập nhật thành công!",
      description: "Bài viết đã được cập nhật.",
    });

    onClose();
  };

  const removeHashtag = (hashtagToRemove: string) => {
    setHashtags(prev => prev.filter(tag => tag !== hashtagToRemove));
  };

  const removeTaggedUser = (userToRemove: string) => {
    setTaggedUsers(prev => prev.filter(user => user !== userToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Nội dung
            </label>
            <Textarea
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Privacy */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Quyền riêng tư
            </label>
            <Select value={privacy} onValueChange={(value: any) => setPrivacy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">🌍 Công khai</SelectItem>
                <SelectItem value="friends">👥 Bạn bè</SelectItem>
                <SelectItem value="private">🔒 Chỉ mình tôi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Hashtags
              </label>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => removeHashtag(tag)}
                      className="hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tagged Users */}
          {taggedUsers.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Người được gắn thẻ
              </label>
              <div className="flex flex-wrap gap-2">
                {taggedUsers.map((user) => (
                  <Badge key={user} variant="outline" className="gap-1">
                    @{user}
                    <button
                      onClick={() => removeTaggedUser(user)}
                      className="hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Vị trí
            </label>
            <Textarea
              placeholder="Thêm vị trí..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSave} variant="instagram">
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};