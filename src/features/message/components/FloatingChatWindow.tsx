import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Minus, Phone, Video, ArrowLeft } from "lucide-react";
import { OnlineIndicator } from "./OnlineIndicator";
import { MessageComposer } from "./MessageComposer";
import { ChatWindow } from "./ChatWindow";
import { cn } from "@/lib/utils";
import type { ConversationUI, MessageDTO } from "../types";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  addMessage,
  addMessageWithUnreadUpdate,
  handleTypingNotification,
  updateMessageReactionsFromAggregated,
  addReaction,
  removeReaction,
} from "../messageSlice";
import {
  EMessageType,
  EReactionType,
  ReactionUpdateDTO,
  TypingNotificationDTO,
  ReactionUpdateLegacyDTO,
} from "../types";

interface FloatingChatWindowProps {
  chat: ConversationUI;
  messages: MessageDTO[];
  isMinimized: boolean;
  position: number;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  onBack?: () => void;
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
  onBack,
  className,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { typingUsers } = useAppSelector((state) => state.message);

  // WebSocket connection for this floating chat
  const ws = useWebSocket({
    onMessage: (message: MessageDTO) => {
      if (message.conversationId === chat.id) {
        if (user?.id) {
          dispatch(
            addMessageWithUnreadUpdate({ message, currentUserId: user.id })
          );
        } else {
          dispatch(addMessage(message));
        }
      }
    },
    onTyping: (typing: TypingNotificationDTO) => {
      if (typing.conversationId === chat.id) {
        dispatch(handleTypingNotification(typing));
      }
    },
    onReactionUpdate: (update: ReactionUpdateDTO) => {
      if ("reactions" in update && Array.isArray(update.reactions)) {
        dispatch(
          updateMessageReactionsFromAggregated({
            conversationId: chat.id,
            messageId: update.messageId,
            aggregatedReactions: update.reactions,
          })
        );
      } else if (
        "action" in update &&
        "reaction" in update &&
        "conversationId" in update
      ) {
        const legacyUpdate = update as ReactionUpdateLegacyDTO;
        if (legacyUpdate.action === "ADD") {
          dispatch(
            addReaction({
              messageId: legacyUpdate.messageId,
              conversationId: legacyUpdate.conversationId,
              reaction: legacyUpdate.reaction,
            })
          );
        } else if (legacyUpdate.action === "REMOVE") {
          dispatch(
            removeReaction({
              messageId: legacyUpdate.messageId,
              conversationId: legacyUpdate.conversationId,
              userId: legacyUpdate.reaction.userId,
            })
          );
        }
      }
    },
    autoConnect: true,
  });

  // Subscribe to conversation when component mounts or WebSocket connects
  useEffect(() => {
    if (chat.id && ws.isConnected) {
      ws.subscribeToConversation(chat.id);
    }
  }, [chat.id, ws.isConnected, ws]);

  // Scroll to bottom when messages are first loaded for this floating chat
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        const scrollArea = document.querySelector(
          `[data-chat-id="${chat.id}"] [data-scroll-area]`
        ) as HTMLElement;
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }
      }, 150);
    }
  }, [messages.length, chat.id]);

  const isOtherUserTyping = useMemo(() => {
    if (!user) return false;
    const typingInChat = typingUsers[chat.id] || [];
    return typingInChat.some((t) => t.userId !== user.id);
  }, [chat.id, typingUsers, user]);

  const handleSendMessage = (
    content: string,
    type: "text" | "image" | "file" | "voice"
  ) => {
    const typeMap: Record<string, EMessageType> = {
      text: EMessageType.TEXT,
      image: EMessageType.IMAGE,
      file: EMessageType.FILE,
      voice: EMessageType.AUDIO,
    };

    try {
      ws.sendMessage(chat.id, content, typeMap[type] || EMessageType.TEXT);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    try {
      // Optimistic update: add reaction immediately
      const message = messages.find((m) => m.id === Number(messageId));
      if (message) {
        const existingReaction = message.reactions.find(
          (r) => r.userId === user.id
        );

        // If user already has this exact reaction, do nothing (will be handled by remove)
        if (existingReaction && existingReaction.reactionType === emoji) {
          return;
        }

        // If user has a different reaction, remove it first
        if (existingReaction && existingReaction.reactionType !== emoji) {
          // Remove old reaction first
          dispatch(
            removeReaction({
              messageId: Number(messageId),
              conversationId: chat.id,
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
            conversationId: chat.id,
            reaction: {
              userId: user.id,
              username: user.username || user.fullName || `user_${user.id}`,
              reactionType: emoji as EReactionType,
            },
          })
        );
        // Send new reaction via WebSocket
        ws.sendReaction(Number(messageId), emoji as EReactionType);
      }
      // WebSocket handler will update state with correct aggregated data when it arrives
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleRemoveReaction = async (
    messageId: string,
    reactionType: string
  ) => {
    if (!user) return;
    try {
      const message = messages.find((m) => m.id === Number(messageId));
      const userReaction = message?.reactions.find(
        (r) => r.userId === user.id && r.reactionType === reactionType
      );
      if (!userReaction) return;

      // Optimistic update: remove reaction immediately
      dispatch(
        removeReaction({
          messageId: Number(messageId),
          conversationId: chat.id,
          userId: user.id,
        })
      );

      // Send remove reaction via WebSocket - backend will broadcast update to all clients
      ws.sendRemoveReaction(Number(messageId), userReaction.reactionType);
      // WebSocket handler will update state with correct aggregated data when it arrives
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (isTyping) {
      ws.sendTyping(chat.id);
    }
  };

  const rightOffset = 20 + position * 360; // 340px width + 20px margin

  if (isMinimized) {
    return (
      <div
        className={cn(
          "fixed bottom-0 w-[340px] bg-background border border-border rounded-t-lg shadow-lg transition-all duration-200 z-40",
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
                <AvatarImage src={chat.avatarUrl} alt={chat.fullname} />
                <AvatarFallback>{chat.fullname.charAt(0)}</AvatarFallback>
              </Avatar>
              <OnlineIndicator
                isOnline={chat.isOnline || false}
                size="sm"
                className="absolute -bottom-0.5 -right-0.5"
              />
            </div>
            <span className="font-medium text-sm truncate max-w-[150px]">
              {chat.fullname}
            </span>
            {chat.unreadCount > 0 && (
              <div className="bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs shrink-0">
                {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
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
        "fixed bottom-0 w-[340px] h-[500px] bg-background border border-border rounded-t-lg shadow-lg flex flex-col transition-all duration-200 z-40",
        className
      )}
      style={{ right: `${rightOffset}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="relative shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={chat.avatarUrl} alt={chat.fullname} />
              <AvatarFallback>{chat.fullname.charAt(0)}</AvatarFallback>
            </Avatar>
            <OnlineIndicator
              isOnline={chat.isOnline || false}
              size="sm"
              className="absolute -bottom-0.5 -right-0.5"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm block truncate">
              {chat.fullname}
            </span>
            {chat.isOnline && (
              <div className="text-xs text-muted-foreground">Active now</div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Phone className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Video className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMinimize}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 min-h-0 overflow-hidden w-full">
        <ChatWindow
          chat={chat}
          messages={messages}
          isTyping={isOtherUserTyping}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onForwardMessage={() => {}}
          onDeleteMessage={() => {}}
          onReplyToMessage={() => {}}
          onMarkAsRead={(msgId) => ws.markMessageAsRead(msgId, chat.id)}
          className="h-full w-full"
        />
      </div>

      {/* Message Composer */}
      <div className="shrink-0 border-t border-border">
        <MessageComposer
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          placeholder="Aa"
        />
      </div>
    </div>
  );
};
