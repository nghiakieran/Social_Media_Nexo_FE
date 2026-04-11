import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChatList } from "./ChatList";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  MessageSquare,
  X,
  Edit,
  Settings,
  Users,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { openFloatingConversation, fetchConversations } from "../messageSlice";
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
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

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
  const onlineChats = conversations
    .filter((conv) => conv.isOnline)
    .slice(0, 3);

  const filteredChats = conversations.filter((conv) =>
    conv.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (conversationId: number) => {
    dispatch(openFloatingConversation(conversationId));
    setIsOpen(false);
  };

  const handleNewMessage = () => {
    setIsOpen(false);
    navigate("/messages");
  };

  if (!isOpen) {
    return (
      <div
        className={cn(
          "fixed z-50 cursor-pointer rounded-full border border-primary/20 bg-background shadow-lg transition-all duration-200 hover:border-primary/40 hover:shadow-glow",
          "bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] p-3",
          className
        )}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label="Mở tin nhắn"
      >
        <div className="relative">
          <MessageSquare className="h-6 w-6 text-primary" />
          {totalUnread > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center border-0 bg-primary p-0 text-[10px] text-primary-foreground"
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
        "fixed z-50 flex flex-col overflow-hidden border border-primary/15 bg-background/95 shadow-xl backdrop-blur-md",
        "inset-x-0 bottom-0 max-h-[min(85dvh,28rem)] rounded-t-2xl sm:bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] sm:right-[max(1.5rem,env(safe-area-inset-right,0px))] sm:left-auto sm:h-96 sm:max-h-none sm:w-80 sm:rounded-xl",
        className
      )}
    >
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25 sm:hidden" />

      <div className="flex items-center justify-between border-b border-primary/10 px-3 py-3 sm:p-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary sm:hidden" />
          <h3 className="text-lg font-semibold text-foreground">Tin nhắn</h3>
          {totalUnread > 0 && (
            <Badge className="h-5 border-0 bg-primary text-xs text-primary-foreground">
              {totalUnread}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            onClick={handleNewMessage}
            aria-label="Tin nhắn mới"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/messages")}
            aria-label="Cài đặt tin nhắn"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {onlineChats.length > 0 && (
        <div className="border-b border-primary/10 p-3">
          <div className="mb-2 flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Đang hoạt động
            </span>
          </div>
          <div className="flex space-x-2">
            {onlineChats.map((conv) => (
              <div
                key={conv.id}
                className="relative cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => handleChatSelect(conv.id)}
              >
                <Avatar className="h-12 w-12 border-2 border-primary/30">
                  <AvatarImage src={conv.avatarUrl} alt={conv.fullname} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {conv.fullname.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background bg-success" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-primary/10 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tin nhắn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 border-0 bg-muted pl-9 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatList
          chats={filteredChats.slice(0, 5)}
          activeChat={null}
          onChatSelect={(chatId: string) => handleChatSelect(Number(chatId))}
          className="p-2"
        />
      </div>

      <div className="border-t border-primary/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:pb-3">
        <Button
          variant="ghost"
          className="w-full text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => {
            setIsOpen(false);
            navigate("/messages");
          }}
        >
          Xem tất cả tin nhắn
        </Button>
      </div>
    </div>
  );
};
