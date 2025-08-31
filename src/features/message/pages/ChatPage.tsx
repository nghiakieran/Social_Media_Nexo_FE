import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { ChatWindow } from '../components/ChatWindow';
import { MessageComposer } from '../components/MessageComposer';
import { InstagramChatHeader } from '../components/InstagramChatHeader';
import { Button } from '@/components/ui/button';
import {
  setActiveChat,
  addMessage,
  addReaction,
  removeReaction,
  Message,
} from '../messageSlice';

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { chats, messages, activeChat } = useAppSelector((state) => state.message);
  
  const currentChat = chats.find(chat => chat.id === chatId);
  const currentMessages = chatId ? messages[chatId] || [] : [];

  useEffect(() => {
    if (chatId) {
      dispatch(setActiveChat(chatId));
    }
  }, [chatId, dispatch]);

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'file' | 'voice') => {
    if (!chatId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: 'currentUser',
      content,
      type,
      timestamp: new Date(),
      isRead: false,
    };

    dispatch(addMessage(newMessage));
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!chatId) return;
    dispatch(addReaction({ messageId, chatId, userId: 'currentUser', emoji }));
  };

  const handleRemoveReaction = (messageId: string) => {
    if (!chatId) return;
    dispatch(removeReaction({ messageId, chatId, userId: 'currentUser' }));
  };

  const handleForwardMessage = (messageId: string, userIds: string[]) => {
    console.log('Forward message', messageId, 'to users', userIds);
  };

  const handleDeleteMessage = (messageId: string) => {
    console.log('Delete message', messageId);
  };

  const handleReplyToMessage = (messageId: string) => {
    console.log('Reply to message', messageId);
  };

  const handleCallAction = (type: 'voice' | 'video') => {
    console.log('Call:', type);
  };

  const handleGoBack = () => {
    navigate('/messages');
  };

  if (!currentChat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chat not found</h2>
          <Button onClick={handleGoBack}>
            Go back to messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <InstagramChatHeader
        chat={currentChat}
        onBack={handleGoBack}
        onCall={handleCallAction}
        showBackButton={true}
        className="md:hidden"
      />

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow
          chat={currentChat}
          messages={currentMessages}
          isTyping={false}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onForwardMessage={handleForwardMessage}
          onDeleteMessage={handleDeleteMessage}
          onReplyToMessage={handleReplyToMessage}
          className="flex-1 min-h-0"
        />
        
        <MessageComposer
          onSendMessage={handleSendMessage}
          onTyping={() => {}}
        />
      </div>
    </div>
  );
};