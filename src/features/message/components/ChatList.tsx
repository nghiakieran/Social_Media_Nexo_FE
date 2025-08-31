import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { OnlineIndicator } from './OnlineIndicator';
import { InstagramStoryRing } from './InstagramStoryRing';
import { cn } from '@/lib/utils';
import { Chat } from '../messageSlice';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Check, CheckCheck } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  className?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChat,
  onChatSelect,
  className,
}) => {
  const formatLastMessageTime = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: false });
  };

  const truncateMessage = (content: string, maxLength: number = 40) => {
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  return (
    <div className={cn('space-y-1', className)}>
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={cn(
            'flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-muted/50 group',
            activeChat === chat.id && 'bg-muted'
          )}
          onClick={() => onChatSelect(chat.id)}
        >
          <InstagramStoryRing
            src={chat.avatar}
            alt={chat.name}
            size="md"
            hasStory={Math.random() > 0.5} // Random story for demo
            hasUnread={chat.unreadCount > 0}
            className="shrink-0"
          >
            <OnlineIndicator
              isOnline={chat.isOnline}
              size="sm"
              className="absolute -bottom-0.5 -right-0.5"
            />
          </InstagramStoryRing>

          <div className="flex-1 ml-3 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={cn(
                'font-medium text-sm truncate',
                chat.unreadCount > 0 && 'font-semibold'
              )}>
                {chat.name}
              </h3>
              <div className="flex items-center space-x-1">
                {chat.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatLastMessageTime(chat.lastMessage.timestamp)}
                  </span>
                )}
                {chat.lastMessage?.senderId === 'currentUser' && (
                  <div className="text-muted-foreground">
                    {chat.lastMessage.isRead ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {chat.lastMessage ? (
                  <p className={cn(
                    'text-sm truncate',
                    chat.unreadCount > 0 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground'
                  )}>
                    {chat.lastMessage.type === 'text' ? (
                      <>
                        {chat.lastMessage.senderId === 'currentUser' && 'You: '}
                        {truncateMessage(chat.lastMessage.content)}
                      </>
                    ) : (
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {chat.lastMessage.type === 'image' && 'Photo'}
                        {chat.lastMessage.type === 'voice' && 'Voice message'}
                        {chat.lastMessage.type === 'file' && 'File'}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Start a conversation</p>
                )}
              </div>
              {chat.unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="min-w-[18px] h-[18px] text-xs flex items-center justify-center ml-2"
                >
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};