import React, { useState, useEffect, useRef } from 'react';
import { X, Smile, Users, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { EmojiPicker } from '../../../components/common/EmojiPicker';

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (content: string) => void;
  userAvatar?: string;
  userName?: string;
}

export const NotesDialog: React.FC<NotesDialogProps> = ({
  isOpen,
  onClose,
  onPublish,
  userAvatar,
  userName = 'Your Name',
}) => {
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [privacySetting, setPrivacySetting] = useState('Người theo dõi mà bạn theo dõi lại');
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const handlePublish = async () => {
    if (!content.trim()) return;
    
    setIsPublishing(true);
    try {
      await onPublish(content.trim());
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error publishing note:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setShowEmojiPicker(false);
    onClose();
  };

  const handleEmojiSelect = (emoji: string) => {
    // Insert emoji at cursor position
    if (contentEditableRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update content state after DOM manipulation
        const newContent = contentEditableRef.current.textContent || '';
        setContent(newContent);
      } else {
        // Fallback: append to end
        const newContent = (contentEditableRef.current?.textContent || '') + emoji;
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = newContent;
        }
        setContent(newContent);
      }
    } else {
      setContent(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };


  const handlePrivacyChange = (setting: string) => {
    setPrivacySetting(setting);
  };

  // Initialize contentEditable with empty content
  useEffect(() => {
    if (contentEditableRef.current && !contentEditableRef.current.textContent) {
      contentEditableRef.current.textContent = '';
    }
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <>
      <div 
        role="dialog" 
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-hidden"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              role="button"
              tabIndex={0}
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold text-center flex-1 ml-8">Ghi chú mới</h2>
            <Button
              onClick={handlePublish}
              disabled={!content.trim() || isPublishing}
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:text-gray-400"
              role="button"
              tabIndex={!content.trim() ? -1 : 0}
              aria-disabled={!content.trim() || isPublishing}
            >
              {isPublishing ? 'Đang chia sẻ...' : 'Chia sẻ'}
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Text Input Area */}
            <div className="mb-4">
              <div className="relative">
                <div className="bg-gray-100 rounded-2xl p-4 relative min-h-[80px]">
                  <div className="absolute bottom-0 left-4 transform translate-y-full">
                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-100"></div>
                  </div>
                  <div className="relative">
                  <div 
                    ref={contentEditableRef}
                    className="min-h-[60px] resize-none border-0 focus:outline-none text-base p-0 placeholder:text-gray-500 bg-transparent"
                    contentEditable
                    role="textbox"
                    spellCheck
                    aria-label="Chia sẻ suy nghĩ..."
                    aria-placeholder="Chia sẻ suy nghĩ..."
                    style={{ 
                      userSelect: 'text', 
                      whiteSpace: 'pre-wrap', 
                      wordBreak: 'break-word', 
                      direction: 'ltr',
                      textAlign: 'left'
                    }}
                    onInput={(e) => setContent(e.currentTarget.textContent || '')}
                    onFocus={() => setShowEmojiPicker(false)}
                    suppressContentEditableWarning
                    dir="ltr"
                  />
                    {!content && (
                      <div className="absolute top-0 left-0 pointer-events-none text-gray-500 text-base p-0">
                        Chia sẻ suy nghĩ...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar Preview - Centered */}
            <div className="flex flex-col items-center justify-center gap-4 mb-4 relative">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img 
                  src={userAvatar || "https://picsum.photos/150/150"} 
                  alt={userName} 
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  draggable={false}
                />
              </div>
              <Button 
                ref={emojiButtonRef}
                variant="ghost" 
                size="sm" 
                className="p-2.5 bg-gray-200 hover:bg-gray-400 rounded-full" 
                role="button" 
                tabIndex={0}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-sm hover:bg-gray-400 rounded-full px-3 py-2"
                      role="button"
                      tabIndex={0}
                      aria-expanded={false}
                      aria-haspopup="menu"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Được chia sẻ với <b>{privacySetting}</b></span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-72">
                    <DropdownMenuItem onClick={() => handlePrivacyChange('Người theo dõi mà bạn theo dõi lại')}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Người theo dõi mà bạn theo dõi lại</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrivacyChange('Bạn thân')}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Bạn thân</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Emoji Picker - Outside dialog */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="fixed z-[60]"
          style={{
            top: emojiButtonRef.current ? 
              `${emojiButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 128}px` : 
              '50%',
            left: emojiButtonRef.current ? 
              `${emojiButtonRef.current.getBoundingClientRect().left + window.scrollX + (emojiButtonRef.current.offsetWidth / 2)}px` : 
              '50%',
            transform: emojiButtonRef.current ? 
              'translateX(-50%)' : 
              'translate(-50%, -50%)'
          }}
        >
          <EmojiPicker 
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onEmojiSelect={handleEmojiSelect} 
          />
        </div>
      )}
    </>
  );
};