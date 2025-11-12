import React, { useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { useWebSocket } from "../hooks/useWebSocket";
import { useBatchPresence } from "../hooks/usePresence";
import { ChatWindow } from "../components/ChatWindow";
import { MessageComposer } from "../components/MessageComposer";
import { InstagramChatHeader } from "../components/InstagramChatHeader";
import { Button } from "@/components/ui/button";
import {
  setActiveConversation,
  addMessage,
  addMessageWithUnreadUpdate,
  addReaction,
  removeReaction,
  setMessages,
  handleReadAll,
  handleTypingNotification,
  clearOldTypingIndicators,
} from "../messageSlice";
import {
  MessageDTO,
  EMessageType,
  EReactionType,
  ReadAllDTO,
  TypingNotificationDTO,
} from "../types";

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { conversations, messages, activeConversationId, typingUsers } =
    useAppSelector((state) => state.message);
  const { user } = useAppSelector((state) => state.auth);

  const currentChat = conversations.find((conv) => conv.id === Number(chatId));
  const currentMessages = chatId ? messages[chatId] || [] : [];

  const isOtherUserTyping = useMemo(() => {
    if (!chatId || !user) return false;
    const typingInChat = typingUsers[Number(chatId)] || [];
    const isTyping = typingInChat.some((t) => t.userId !== user.id);

    
    return isTyping;
  }, [chatId, typingUsers, user]);

  const otherUserId = useMemo(
    () => currentChat?.participants.find((p) => p.id !== user?.id)?.id,
    [currentChat, user?.id]
  );

  const { presenceMap, lastSeenMap } = useBatchPresence(
    otherUserId ? [otherUserId] : []
  );

  const ws = useWebSocket({
    onMessage: (message: MessageDTO) => {
      if (user?.id) {
        dispatch(
          addMessageWithUnreadUpdate({ message, currentUserId: user.id })
        );
      } else {
        dispatch(addMessage(message));
      }
    },
    onTyping: (typing: TypingNotificationDTO) => {
            dispatch(handleTypingNotification(typing));
    },
    onReadAll: (readAllEvent: ReadAllDTO) => {
            dispatch(handleReadAll({ ...readAllEvent, currentUserId: user.id }));
    },
    autoConnect: true,
  });

  useEffect(() => {
    if (chatId) {
      dispatch(setActiveConversation(Number(chatId)));

      const fetchMessages = async () => {
        try {
          const { messageApi } = await import("../services/messageApi");
          const response = await messageApi.getMessages({
            conversationId: Number(chatId),
          });
          if (response?.data?.content) {
            dispatch(
              setMessages({
                conversationId: Number(chatId),
                messages: response.data.content,
              })
            );
          }
        } catch (error) {
                  }
      };

      fetchMessages();

      ws.subscribeToConversation(Number(chatId));

      ws.markConversationAsRead(Number(chatId));
          }
  }, [chatId, dispatch, ws]);

  const handleSendMessage = (
    content: string,
    type: "text" | "image" | "file" | "voice"
  ) => {
    if (!chatId) return;

    const typeMap: Record<string, EMessageType> = {
      text: EMessageType.TEXT,
      image: EMessageType.IMAGE,
      file: EMessageType.FILE,
      voice: EMessageType.AUDIO,
    };
    const newMessage: MessageDTO = {
      id: Date.now(),
      conversationId: Number(chatId),
      sender: {
        id: 1,
        username: "currentUser",
        avatarUrl: "",
        fullName: "Current User",
      },
      content,
      messageType: typeMap[type] || EMessageType.TEXT,
      createdAt: new Date().toISOString(),
      reactions: [],
    };

    dispatch(addMessage(newMessage));
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!chatId || !user) return;

    try {
      const { messageApi } = await import("../services/messageApi");
      await messageApi.addReaction(Number(messageId), emoji as EReactionType);

      dispatch(
        addReaction({
          messageId: Number(messageId),
          conversationId: Number(chatId),
          reaction: {
            userId: user.id,
            username: user.username,
            reactionType: emoji as EReactionType,
          },
        })
      );
    } catch (error) {
          }
  };

  const handleRemoveReaction = async (messageId: string) => {
    if (!chatId || !user) return;

    try {
      const message = currentMessages.find((m) => m.id === Number(messageId));
      const userReaction = message?.reactions.find((r) => r.userId === user.id);

      if (!userReaction) return;

      const { messageApi } = await import("../services/messageApi");
      await messageApi.removeReaction(
        Number(messageId),
        userReaction.reactionType
      );

      dispatch(
        removeReaction({
          messageId: Number(messageId),
          conversationId: Number(chatId),
          userId: user.id,
        })
      );
    } catch (error) {
          }
  };

  const handleForwardMessage = (messageId: string, userIds: string[]) => {
      };

  const handleDeleteMessage = (messageId: string) => {
      };

  const handleReplyToMessage = (messageId: string) => {
      };

  const handleMarkMessageAsRead = (messageId: number) => {
    if (!chatId) return;

    ws.markMessageAsRead(messageId, Number(chatId));
      };

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      
      if (!chatId) {
                return;
      }

      if (isTyping) {
                ws.sendTyping(Number(chatId));
              }
    },
    [chatId, ws]
  );

  useEffect(() => {
      }, [handleTyping, chatId]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(clearOldTypingIndicators());
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleCallAction = (type: "voice" | "video") => {
      };

  const handleGoBack = () => {
    navigate("/messages");
  };

  if (!currentChat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Không tìm thấy cuộc trò chuyện
          </h2>
          <Button onClick={handleGoBack}>Quay lại tin nhắn</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <InstagramChatHeader
        chat={currentChat}
        onBack={handleGoBack}
        onCall={handleCallAction}
        showBackButton={true}
        isOnline={otherUserId ? presenceMap[otherUserId] || false : false}
        lastSeen={otherUserId ? lastSeenMap[otherUserId] : undefined}
        currentUserId={user?.id}
      />

      {}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow
          chat={currentChat}
          messages={currentMessages}
          isTyping={isOtherUserTyping}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onForwardMessage={handleForwardMessage}
          onDeleteMessage={handleDeleteMessage}
          onReplyToMessage={handleReplyToMessage}
          onMarkAsRead={handleMarkMessageAsRead}
          className="flex-1 min-h-0"
        />

        <MessageComposer
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};
