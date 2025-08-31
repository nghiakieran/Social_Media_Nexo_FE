import { useState } from 'react';
import { Hash, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { mockHashtags } from '../__mocks__/friends';

interface HashtagInputProps {
  onHashtagAdd: (hashtag: string) => void;
}

export const HashtagInput = ({ onHashtagAdd }: HashtagInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const filteredHashtags = mockHashtags.filter(tag =>
    tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  const popularHashtags = mockHashtags.slice(0, 8);

  const handleAddHashtag = (hashtag: string) => {
    const cleanTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    onHashtagAdd(cleanTag);
    setInputValue('');
    setIsOpen(false);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleAddHashtag(inputValue.trim());
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Hash className="w-4 h-4 text-accent" />
          Hashtag
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Thêm hashtag</h4>
            <form onSubmit={handleInputSubmit}>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nhập hashtag..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </form>
          </div>

          {/* Filtered Results */}
          {inputValue && (
            <div>
              <p className="text-sm font-medium mb-2">Kết quả tìm kiếm</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredHashtags.slice(0, 5).map((hashtag) => (
                  <button
                    key={hashtag}
                    onClick={() => handleAddHashtag(hashtag)}
                    className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span>{hashtag.substring(1)}</span>
                    </div>
                  </button>
                ))}
                
                {filteredHashtags.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground">
                    Không tìm thấy hashtag. Nhấn Enter để tạo mới.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Popular Hashtags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">Phổ biến</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularHashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleAddHashtag(hashtag)}
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};