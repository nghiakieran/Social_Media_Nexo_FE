import { useState, useRef } from 'react';
import { Send, Smile, AtSign, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

const commonEmojis = [
  '😀', '😂', '🥰', '😍', '🤔', '😮', '😢', '😡',
  '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙌',
  '😎', '🤝', '💪', '🚀', '⭐', '✨', '🎯', '💡',
];

interface CommentComposerProps {
  postId: string;
  placeholder?: string;
  onSubmit: (content: string) => void;
  isLoading?: boolean;
}

export const CommentComposer = ({ 
  postId, 
  placeholder = "Thêm bình luận...", 
  onSubmit,
  isLoading = false 
}: CommentComposerProps) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Nội dung trống",
        description: "Vui lòng nhập nội dung bình luận.",
      });
      return;
    }

    onSubmit(content.trim());
    setContent('');
    
    toast({
      title: "Đã thêm bình luận!",
      duration: 2000,
    });
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      
      // Reset cursor position after emoji insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md p-4">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src="https://picsum.photos/32/32?random=999" alt="Your avatar" />
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={handleContentChange}
              onKeyPress={handleKeyPress}
              className="min-h-[40px] max-h-[120px] resize-none pr-12"
              disabled={isLoading}
            />
            
            {/* Action Icons */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {/* Emoji Picker */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <div className="grid grid-cols-8 gap-1">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Mention Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => insertEmoji('@')}
              >
                <AtSign className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              size="sm"
              className="gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isLoading ? 'Đang gửi...' : 'Gửi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};