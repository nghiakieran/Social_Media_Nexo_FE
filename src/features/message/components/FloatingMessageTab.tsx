import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChatList } from "./ChatList";
import { useAppDispatch, useAppSelector } from "@/store";
import { MessageSquare, X, Edit, Settings, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { openFloatingConversation, fetchConversations } from "../messageSlice";
import { ConversationUI } from "../types";
import { Input } from "@/components/ui/input";

interface FloatingMessageTabProps {
  className?: string;
  defaultOpen?: boolean;
}

export const FloatingMessageTab: React.FC<FloatingMessageTabProps> = ({
  className,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();

  // Sync with defaultOpen prop
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  // Fetch conversations when tab opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchConversations({ page: 0, size: 20 }));
    }
  }, [isOpen, dispatch]);

  const { conversations } = useAppSelector((state) => state.message);
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );
  const onlineChats = conversations.filter((conv) => conv.isOnline).slice(0, 3);

  const filteredChats = conversations.filter((conv) =>
    conv.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (conversationId: number) => {
    dispatch(openFloatingConversation(conversationId));
    setIsOpen(false);
  };

  const handleNewMessage = () => {
      };

  if (!isOpen) {
    return (
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 bg-background border border-border rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative p-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 w-80 h-96 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col",
        className
      )}
    >
      {}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-lg">Tin nhắn</h3>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="h-5 text-xs">
              {totalUnread}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNewMessage}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {}
      {onlineChats.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Đang hoạt động
            </span>
          </div>
          <div className="flex space-x-2">
            {onlineChats.map((conv) => (
              <div
                key={conv.id}
                className="relative cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleChatSelect(conv.id)}
              >
                <Avatar className="h-12 w-12 border-2 border-success">
                  <AvatarImage src={conv.avatarUrl} alt={conv.fullname} />
                  <AvatarFallback>{conv.fullname.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-success border-2 border-background rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tin nhắn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {}
      <div className="flex-1 overflow-hidden">
        <ChatList
          chats={filteredChats.slice(0, 5)} // Show only top 5 chats
          activeChat={null}
          onChatSelect={(chatId: string) => handleChatSelect(Number(chatId))}
          className="p-2"
        />
      </div>

      {}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full text-primary hover:text-primary/80"
          onClick={() => {
            setIsOpen(false);
            window.location.href = "/messages";
          }}
        >
          Xem tất cả tin nhắn
        </Button>
      </div>
    </div>
  );
};
