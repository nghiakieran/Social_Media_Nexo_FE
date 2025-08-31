import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  timestamp: Date;
  isRead: boolean;
  reactions?: { [userId: string]: string };
  replyToId?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  avatar: string;
  name: string;
  lastSeen?: Date;
}

export interface MessageState {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  activeChat: string | null;
  typingUsers: { [chatId: string]: string[] };
  onlineUsers: string[];
  floatingChats: string[];
  minimizedChats: string[];
}

const initialState: MessageState = {
  chats: [],
  messages: {},
  activeChat: null,
  typingUsers: {},
  onlineUsers: [],
  floatingChats: [],
  minimizedChats: [],
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: Message[] }>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { chatId } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(action.payload);
      
      // Update last message in chat
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.lastMessage = action.payload;
        if (action.payload.senderId !== 'currentUser') {
          chat.unreadCount++;
        }
      }
    },
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChat = action.payload;
      
      // Mark messages as read
      if (action.payload) {
        const chat = state.chats.find(c => c.id === action.payload);
        if (chat) {
          chat.unreadCount = 0;
        }
      }
    },
    setTypingUser: (state, action: PayloadAction<{ chatId: string; userId: string; isTyping: boolean }>) => {
      const { chatId, userId, isTyping } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }
      
      if (isTyping && !state.typingUsers[chatId].includes(userId)) {
        state.typingUsers[chatId].push(userId);
      } else if (!isTyping) {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter(id => id !== userId);
      }
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
      
      // Update online status in chats
      state.chats.forEach(chat => {
        const otherParticipant = chat.participants.find(p => p !== 'currentUser');
        chat.isOnline = otherParticipant ? state.onlineUsers.includes(otherParticipant) : false;
      });
    },
    addReaction: (state, action: PayloadAction<{ messageId: string; chatId: string; userId: string; emoji: string }>) => {
      const { messageId, chatId, userId, emoji } = action.payload;
      const message = state.messages[chatId]?.find(m => m.id === messageId);
      if (message) {
        if (!message.reactions) {
          message.reactions = {};
        }
        message.reactions[userId] = emoji;
      }
    },
    removeReaction: (state, action: PayloadAction<{ messageId: string; chatId: string; userId: string }>) => {
      const { messageId, chatId, userId } = action.payload;
      const message = state.messages[chatId]?.find(m => m.id === messageId);
      if (message?.reactions) {
        delete message.reactions[userId];
      }
    },
    openFloatingChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      if (!state.floatingChats.includes(chatId)) {
        state.floatingChats.push(chatId);
      }
      state.minimizedChats = state.minimizedChats.filter(id => id !== chatId);
    },
    closeFloatingChat: (state, action: PayloadAction<string>) => {
      state.floatingChats = state.floatingChats.filter(id => id !== action.payload);
      state.minimizedChats = state.minimizedChats.filter(id => id !== action.payload);
    },
    minimizeFloatingChat: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      if (!state.minimizedChats.includes(chatId)) {
        state.minimizedChats.push(chatId);
      }
    },
    restoreFloatingChat: (state, action: PayloadAction<string>) => {
      state.minimizedChats = state.minimizedChats.filter(id => id !== action.payload);
    },
  },
});

export const {
  setChats,
  setMessages,
  addMessage,
  setActiveChat,
  setTypingUser,
  setOnlineUsers,
  addReaction,
  removeReaction,
  openFloatingChat,
  closeFloatingChat,
  minimizeFloatingChat,
  restoreFloatingChat,
} = messageSlice.actions;

export default messageSlice.reducer;