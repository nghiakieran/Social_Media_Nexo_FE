import React, { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { useWebSocket } from "../hooks/useWebSocket";
import { useBatchPresence } from "../hooks/usePresence";
import { ChatWindow } from "../components/ChatWindow";
import { MessageComposer } from "../components/MessageComposer";
import { InstagramChatHeader } from "../components/InstagramChatHeader";
import { useCallContext } from "../contexts/CallContext";
import { Button } from "@/components/ui/button";
import { playIncomingChatAlertIfNeeded } from "@/utils/inAppAlertSounds";
import {
  setActiveConversation,
  addMessage,
  addMessageWithUnreadUpdate,
  setMessages,
  handleReadAll,
  handleReadReceipt,
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
  ReadReceiptDTO,
  TypingNotificationDTO,
  ECallType,
  ReactionWebSocketPayload,
  ReactionUpdateLegacyDTO,
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
      const sid = message.sender?.id;
      if (sid != null)
        playIncomingChatAlertIfNeeded(message.id, sid, user?.id);
    },
    onTyping: (typing: TypingNotificationDTO) => {
      dispatch(handleTypingNotification(typing));
    },
    onReadReceipt: (receipt: ReadReceiptDTO) => {
      dispatch(handleReadReceipt(receipt));
    },
    onReadAll: (readAllEvent: ReadAllDTO) => {
      dispatch(handleReadAll({ ...readAllEvent, currentUserId: user.id }));
    },
    onReactionUpdate: (update: ReactionWebSocketPayload) => {
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
        const legacy = update as ReactionUpdateLegacyDTO;
        if (legacy.action === "ADD") {
          dispatch(
            addReaction({
              messageId: legacy.messageId,
              conversationId: legacy.conversationId,
              reaction: legacy.reaction,
            })
          );
        } else if (legacy.action === "REMOVE") {
          dispatch(
            removeReaction({
              messageId: legacy.messageId,
              conversationId: legacy.conversationId,
              userId: legacy.reaction.userId,
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
    type: "text" | "image" | "file" | "voice",
    mediaUrls?: string[]
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
        replyingTo ? replyingTo.id : undefined,
        mediaUrls
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

  const { startCall } = useCallContext();

  const otherParticipant = useMemo(
    () => currentChat?.participants.find((p) => p.id !== user?.id),
    [currentChat, user?.id]
  );

  const handleStartCall = useCallback(
    (type: "voice" | "video") => {
      if (!currentChat || !otherParticipant) return;
      const callType =
        type === "video" ? ECallType.VIDEO_CALL : ECallType.AUDIO_CALL;
      startCall(currentChat.id, callType, {
        id: otherParticipant.id,
        name: otherParticipant.fullName,
        avatarUrl: otherParticipant.avatarUrl,
      });
    },
    [currentChat, otherParticipant, startCall]
  );

  if (!currentChat) {
    return (
      <div className="flex h-[100dvh] max-h-[100dvh] items-center justify-center px-4">
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <InstagramChatHeader
        chat={currentChat}
        onBack={handleGoBack}
        onCall={handleStartCall}
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
          className="shrink-0 border-primary/10 bg-background/95 backdrop-blur-sm"
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          replyingTo={replyingTo}
          onCancelReply={() => dispatch(clearReplyingTo())}
        />
      </div>

    </div>
  );
};
