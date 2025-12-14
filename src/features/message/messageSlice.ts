import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { conversationApi, messageApi } from "./services/messageApi";
import { presenceApi } from "./services/presenceApi";
import { EConversationStatus } from "./types";
import type {
  ConversationResponseDTO,
  MessageDTO,
  ConversationUI,
  MessageUI,
  EReactionType,
  TypingNotificationDTO,
  ReadReceiptDTO,
  ReadAllDTO,
  ReactionDTO,
  AggregatedReactionDTO,
} from "./types";

export interface MessageState {
  conversations: ConversationUI[];
  messages: { [conversationId: number]: MessageUI[] };
  activeConversationId: number | null;
  typingUsers: { [conversationId: number]: TypingNotificationDTO[] };
  onlineUserIds: number[];
  floatingConversations: number[];
  minimizedConversations: number[];
  loading: boolean;
  error: string | null;
  replyingTo: MessageDTO | null;
  conversationsPagination: {
    page: number;
    size: number;
    totalPages: number;
    hasMore: boolean;
  };
  messagesPagination: {
    [conversationId: number]: {
      page: number;
      size: number;
      totalPages: number;
      totalElements: number;
      hasMore: boolean;
    };
  };
}

const initialState: MessageState = {
  conversations: [],
  messages: {},
  activeConversationId: null,
  typingUsers: {},
  onlineUserIds: [],
  floatingConversations: [],
  minimizedConversations: [],
  loading: false,
  error: null,
  replyingTo: null,
  conversationsPagination: {
    page: 0,
    size: 20,
    totalPages: 0,
    hasMore: true,
  },
  messagesPagination: {},
};

export const fetchConversations = createAsyncThunk(
  "message/fetchConversations",
  async (params: { search?: string; page?: number; size?: number } = {}) => {
    const response = await conversationApi.getConversations(params);
    return response.data;
  }
);

export const fetchConversationRequests = createAsyncThunk(
  "message/fetchConversationRequests",
  async (params: { search?: string; page?: number; size?: number } = {}) => {
    const response = await conversationApi.getConversationRequests(params);
    return response.data;
  }
);

export const fetchOrCreateConversation = createAsyncThunk(
  "message/fetchOrCreateConversation",
  async (recipientUserId: number) => {
    const response = await conversationApi.getOrCreateConversation(
      recipientUserId
    );
    return response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async (params: {
    conversationId: number;
    page?: number;
    size?: number;
    search?: string;
  }) => {
    const response = await messageApi.getMessages(params);
    return { conversationId: params.conversationId, data: response.data };
  }
);

export const addMessageReaction = createAsyncThunk(
  "message/addReaction",
  async ({
    messageId,
    reactionType,
    conversationId,
  }: {
    messageId: number;
    reactionType: EReactionType;
    conversationId: number;
  }) => {
    await messageApi.addReaction(messageId, reactionType);
    return { messageId, reactionType, conversationId };
  }
);

export const removeMessageReaction = createAsyncThunk(
  "message/removeReaction",
  async ({
    messageId,
    reactionType,
    conversationId,
  }: {
    messageId: number;
    reactionType: EReactionType;
    conversationId: number;
  }) => {
    await messageApi.removeReaction(messageId, reactionType);
    return { messageId, reactionType, conversationId };
  }
);

export const fetchOnlineFriends = createAsyncThunk(
  "message/fetchOnlineFriends",
  async () => {
    const response = await presenceApi.getOnlineFriends();
    return response.data;
  }
);

export const fetchBatchOnlineStatus = createAsyncThunk(
  "message/fetchBatchOnlineStatus",
  async (userIds: number[]) => {
    const response = await presenceApi.getBatchOnlineStatus(userIds);
    return response.data;
  }
);

export const toggleArchive = createAsyncThunk(
  "message/toggleArchive",
  async (conversationId: number) => {
    await conversationApi.toggleArchiveConversation(conversationId);
    return conversationId;
  }
);

export const toggleMute = createAsyncThunk(
  "message/toggleMute",
  async (conversationId: number) => {
    await conversationApi.toggleMuteConversation(conversationId);
    return conversationId;
  }
);

export const acceptRequest = createAsyncThunk(
  "message/acceptRequest",
  async (conversationId: number) => {
    await conversationApi.acceptConversationRequest(conversationId);
    return conversationId;
  }
);

export const declineRequest = createAsyncThunk(
  "message/declineRequest",
  async (conversationId: number) => {
    await conversationApi.declineConversationRequest(conversationId);
    return conversationId;
  }
);

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setConversations: (
      state,
      action: PayloadAction<ConversationResponseDTO[]>
    ) => {
      state.conversations = action.payload.map((conv) => ({
        ...conv,
        isTyping: false,
        isOnline: state.onlineUserIds.includes(conv.participants[0]?.id),
        lastSeen: undefined,
      }));
    },

    upsertConversation: (
      state,
      action: PayloadAction<ConversationResponseDTO>
    ) => {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.id
      );
      const conversation: ConversationUI = {
        ...action.payload,
        isTyping: false,
        isOnline: state.onlineUserIds.includes(
          action.payload.participants[0]?.id
        ),
        lastSeen: undefined,
      };

      if (index >= 0) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...conversation,
        };
      } else {
        state.conversations.unshift(conversation);
      }
    },

    setMessages: (
      state,
      action: PayloadAction<{ conversationId: number; messages: MessageDTO[] }>
    ) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages.map((msg) => ({
        ...msg,
        isRead: false,
        isSending: false,
      }));
    },

    addMessage: (state, action: PayloadAction<MessageDTO>) => {
      const { conversationId } = action.payload;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      const message: MessageUI = {
        ...action.payload,
        isRead: false,
        isSending: false,
      };

      state.messages[conversationId].push(message);

      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.lastMessage = action.payload;
        conv.lastMessageAt = action.payload.createdAt;
      }
    },

    addMessageWithUnreadUpdate: (
      state,
      action: PayloadAction<{ message: MessageDTO; currentUserId: number }>
    ) => {
      const { message, currentUserId } = action.payload;
      const { conversationId } = message;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      const messageUI: MessageUI = {
        ...message,
        isRead: false,
        isSending: false,
      };

      state.messages[conversationId].push(messageUI);

      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.lastMessage = message;
        conv.lastMessageAt = message.createdAt;

        if (
          message.sender.id !== currentUserId &&
          state.activeConversationId !== conversationId
        ) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }
    },

    addOptimisticMessage: (state, action: PayloadAction<MessageUI>) => {
      const { conversationId } = action.payload;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      state.messages[conversationId].push(action.payload);
    },

    updateMessageStatus: (
      state,
      action: PayloadAction<{
        conversationId: number;
        tempId: number;
        message: MessageDTO;
      }>
    ) => {
      const { conversationId, tempId, message } = action.payload;
      const messages = state.messages[conversationId];

      if (messages) {
        const index = messages.findIndex((m) => m.id === tempId);
        if (index >= 0) {
          messages[index] = { ...message, isRead: false, isSending: false };
        }
      }
    },

    setActiveConversation: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
      state.replyingTo = null;
      if (action.payload) {
        const conv = state.conversations.find((c) => c.id === action.payload);
        if (conv) {
          conv.unreadCount = 0;
        }
      }
    },

    setReplyingTo: (state, action: PayloadAction<MessageDTO | null>) => {
      state.replyingTo = action.payload;
    },

    clearReplyingTo: (state) => {
      state.replyingTo = null;
    },

    handleTypingNotification: (
      state,
      action: PayloadAction<TypingNotificationDTO>
    ) => {
      const { conversationId, userId, timestamp } = action.payload;

      if (!userId) {
        return;
      }

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      state.typingUsers[conversationId] = state.typingUsers[
        conversationId
      ].filter((t) => t.userId !== userId);

      if (timestamp) {
        const now = new Date().getTime();
        const typingTime = new Date(timestamp).getTime();
        const diff = now - typingTime;

        if (diff < 5000) {
          state.typingUsers[conversationId].push(action.payload);
        }
      } else {
        state.typingUsers[conversationId].push(action.payload);
      }

      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.isTyping = state.typingUsers[conversationId].length > 0;
      }
    },

    clearOldTypingIndicators: (state) => {
      const now = new Date().getTime();
      const maxAge = 3000;

      Object.keys(state.typingUsers).forEach((convIdStr) => {
        const convId = Number(convIdStr);
        state.typingUsers[convId] = state.typingUsers[convId].filter((t) => {
          if (!t.timestamp) return true; // Keep if no timestamp
          const typingTime = new Date(t.timestamp).getTime();
          const age = now - typingTime;
          return age < maxAge;
        });

        const conv = state.conversations.find((c) => c.id === convId);
        if (conv) {
          conv.isTyping = state.typingUsers[convId].length > 0;
        }
      });
    },

    clearTypingNotification: (
      state,
      action: PayloadAction<{ conversationId: number; userId: number }>
    ) => {
      const { conversationId, userId } = action.payload;

      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[
          conversationId
        ].filter((t) => t.userId !== userId);

        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.isTyping = state.typingUsers[conversationId].length > 0;
        }
      }
    },

    handleReadReceipt: (state, action: PayloadAction<ReadReceiptDTO>) => {
      const { messageId } = action.payload;
      Object.values(state.messages).forEach((messages) => {
        const msg = messages.find((m) => m.id === messageId);
        if (msg) {
          msg.isRead = true;
        }
      });
    },

    handleReadAll: (
      state,
      action: PayloadAction<ReadAllDTO & { currentUserId?: number }>
    ) => {
      const { conversationId, userId, lastReadMessageId, currentUserId } =
        action.payload;

      const isOwnReadEvent = currentUserId && userId === currentUserId;

      if (!isOwnReadEvent) {
        const conversation = state.conversations.find(
          (c) => c.id === conversationId
        );
        if (conversation) {
          conversation.lastReadMessageId = lastReadMessageId;
        }
      }

      const messages = state.messages[conversationId];
      if (messages) {
        messages.forEach((msg) => {
          if (msg.id <= lastReadMessageId && msg.sender.id !== userId) {
            msg.isRead = true;
          }
        });
      }
    },

    setOnlineUsers: (state, action: PayloadAction<number[]>) => {
      state.onlineUserIds = action.payload;

      state.conversations.forEach((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => !state.onlineUserIds.includes(p.id)
        );
        conv.isOnline = otherParticipant
          ? state.onlineUserIds.includes(otherParticipant.id)
          : false;
      });
    },

    updateOnlineStatus: (
      state,
      action: PayloadAction<Record<number, boolean>>
    ) => {
      const statusMap = action.payload;

      state.conversations.forEach((conv) => {
        const otherParticipant = conv.participants[0]; // Assuming direct conversations
        if (otherParticipant && statusMap[otherParticipant.id] !== undefined) {
          conv.isOnline = statusMap[otherParticipant.id];
        }
      });
    },

    addReaction: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        reaction: ReactionDTO;
      }>
    ) => {
      const { conversationId, messageId, reaction } = action.payload;
      const message = state.messages[conversationId]?.find(
        (m) => m.id === messageId
      );

      if (message) {
        // Initialize reactions array if it doesn't exist
        if (!message.reactions) {
          message.reactions = [];
        }
        // Remove existing reaction from this user if any
        message.reactions = message.reactions.filter(
          (r) => r.userId !== reaction.userId
        );
        // Add new reaction
        message.reactions.push(reaction);
      }
    },

    removeReaction: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        userId: number;
      }>
    ) => {
      const { conversationId, messageId, userId } = action.payload;
      const message = state.messages[conversationId]?.find(
        (m) => m.id === messageId
      );

      if (message) {
        // Initialize reactions array if it doesn't exist
        if (!message.reactions) {
          message.reactions = [];
        }
        // Remove reaction from this user
        message.reactions = message.reactions.filter(
          (r) => r.userId !== userId
        );
      }
    },

    updateMessageReactions: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        reactions: ReactionDTO[];
      }>
    ) => {
      const { conversationId, messageId, reactions } = action.payload;
      const message = state.messages[conversationId]?.find(
        (m) => m.id === messageId
      );

      if (message) {
        message.reactions = reactions;
      }
    },

    // Update reactions from aggregated format (real-time from backend)
    updateMessageReactionsFromAggregated: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        aggregatedReactions: AggregatedReactionDTO[];
      }>
    ) => {
      const { conversationId, messageId, aggregatedReactions } = action.payload;
      const message = state.messages[conversationId]?.find(
        (m) => m.id === messageId
      );

      if (message) {
        // Convert aggregated reactions to ReactionDTO format
        // Preserve existing reaction details (username, etc.) when possible
        const newReactions: ReactionDTO[] = [];
        
        aggregatedReactions.forEach((agg) => {
          // For each reaction type, create entries for each userId
          agg.userIds.forEach((userId) => {
            // Try to find existing reaction to preserve username and other details
            const existing = message.reactions.find(
              (r) => r.userId === userId && r.reactionType === agg.reactionType
            );
            
            if (existing) {
              // Preserve existing reaction with all its details
              newReactions.push(existing);
            } else {
              // New reaction - try to get user info from conversation participants
              const conversation = state.conversations.find(
                (c) => c.id === conversationId
              );
              const participant = conversation?.participants.find(
                (p) => p.id === userId
              );
              
              // Create new reaction entry
              newReactions.push({
                userId,
                username: participant?.username || `user_${userId}`, // Use participant info if available
                reactionType: agg.reactionType,
              });
            }
          });
        });

        // Update message reactions
        message.reactions = newReactions;
      }
    },

    openFloatingConversation: (state, action: PayloadAction<number>) => {
      const convId = action.payload;
      if (!state.floatingConversations.includes(convId)) {
        state.floatingConversations.push(convId);
      }
      state.minimizedConversations = state.minimizedConversations.filter(
        (id) => id !== convId
      );
    },

    closeFloatingConversation: (state, action: PayloadAction<number>) => {
      state.floatingConversations = state.floatingConversations.filter(
        (id) => id !== action.payload
      );
      state.minimizedConversations = state.minimizedConversations.filter(
        (id) => id !== action.payload
      );
    },

    minimizeFloatingConversation: (state, action: PayloadAction<number>) => {
      const convId = action.payload;
      if (!state.minimizedConversations.includes(convId)) {
        state.minimizedConversations.push(convId);
      }
    },

    restoreFloatingConversation: (state, action: PayloadAction<number>) => {
      state.minimizedConversations = state.minimizedConversations.filter(
        (id) => id !== action.payload
      );
    },

    clearError: (state) => {
      state.error = null;
    },

    updateMessagesPagination: (
      state,
      action: PayloadAction<{
        conversationId: number;
        pagination: {
          page?: number;
          size?: number;
          totalPages?: number;
          totalElements?: number;
          hasMore?: boolean;
        };
      }>
    ) => {
      const { conversationId, pagination } = action.payload;
      if (!state.messagesPagination[conversationId]) {
        state.messagesPagination[conversationId] = {
          page: 0,
          size: 20,
          totalPages: 0,
          totalElements: 0,
          hasMore: true,
        };
      }
      Object.assign(state.messagesPagination[conversationId], pagination);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        const { content, totalPages, number, last } = action.payload;

        if (number === 0) {
          state.conversations = content.map((conv) => ({
            ...conv,
            isTyping: false,
            isOnline: false,
          }));
        } else {
          content.forEach((conv) => {
            if (!state.conversations.find((c) => c.id === conv.id)) {
              state.conversations.push({
                ...conv,
                isTyping: false,
                isOnline: false,
              });
            }
          });
        }

        state.conversationsPagination = {
          page: number,
          size: content.length,
          totalPages,
          hasMore: !last,
        };
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch conversations";
      });

    builder.addCase(fetchOrCreateConversation.fulfilled, (state, action) => {
      const conv = action.payload;
      const existingIndex = state.conversations.findIndex(
        (c) => c.id === conv.id
      );

      const conversation: ConversationUI = {
        ...conv,
        isTyping: false,
        isOnline: false,
      };

      if (existingIndex >= 0) {
        state.conversations[existingIndex] = conversation;
      } else {
        state.conversations.unshift(conversation);
      }
    });

    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, data } = action.payload;
        const { content, totalPages, number, last } = data;

        console.log(
          "Fetched messages for page:",
          number,
          "totalElements:",
          data.totalElements,
          "content length:",
          content.length
        );

        const requestedPage = action.meta.arg.page || 0;

        if (requestedPage === 1) {
          state.messages[conversationId] = content.map((msg) => ({
            ...msg,
            isRead: false,
            isSending: false,
          }));
        } else {
          const existing = state.messages[conversationId] || [];
          state.messages[conversationId] = [
            ...content.map((msg) => ({
              ...msg,
              isRead: false,
              isSending: false,
            })),
            ...existing,
          ];
        }

        state.messagesPagination[conversationId] = {
          page: requestedPage,
          size: content.length,
          totalPages,
          totalElements: data.totalElements || 0,
          hasMore: !last,
        };

        // Remove duplicate messages by id
        state.messages[conversationId] = state.messages[conversationId].filter(
          (msg, index, arr) => arr.findIndex((m) => m.id === msg.id) === index
        );

        console.log(
          "Messages after fetch:",
          state.messages[conversationId].length
        );
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch messages";
      });

    builder.addCase(fetchOnlineFriends.fulfilled, (state, action) => {
      state.onlineUserIds = action.payload;
    });

    builder.addCase(fetchBatchOnlineStatus.fulfilled, (state, action) => {
      const statusMap = action.payload;
      state.conversations.forEach((conv) => {
        const otherParticipant = conv.participants[0];
        if (otherParticipant && statusMap[otherParticipant.id] !== undefined) {
          conv.isOnline = statusMap[otherParticipant.id];
        }
      });
    });

    builder.addCase(toggleArchive.fulfilled, (state, action) => {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        conv.isArchived = !conv.isArchived;
      }
    });

    builder.addCase(toggleMute.fulfilled, (state, action) => {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        conv.isMuted = !conv.isMuted;
      }
    });

    builder.addCase(acceptRequest.fulfilled, (state, action) => {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        conv.status = EConversationStatus.NORMAL;
      }
    });

    builder.addCase(declineRequest.fulfilled, (state, action) => {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        conv.status = EConversationStatus.DECLINED;
      }
    });
  },
});

export const {
  setConversations,
  upsertConversation,
  setMessages,
  addMessage,
  addMessageWithUnreadUpdate,
  addOptimisticMessage,
  updateMessageStatus,
  setActiveConversation,
  handleTypingNotification,
  clearTypingNotification,
  clearOldTypingIndicators,
  handleReadReceipt,
  handleReadAll,
  setOnlineUsers,
  updateOnlineStatus,
  addReaction,
  removeReaction,
  updateMessageReactions,
  updateMessageReactionsFromAggregated,
  openFloatingConversation,
  closeFloatingConversation,
  minimizeFloatingConversation,
  restoreFloatingConversation,
  clearError,
  updateMessagesPagination,
  setReplyingTo,
  clearReplyingTo,
} = messageSlice.actions;

export default messageSlice.reducer;
