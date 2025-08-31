import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  Image,
  Camera,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MessageComposerProps {
  onSendMessage: (content: string, type: 'text' | 'image' | 'file' | 'voice') => void;
  onTyping: (isTyping: boolean) => void;
  className?: string;
  placeholder?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onTyping,
  className,
  placeholder = 'Message...',
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '😍', '😘', '😭', '😊', '🔥', '💯', '🎉'];

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      onTyping(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    // Handle typing indicator
    onTyping(value.length > 0);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileUpload = (type: 'image' | 'file') => {
    // In a real app, this would open a file picker
    onSendMessage(`Uploaded ${type}`, type);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording logic
      setTimeout(() => {
        setIsRecording(false);
        onSendMessage('Voice message', 'voice');
      }, 2000);
    }
  };

  return (
    <div className={cn('p-4 border-t border-border bg-background', className)}>
      <div className="flex items-end space-x-2">
        {/* Emoji picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="grid grid-cols-6 gap-1">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[40px] max-h-[120px] resize-none pr-12 py-2"
            rows={1}
          />
          
          {/* Attachment button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleFileUpload('image')}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleFileUpload('image')}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleFileUpload('file')}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  File
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Send/Voice button */}
        {message.trim() ? (
          <Button
            onClick={handleSend}
            size="icon"
            className="shrink-0 bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={toggleRecording}
            size="icon"
            variant={isRecording ? "destructive" : "ghost"}
            className={cn(
              'shrink-0',
              isRecording && 'animate-pulse'
            )}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};