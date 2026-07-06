import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OnlineIndicator } from "./OnlineIndicator";
import { InstagramStoryRing } from "./InstagramStoryRing";
import { cn } from "@/lib/utils";
import type { ConversationResponseDTO } from "../types";
import { format, isToday, isYesterday, isThisYear } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageCircle, Check, CheckCheck, Users, Phone, Video as VideoIcon, PhoneMissed } from "lucide-react";

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
        const isGroup = chat.isGroup || !!chat.groupName || chat.participants.length > 2;
        const otherUser = isGroup
          ? null
          : chat.participants.find((p) => p.id !== currentUserId);
        const isOnline = otherUser ? presenceMap[otherUser.id] || false : false;
        const displayName = isGroup
          ? (chat.groupName || chat.fullname || "Nhóm")
          : (chat.fullname || otherUser?.fullName || "");

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
            {isGroup ? (
              <div className="relative shrink-0 h-10 w-10 md:h-11 md:w-11">
                {chat.groupAvatarUrl ? (
                  <Avatar className="h-full w-full">
                    <AvatarImage src={chat.groupAvatarUrl} alt={chat.groupName} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                ) : (() => {
                  const members = chat.participants.filter((p) => p.id !== currentUserId).slice(0, 4);
                  if (members.length === 0) {
                    return (
                      <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    );
                  }
                  if (members.length === 1) {
                    return (
                      <Avatar className="h-full w-full">
                        <AvatarImage src={members[0].avatarUrl} alt={members[0].fullName} />
                        <AvatarFallback className="bg-primary/15 text-primary text-xs">
                          {members[0].fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    );
                  }
                  return (
                    <div className="relative h-full w-full">
                      {members.slice(0, 2).map((m, i) => (
                        <Avatar
                          key={m.id}
                          className={cn(
                            "absolute border-2 border-background",
                            i === 0 ? "h-6 w-6 md:h-7 md:w-7 bottom-0 left-0 z-10" : "h-6 w-6 md:h-7 md:w-7 top-0 right-0 z-20"
                          )}
                        >
                          <AvatarImage src={m.avatarUrl} alt={m.fullName} />
                          <AvatarFallback className="bg-primary/15 text-primary text-[9px]">
                            {m.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  );
                })()}
                {chat.unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                )}
              </div>
            ) : (
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
            )}

            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "font-medium text-sm truncate",
                      chat.unreadCount > 0 && "font-semibold"
                    )}
                  >
                    {displayName}
                  </h3>
                  {isGroup && (() => {
                    const others = chat.participants.filter((p) => p.id !== currentUserId);
                    const names = others.map((p) => p.nickname || p.fullName.split(" ").pop() || p.fullName);
                    const preview = names.slice(0, 3).join(", ");
                    const extra = names.length > 3 ? ` +${names.length - 3}` : "";
                    return (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {preview}{extra}
                      </p>
                    );
                  })()}
                </div>
                <div className="flex items-center space-x-1 shrink-0 ml-1">
                  {chat.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {chat.lastMessage.createdAt
                        ? formatLastMessageTime(new Date(chat.lastMessage.createdAt))
                        : ""}
                    </span>
                  )}
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
                            {chat.lastMessage.messageType === "CALL" ? (
                              (() => {
                                const parts = chat.lastMessage.content?.split("|") || [];
                                const type = parts[0]?.toLowerCase() || "";
                                const status = parts[1] || "";
                                const isMissed = status === "MISSED" || status === "REJECTED";
                                if (isMissed) return <PhoneMissed className="h-3 w-3 mr-1 text-destructive" />;
                                if (type.includes("video")) return <VideoIcon className="h-3 w-3 mr-1" />;
                                return <Phone className="h-3 w-3 mr-1" />;
                              })()
                            ) : (
                              <MessageCircle className="h-3 w-3 mr-1" />
                            )}
                            {chat.lastMessage.messageType === "IMAGE" &&
                              "Đã gửi một ảnh"}
                            {chat.lastMessage.messageType === "AUDIO" &&
                              "Đã gửi tin nhắn thoại"}
                            {chat.lastMessage.messageType === "FILE" &&
                              "Đã gửi tệp đính kèm"}
                            {chat.lastMessage.messageType === "STORY" &&
                              "Đã trả lời tin "}
                            {chat.lastMessage.messageType === "CALL" &&
                              (chat.lastMessage.content?.split("|")[0] || "Cuộc gọi")}
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
