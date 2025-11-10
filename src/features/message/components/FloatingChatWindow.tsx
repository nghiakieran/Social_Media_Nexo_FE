import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Minus,
  Phone,
  Video,
  MoreHorizontal,
} from 'lucide-react';
import { OnlineIndicator } from './OnlineIndicator';
import { MessageComposer } from './MessageComposer';
import { ReactionMessage } from './ReactionMessage';
import { cn } from '@/lib/utils';
import { Chat, Message } from '../messageSlice';

interface FloatingChatWindowProps {
  chat: Chat;
  messages: Message[];
  isMinimized: boolean;
  position: number;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  onSendMessage: (content: string, type: 'text' | 'image' | 'file' | 'voice') => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string) => void;
  className?: string;
}

export const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({
  chat,
  messages,
  isMinimized,
  position,
  onClose,
  onMinimize,
  onRestore,
  onSendMessage,
  onAddReaction,
  onRemoveReaction,
  className,
}) => {
  const [isTyping, setIsTyping] = useState(false);

  const isCurrentUser = (senderId: string) => senderId === 'currentUser';

  const rightOffset = 20 + (position * 330); // 320px width + 10px margin

  if (isMinimized) {
    return (
      <div
        className={cn(
          'fixed bottom-0 w-80 bg-background border border-border rounded-t-lg shadow-lg transition-all duration-200 z-40',
          className
        )}
        style={{ right: `${rightOffset}px` }}
      >
        <div
          className="flex items-center justify-between p-3 border-b border-border cursor-pointer hover:bg-muted/50"
          onClick={onRestore}
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <OnlineIndicator
                isOnline={chat.isOnline}
                size="sm"
                className="absolute -bottom-0.5 -right-0.5"
              />
            </div>
            <span className="font-medium text-sm">{chat.name}</span>
            {chat.unreadCount > 0 && (
              <div className="bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 w-80 h-96 bg-background border border-border rounded-t-lg shadow-lg flex flex-col transition-all duration-200 z-40',
        className
      )}
      style={{ right: `${rightOffset}px` }}
    >
      {}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <OnlineIndicator
              isOnline={chat.isOnline}
              size="sm"
              className="absolute -bottom-0.5 -right-0.5"
            />
          </div>
          <div>
            <span className="font-medium text-sm">{chat.name}</span>
            {chat.isOnline && (
              <div className="text-xs text-success">Active now</div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Phone className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Video className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMinimize}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.slice(-10).map((message) => { // Show only last 10 messages
            const isOwn = isCurrentUser(message.senderId);
            
            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-end space-x-2',
                  isOwn ? 'justify-end' : 'justify-start'
                )}
              >
                {!isOwn && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}

                <div className={cn(
                  'max-w-[70%]',
                  isOwn ? 'order-1' : 'order-2'
                )}>
                  <div
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm',
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>

                  <ReactionMessage
                    messageId={message.id}
                    reactions={message.reactions}
                    onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
                    onRemoveReaction={() => onRemoveReaction(message.id)}
                    className="mt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {}
      <MessageComposer
        onSendMessage={onSendMessage}
        onTyping={setIsTyping}
        placeholder="Aa"
        className="border-t"
      />
    </div>
  );
};