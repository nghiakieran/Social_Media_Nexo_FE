import React, { useEffect, useMemo, useCallback, useRef } from "react";
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
  setMessages,
  handleReadAll,
  handleTypingNotification,
  clearOldTypingIndicators,
  updateMessagesPagination,
  setReplyingTo,
  clearReplyingTo,
  updateMessageReactionsFromAggregated,
  addReaction,
  removeReaction,
} from "../messageSlice";
import {
  MessageDTO,
  EMessageType,
  EReactionType,
  ReadAllDTO,
  TypingNotificationDTO,
  ReactionUpdateDTO,
} from "../types";

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    conversations,
    messages: allMessages,
    typingUsers,
    replyingTo,
  } = useAppSelector((state) => state.message);
  const { user } = useAppSelector((state) => state.auth);

  const currentChat = conversations.find((conv) => conv.id === Number(chatId));
  const currentMessages = chatId ? allMessages[Number(chatId)] || [] : [];

  const [currentPage, setCurrentPage] = React.useState(0);
  const [hasMoreMessages, setHasMoreMessages] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const isLoadingRef = useRef(false);

  const isOtherUserTyping = useMemo(() => {
    if (!chatId || !user) return false;
    const typingInChat = typingUsers[Number(chatId)] || [];
    return typingInChat.some((t) => t.userId !== user.id);
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
    onReactionUpdate: (update: ReactionUpdateDTO) => {
      // Check if it's the new aggregated format (has reactions array)
      if ("reactions" in update && Array.isArray(update.reactions)) {
        // New format: aggregated reactions from backend
        // Find conversationId from messages if not in update
        let conversationId = chatId ? Number(chatId) : null;
        if (!conversationId) {
          // Try to find from messages
          const foundConvId = Object.keys(allMessages).find((convId) =>
            allMessages[Number(convId)]?.some(
              (msg) => msg.id === update.messageId
            )
          );
          if (foundConvId) {
            conversationId = Number(foundConvId);
          }
        }

        if (conversationId) {
          dispatch(
            updateMessageReactionsFromAggregated({
              conversationId,
              messageId: update.messageId,
              aggregatedReactions: update.reactions,
            })
          );
        }
      } else if ("action" in update && "reaction" in update) {
        if (update.action === "ADD") {
          dispatch(
            addReaction({
              messageId: update.messageId,
              conversationId: update.conversationId,
              reaction: update.reaction,
            })
          );
        } else if (update.action === "REMOVE") {
          dispatch(
            removeReaction({
              messageId: update.messageId,
              conversationId: update.conversationId,
              userId: update.reaction.userId,
            })
          );
        }
      }
    },
    autoConnect: true,
  });

  useEffect(() => {
    if (chatId) {
      dispatch(setActiveConversation(Number(chatId)));

      setCurrentPage(0);
      setHasMoreMessages(true);
      setIsLoadingMore(false);
      isLoadingRef.current = false;

      const fetchInitialMessages = async () => {
        try {
          setIsLoadingMore(true);
          isLoadingRef.current = true;

          const { messageApi } = await import("../services/messageApi");
          const response = await messageApi.getMessages({
            conversationId: Number(chatId),
            page: 0,
            size: 20,
          });

          if (response?.data?.content) {
            dispatch(
              setMessages({
                conversationId: Number(chatId),
                messages: response.data.content,
              })
            );

            dispatch(
              updateMessagesPagination({
                conversationId: Number(chatId),
                pagination: {
                  page: 0,
                  size: 20,
                  totalPages: response.data.totalPages,
                  totalElements: response.data.totalElements,
                  hasMore: !response.data.last,
                },
              })
            );

            setHasMoreMessages(!response.data.last);
          }
        } catch (error) {
          // Error handled silently
        } finally {
          setIsLoadingMore(false);
          isLoadingRef.current = false;
        }
      };

      fetchInitialMessages();
      ws.subscribeToConversation(Number(chatId));
      ws.markConversationAsRead(Number(chatId));
    }
  }, [chatId, dispatch, ws]);

  const handleLoadMoreMessages = async () => {
    if (!chatId || !hasMoreMessages || isLoadingRef.current) return;

    try {
      setIsLoadingMore(true);
      isLoadingRef.current = true;

      const { messageApi } = await import("../services/messageApi");
      const nextPage = currentPage + 1;

      const response = await messageApi.getMessages({
        conversationId: Number(chatId),
        page: nextPage,
        size: 20,
      });

      if (response?.data?.content && response.data.content.length > 0) {
        const newOlderMessages = response.data.content;

        const updatedMessages = [...newOlderMessages, ...currentMessages];

        dispatch(
          setMessages({
            conversationId: Number(chatId),
            messages: updatedMessages,
          })
        );

        setCurrentPage(nextPage);
        setHasMoreMessages(!response.data.last);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

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

    try {
      ws.sendMessage(
        Number(chatId),
        content,
        typeMap[type] || EMessageType.TEXT,
        replyingTo ? replyingTo.id : undefined
      );
      dispatch(clearReplyingTo());
    } catch (error) {
      // Error handled silently
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!chatId || !user) return;
    try {
      // Optimistic update: add reaction immediately
      const message = currentMessages.find((m) => m.id === Number(messageId));
      if (message) {
        const existingReaction = message.reactions.find(
          (r) => r.userId === user.id
        );

        if (existingReaction && existingReaction.reactionType === emoji) {
          return;
        }

        if (existingReaction && existingReaction.reactionType !== emoji) {
          // Remove old reaction first
          dispatch(
            removeReaction({
              messageId: Number(messageId),
              conversationId: Number(chatId),
              userId: user.id,
            })
          );
          // Send remove via WebSocket
          ws.sendRemoveReaction(
            Number(messageId),
            existingReaction.reactionType
          );
        }

        // Always add the new reaction (if different from existing)
        dispatch(
          addReaction({
            messageId: Number(messageId),
            conversationId: Number(chatId),
            reaction: {
              userId: user.id,
              username: user.username || user.fullName || `user_${user.id}`,
              reactionType: emoji as EReactionType,
            },
          })
        );
        ws.sendReaction(Number(messageId), emoji as EReactionType);
      }
      // WebSocket handler will update state with correct aggregated data when it arrives
    } catch (error) {
      // Error handled silently
    }
  };

  const handleRemoveReaction = async (
    messageId: string,
    reactionType: string
  ) => {
    if (!chatId || !user) return;
    try {
      const message = currentMessages.find((m) => m.id === Number(messageId));
      const userReaction = message?.reactions.find(
        (r) => r.userId === user.id && r.reactionType === reactionType
      );
      if (!userReaction) return;

      // Optimistic update: remove reaction immediately
      dispatch(
        removeReaction({
          messageId: Number(messageId),
          conversationId: Number(chatId),
          userId: user.id,
        })
      );

      // Send remove reaction via WebSocket - backend will broadcast update to all clients
      ws.sendRemoveReaction(Number(messageId), userReaction.reactionType);
      // WebSocket handler will update state with correct aggregated data when it arrives
    } catch (error) {
      // Error handled silently
    }
  };

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (chatId && isTyping) {
        ws.sendTyping(Number(chatId));
      }
    },
    [chatId, ws]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(clearOldTypingIndicators());
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleReplyToMessage = useCallback(
    (message: MessageDTO) => {
      if (!message || typeof message !== "object" || !("id" in message)) {
        return;
      }

      dispatch(setReplyingTo(message));
    },
    [dispatch]
  );

  const handleGoBack = () => navigate("/messages");

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
        showBackButton={true}
        isOnline={otherUserId ? presenceMap[otherUserId] || false : false}
        lastSeen={otherUserId ? lastSeenMap[otherUserId] : undefined}
        currentUserId={user?.id}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow
          chat={currentChat}
          messages={currentMessages}
          isTyping={isOtherUserTyping}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onForwardMessage={() => {}}
          onDeleteMessage={() => {}}
          onReplyToMessage={handleReplyToMessage}
          onMarkAsRead={(msgId) =>
            chatId && ws.markMessageAsRead(msgId, Number(chatId))
          }
          onLoadMoreMessages={handleLoadMoreMessages}
          hasMoreMessages={hasMoreMessages}
          isLoadingMore={isLoadingMore}
          className="flex-1 min-h-0"
        />

        <MessageComposer
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          replyingTo={replyingTo}
          onCancelReply={() => dispatch(clearReplyingTo())}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
};
