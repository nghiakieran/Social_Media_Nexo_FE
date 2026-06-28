import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Minus, Phone, Video, ArrowLeft } from "lucide-react";
import { OnlineIndicator } from "./OnlineIndicator";
import { MessageComposer } from "./MessageComposer";
import { ChatWindow } from "./ChatWindow";
import { cn } from "@/lib/utils";
import { playIncomingChatAlertIfNeeded } from "@/utils/inAppAlertSounds";
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
  ECallType,
  TypingNotificationDTO,
  ReactionWebSocketPayload,
  ReactionUpdateLegacyDTO,
} from "../types";
import { useCallContext } from "../contexts/CallContext";

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
  const { startCall } = useCallContext();

  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setIsNarrowViewport(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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
        const sid = message.sender?.id;
        if (sid != null)
          playIncomingChatAlertIfNeeded(message.id, sid, user?.id);
      }
    },
    onTyping: (typing: TypingNotificationDTO) => {
      if (typing.conversationId === chat.id) {
        dispatch(handleTypingNotification(typing));
      }
    },
    onReactionUpdate: (update: ReactionWebSocketPayload) => {
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

  const hasInitialScrolledRef = useRef(false);

  useEffect(() => {
    hasInitialScrolledRef.current = false;
  }, [chat.id]);

  // Scroll to bottom only when messages are first loaded for this floating chat session
  useEffect(() => {
    if (messages.length > 0 && !hasInitialScrolledRef.current) {
      hasInitialScrolledRef.current = true;
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

  const handleOutgoingCall = (kind: "voice" | "video") => {
    if (!user?.id) return;
    
    let callTarget;
    if (chat.isGroup) {
      callTarget = {
        id: chat.id,
        name: chat.groupName || chat.fullname || "Nhóm",
        avatarUrl: chat.groupAvatarUrl || chat.avatarUrl || "",
        isGroupCall: true,
      };
    } else {
      const other = chat.participants?.find((p) => p.id !== user.id);
      if (!other) return;
      callTarget = {
        id: other.id,
        name: other.fullName || other.username || chat.fullname || "",
        avatarUrl: other.avatarUrl || chat.avatarUrl || "",
      };
    }
    
    void startCall(
      chat.id,
      kind === "video" ? ECallType.VIDEO_CALL : ECallType.AUDIO_CALL,
      callTarget
    );
  };

  const handleSendMessage = (
    content: string,
    type: "text" | "image" | "file" | "voice",
    mediaUrls?: string[]
  ) => {
    const typeMap: Record<string, EMessageType> = {
      text: EMessageType.TEXT,
      image: EMessageType.IMAGE,
      file: EMessageType.FILE,
      voice: EMessageType.AUDIO,
    };

    try {
      ws.sendMessage(
        chat.id,
        content,
        typeMap[type] || EMessageType.TEXT,
        undefined,
        mediaUrls
      );
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
          "fixed bottom-0 z-40 rounded-t-lg border border-primary/15 bg-background/95 shadow-lg backdrop-blur-sm transition-all duration-200",
          isNarrowViewport
            ? "left-3 right-3 w-auto"
            : "w-[340px]",
          className
        )}
        style={!isNarrowViewport ? { right: `${rightOffset}px` } : undefined}
      >
        <div
          className="flex cursor-pointer items-center justify-between border-b border-primary/10 p-3 hover:bg-primary/5"
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
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
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
        "fixed bottom-0 z-40 flex flex-col rounded-t-lg border border-primary/15 bg-background/95 shadow-xl backdrop-blur-sm transition-all duration-200",
        isNarrowViewport
          ? "left-3 right-3 h-[min(500px,78dvh)] w-auto"
          : "h-[500px] w-[340px]",
        className
      )}
      style={!isNarrowViewport ? { right: `${rightOffset}px` } : undefined}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-primary/10 p-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 hover:bg-primary/10 hover:text-primary"
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

        <div className="flex shrink-0 items-center space-x-0.5">
          {!chat.isGroup && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                onClick={() => handleOutgoingCall("voice")}
                title="Gọi thoại"
                aria-label="Gọi thoại"
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                onClick={() => handleOutgoingCall("video")}
                title="Gọi video"
                aria-label="Gọi video"
              >
                <Video className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
            onClick={onMinimize}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
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
          onForwardMessage={() => { }}
          onDeleteMessage={() => { }}
          onReplyToMessage={() => { }}
          onMarkAsRead={(msgId) => ws.markMessageAsRead(msgId, chat.id)}
          className="h-full w-full"
        />
      </div>

      {/* Message Composer */}
      <div className="shrink-0 border-t border-primary/10 bg-background/95 pb-[env(safe-area-inset-bottom,0px)]">
        <MessageComposer
          className="border-0"
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          placeholder="Aa"
        />
      </div>
    </div>
  );
};
