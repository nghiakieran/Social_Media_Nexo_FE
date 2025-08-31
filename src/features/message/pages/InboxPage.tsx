import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';
import { MessageComposer } from '../components/MessageComposer';

import { InstagramInboxHeader } from '../components/InstagramInboxHeader';
import { InstagramChatHeader } from '../components/InstagramChatHeader';
import { QuickActionsBar } from '../components/QuickActionsBar';
import { Button } from '@/components/ui/button';
import {
  setChats,
  setMessages,
  addMessage,
  setActiveChat,
  addReaction,
  removeReaction,
  Chat,
  Message,
} from '../messageSlice';
import { mockMessages } from '../__mocks__/messages';
import { mockMessageUsers } from '../__mocks__/users';
import { MessageSquarePlus, Phone, Video } from 'lucide-react';

export const InboxPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    chats, 
    messages, 
    activeChat
  } = useAppSelector((state) => state.message);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Initialize mock data
  useEffect(() => {
    const mockChats: Chat[] = mockMessageUsers.map((user, index) => ({
      id: `chat-${index + 1}`,
      participants: ['currentUser', user.id],
      lastMessage: mockMessages[`chat-${index + 1}`]?.slice(-1)[0],
      unreadCount: index === 0 ? 2 : index === 1 ? 1 : 0,
      isOnline: user.isOnline,
      isTyping: false,
      avatar: user.avatar,
      name: user.name,
      lastSeen: user.lastSeen,
    }));

    dispatch(setChats(mockChats));

    // Load messages for each chat
    Object.entries(mockMessages).forEach(([chatId, chatMessages]) => {
      dispatch(setMessages({ chatId, messages: chatMessages }));
    });
  }, [dispatch]);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeFilter) {
      case 'unread':
        return matchesSearch && chat.unreadCount > 0;
      case 'groups':
        return matchesSearch && chat.participants.length > 2; // Mock group filter
      case 'archived':
        return false; // No archived chats in mock data
      default:
        return matchesSearch;
    }
  });

  const currentMessages = activeChat ? messages[activeChat] || [] : [];
  const currentChat = chats.find(chat => chat.id === activeChat);

  const handleChatSelect = (chatId: string) => {
    dispatch(setActiveChat(chatId));
  };

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'file' | 'voice') => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: activeChat,
      senderId: 'currentUser',
      content,
      type,
      timestamp: new Date(),
      isRead: false,
    };

    dispatch(addMessage(newMessage));
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!activeChat) return;
    dispatch(addReaction({ messageId, chatId: activeChat, userId: 'currentUser', emoji }));
  };

  const handleRemoveReaction = (messageId: string) => {
    if (!activeChat) return;
    dispatch(removeReaction({ messageId, chatId: activeChat, userId: 'currentUser' }));
  };

  const handleForwardMessage = (messageId: string, userIds: string[]) => {
    // Implementation for forwarding messages
    console.log('Forward message', messageId, 'to users', userIds);
  };

  const handleDeleteMessage = (messageId: string) => {
    // Implementation for deleting messages
    console.log('Delete message', messageId);
  };

  const handleReplyToMessage = (messageId: string) => {
    // Implementation for replying to messages
    console.log('Reply to message', messageId);
  };

  const handleNewMessage = () => {
    // Implementation for new message
    console.log('New message');
  };

  const handleCallAction = (type: 'voice' | 'video') => {
    // Implementation for call
    console.log('Call:', type);
  };


  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-background shrink-0">
        {/* Header */}
        <InstagramInboxHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewMessage={handleNewMessage}
        />

        {/* Quick Filters */}
        <QuickActionsBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            chats={filteredChats}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            className="p-2"
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat && currentChat ? (
          <>
            <InstagramChatHeader
              chat={currentChat}
              onCall={handleCallAction}
              className="border-b border-border"
            />
            <ChatWindow
              chat={currentChat}
              messages={currentMessages}
              isTyping={false}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              onForwardMessage={handleForwardMessage}
              onDeleteMessage={handleDeleteMessage}
              onReplyToMessage={handleReplyToMessage}
              className="flex-1"
            />
            <MessageComposer
              onSendMessage={handleSendMessage}
              onTyping={() => {}}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-subtle">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full instagram-gradient flex items-center justify-center">
                <MessageSquarePlus className="h-12 w-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Messages</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Send private photos and messages to a friend or group
                </p>
                <Button 
                  onClick={() => handleChatSelect(chats[0]?.id)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};