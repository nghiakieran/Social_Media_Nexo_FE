import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OnlineIndicator } from "./OnlineIndicator";
import { InstagramStoryRing } from "./InstagramStoryRing";
import { cn } from "@/lib/utils";
import type { ConversationResponseDTO } from "../types";
import { format, isToday, isYesterday, isThisYear } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageCircle, Check, CheckCheck } from "lucide-react";

interface ChatListProps {
  chats: ConversationResponseDTO[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  className?: string;
  presenceMap?: Record<number, boolean>;
  currentUserId?: number;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChat,
  onChatSelect,
  className,
  presenceMap = {},
  currentUserId,
}) => {
  const formatLastMessageTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, "HH:mm");
    } else if (isYesterday(timestamp)) {
      return "Hôm qua";
    } else if (isThisYear(timestamp)) {
      return format(timestamp, "d 'thg' M", { locale: vi });
    } else {
      return format(timestamp, "d 'thg' M, yyyy", { locale: vi });
    }
  };

  const truncateMessage = (content: string, maxLength: number = 40) => {
    return content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;
  };

  return (
    <div className={cn("space-y-1", className)}>
      {chats.map((chat) => {
        const otherUser = chat.participants.find((p) => p.id !== currentUserId);
        const isOnline = otherUser ? presenceMap[otherUser.id] || false : false;

        return (
          <div
            key={chat.id}
            className={cn(
              "group flex cursor-pointer items-center rounded-xl p-3 transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/15",
              activeChat === String(chat.id) &&
                "bg-primary/10 ring-1 ring-primary/20 dark:bg-primary/15"
            )}
            onClick={() => onChatSelect(String(chat.id))}
          >
            <InstagramStoryRing
              src={chat.avatarUrl}
              alt={chat.fullname}
              size="md"
              hasStory={true}
              hasUnread={chat.unreadCount > 0}
              className="shrink-0"
            >
              <OnlineIndicator
                isOnline={isOnline}
                size="md"
                className="absolute -bottom-0.5 -right-0.5"
              />
            </InstagramStoryRing>

            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className={cn(
                    "font-medium text-sm truncate",
                    chat.unreadCount > 0 && "font-semibold"
                  )}
                >
                  {chat.fullname}
                </h3>
                <div className="flex items-center space-x-1">
                  {chat.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {chat.lastMessage && chat.lastMessage.createdAt
                        ? formatLastMessageTime(
                            new Date(chat.lastMessage.createdAt)
                          )
                        : ""}
                    </span>
                  )}
                  {}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {chat.lastMessage ? (
                    <div className="flex items-center gap-1">
                      {chat.lastMessage.sender?.id === currentUserId && (
                        <span className="shrink-0">
                          {}
                          {chat.lastReadMessageId &&
                          chat.lastMessage.id <= chat.lastReadMessageId ? (
                            <span title="Đã xem">
                              <CheckCheck className="h-3 w-3 text-primary" />
                            </span>
                          ) : (
                            <span title="Đã gửi">
                              <Check className="h-3 w-3 text-muted-foreground" />
                            </span>
                          )}
                        </span>
                      )}
                      <p
                        className={cn(
                          "text-sm truncate",
                          chat.unreadCount > 0
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {chat.lastMessage.messageType === "TEXT" ? (
                          truncateMessage(chat.lastMessage.content, 30)
                        ) : (
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {chat.lastMessage.messageType === "IMAGE" &&
                              "Đã gửi một ảnh"}
                            {chat.lastMessage.messageType === "AUDIO" &&
                              "Đã gửi tin nhắn thoại"}
                            {chat.lastMessage.messageType === "FILE" &&
                              "Đã gửi tệp đính kèm"}
                            {chat.lastMessage.messageType === "STORY" &&
                              "Đã trả lời tin "}
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Bắt đầu cuộc trò chuyện
                    </p>
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <Badge
                    className="ml-2 flex h-[18px] min-w-[18px] items-center justify-center border-0 bg-primary text-[10px] text-primary-foreground"
                  >
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
