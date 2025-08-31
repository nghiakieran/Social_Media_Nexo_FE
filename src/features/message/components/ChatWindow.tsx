import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Phone,
  Video,
  MoreVertical,
  Reply,
  Copy,
  Forward,
  Trash2,
  Check,
  CheckCheck,
} from 'lucide-react';
import { OnlineIndicator } from './OnlineIndicator';
import { TypingIndicator } from './TypingIndicator';
import { ReactionMessage } from './ReactionMessage';
import { ForwardMessageDialog } from './ForwardMessageDialog';
import { CallDialog } from './CallDialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Message, Chat } from '../messageSlice';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  isTyping: boolean;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string) => void;
  onForwardMessage: (messageId: string, userIds: string[]) => void;
  onDeleteMessage: (messageId: string) => void;
  onReplyToMessage: (messageId: string) => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  isTyping,
  onAddReaction,
  onRemoveReaction,
  onForwardMessage,
  onDeleteMessage,
  onReplyToMessage,
  className,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [forwardDialog, setForwardDialog] = useState<{
    open: boolean;
    messageId: string;
    content: string;
  }>({ open: false, messageId: '', content: '' });
  const [callDialog, setCallDialog] = useState<{
    open: boolean;
    type: 'voice' | 'video';
  }>({ open: false, type: 'voice' });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessageTime = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  const isCurrentUser = (senderId: string) => senderId === 'currentUser';

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleForwardMessage = (messageId: string, content: string) => {
    setForwardDialog({ open: true, messageId, content });
  };

  const handleForwardConfirm = (userIds: string[]) => {
    onForwardMessage(forwardDialog.messageId, userIds);
    setForwardDialog({ open: false, messageId: '', content: '' });
  };

  const handleCall = (type: 'voice' | 'video') => {
    setCallDialog({ open: true, type });
  };

  return (
    <>
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
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
              <h3 className="font-semibold">{chat.name}</h3>
              <p className="text-sm text-muted-foreground">
                {chat.isOnline ? 'Active now' : 
                  chat.lastSeen ? `Last seen ${formatMessageTime(chat.lastSeen)}` : 'Offline'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCall('voice')}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCall('video')}
            >
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Search in Chat</DropdownMenuItem>
                <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = isCurrentUser(message.senderId);
              const showTimestamp = index === 0 || 
                Math.abs(new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime()) > 300000; // 5 minutes
              
              return (
                <div key={message.id} className="space-y-2">
                  {showTimestamp && (
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      'group flex items-end space-x-2 animate-in slide-in-from-bottom-2 duration-300',
                      isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={chat.avatar} alt={chat.name} />
                        <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className={cn(
                      'max-w-[70%] relative',
                      isOwn ? 'order-1' : 'order-2'
                    )}>
                      <div
                        className={cn(
                          'px-4 py-2 rounded-2xl relative',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        )}
                      >
                        <p className="break-words">{message.content}</p>
                        
                        {/* Read status */}
                        {isOwn && (
                          <div className="absolute -bottom-1 -right-1">
                            {message.isRead ? (
                              <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                            ) : (
                              <Check className="h-3 w-3 text-primary-foreground/70" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reactions */}
                      <ReactionMessage
                        messageId={message.id}
                        reactions={message.reactions}
                        onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
                        onRemoveReaction={() => onRemoveReaction(message.id)}
                        className="mt-1"
                      />

                      {/* Message actions */}
                      <div className={cn(
                        'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                        isOwn ? '-left-12' : '-right-12'
                      )}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onReplyToMessage(message.id)}>
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleForwardMessage(message.id, message.content)}>
                              <Forward className="h-4 w-4 mr-2" />
                              Forward
                            </DropdownMenuItem>
                            {isOwn && (
                              <DropdownMenuItem 
                                onClick={() => onDeleteMessage(message.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Forward Dialog */}
      <ForwardMessageDialog
        open={forwardDialog.open}
        onOpenChange={(open) => setForwardDialog(prev => ({ ...prev, open }))}
        messageContent={forwardDialog.content}
        onForward={handleForwardConfirm}
      />

      {/* Call Dialog */}
      <CallDialog
        open={callDialog.open}
        onOpenChange={(open) => setCallDialog(prev => ({ ...prev, open }))}
        type={callDialog.type}
        contact={{
          name: chat.name,
          avatar: chat.avatar,
          username: chat.name.toLowerCase().replace(' ', '_'),
        }}
        onAccept={() => {
          // Handle call accept
        }}
        onDecline={() => {
          setCallDialog({ open: false, type: 'voice' });
        }}
      />
    </>
  );
};