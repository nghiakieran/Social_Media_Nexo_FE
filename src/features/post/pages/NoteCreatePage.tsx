import { useState } from 'react';
import { ArrowLeft, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const backgroundPresets = [
  {
    id: 'gradient1',
    name: 'Sunset',
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
  },
  {
    id: 'gradient2',
    name: 'Ocean',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
  },
  {
    id: 'gradient3',
    name: 'Forest',
    background: 'linear-gradient(135deg, #56ab2f, #a8e6cf)',
  },
  {
    id: 'gradient4',
    name: 'Berry',
    background: 'linear-gradient(135deg, #8360c3, #2ebf91)',
  },
  {
    id: 'gradient5',
    name: 'Fire',
    background: 'linear-gradient(135deg, #ff9a56, #ff6b6b)',
  },
  {
    id: 'gradient6',
    name: 'Sky',
    background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
  },
  {
    id: 'solid1',
    name: 'Black',
    background: '#000000',
  },
  {
    id: 'solid2',
    name: 'White',
    background: '#ffffff',
  },
];

const fontSizes = [
  { id: 'small', name: 'Nhỏ', className: 'text-sm' },
  { id: 'medium', name: 'Vừa', className: 'text-base' },
  { id: 'large', name: 'Lớn', className: 'text-lg' },
  { id: 'xl', name: 'Rất lớn', className: 'text-xl' },
];

export const NoteCreatePage = () => {
  const [noteText, setNoteText] = useState('');
  const [selectedBackground, setSelectedBackground] = useState(backgroundPresets[0]);
  const [selectedFontSize, setSelectedFontSize] = useState(fontSizes[1]);
  const [textColor, setTextColor] = useState('#ffffff');
  const [isPosting, setIsPosting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePost = async () => {
    if (!noteText.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu nội dung",
        description: "Vui lòng nhập nội dung cho Note.",
      });
      return;
    }

    setIsPosting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Đăng Note thành công!",
        description: "Note của bạn đã được chia sẻ.",
      });

      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng Note. Vui lòng thử lại.",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getTextColorForBackground = (bg: string) => {
    // Simple logic to determine if text should be light or dark
    if (bg === '#ffffff') return '#000000';
    if (bg === '#000000') return '#ffffff';
    return '#ffffff'; // Default to white for gradients
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold text-lg">Tạo Note</h1>
          </div>
          
          <Button
            onClick={handlePost}
            disabled={!noteText.trim() || isPosting}
            variant="instagram"
            size="sm"
          >
            {isPosting ? 'Đang đăng...' : 'Đăng'}
          </Button>
        </div>

        {/* Note Preview */}
        <div className="p-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="aspect-square flex items-center justify-center p-6 relative"
                style={{ 
                  background: selectedBackground.background,
                  color: getTextColorForBackground(selectedBackground.background)
                }}
              >
                <div className="text-center w-full">
                  {noteText ? (
                    <p 
                      className={`${selectedFontSize.className} font-medium leading-relaxed break-words`}
                      style={{ color: textColor }}
                    >
                      {noteText}
                    </p>
                  ) : (
                    <p className="text-white/70 text-sm">
                      Nhập nội dung Note của bạn...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Text Input */}
        <div className="px-4 pb-4">
          <Textarea
            placeholder="Viết gì đó thú vị..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={280}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {noteText.length}/280 ký tự
          </p>
        </div>

        {/* Customization Options */}
        <div className="px-4 space-y-6">
          {/* Background Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" />
              <span className="font-medium text-sm">Nền</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {backgroundPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedBackground(preset)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all
                    ${selectedBackground.id === preset.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-muted-foreground'
                    }
                  `}
                  style={{ background: preset.background }}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4" />
              <span className="font-medium text-sm">Kích thước chữ</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {fontSizes.map((size) => (
                <Button
                  key={size.id}
                  onClick={() => setSelectedFontSize(size)}
                  variant={selectedFontSize.id === size.id ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {size.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-4 h-4 rounded border border-border" 
                style={{ backgroundColor: textColor }}
              />
              <span className="font-medium text-sm">Màu chữ</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTextColor('#ffffff')}
                className={`w-8 h-8 rounded-full border-2 ${
                  textColor === '#ffffff' ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: '#ffffff' }}
              />
              <button
                onClick={() => setTextColor('#000000')}
                className={`w-8 h-8 rounded-full border-2 ${
                  textColor === '#000000' ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: '#000000' }}
              />
              <button
                onClick={() => setTextColor('#ff6b6b')}
                className={`w-8 h-8 rounded-full border-2 ${
                  textColor === '#ff6b6b' ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: '#ff6b6b' }}
              />
              <button
                onClick={() => setTextColor('#4ecdc4')}
                className={`w-8 h-8 rounded-full border-2 ${
                  textColor === '#4ecdc4' ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: '#4ecdc4' }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />

        {/* Loading Overlay */}
        {isPosting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm font-medium">Đang đăng Note...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};