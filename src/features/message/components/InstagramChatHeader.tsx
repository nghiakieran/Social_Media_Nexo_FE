import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Phone,
  Video,
  Info,
  MoreVertical,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OnlineIndicator } from "./OnlineIndicator";
import type { ConversationResponseDTO } from "../types";
import { cn } from "@/lib/utils";
import { formatLastSeen } from "../hooks/usePresence";

interface InstagramChatHeaderProps {
  chat?: ConversationResponseDTO;
  onBack?: () => void;
  onCall?: (type: "voice" | "video") => void;
  showBackButton?: boolean;
  className?: string;
  isOnline?: boolean;
  lastSeen?: string;
  currentUserId?: number;
}

export const InstagramChatHeader: React.FC<InstagramChatHeaderProps> = ({
  chat,
  onBack,
  onCall,
  showBackButton = false,
  className,
  isOnline = false,
  lastSeen,
  currentUserId,
}) => {
  if (!chat) {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-border bg-background",
          className
        )}
      >
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">Tin nhắn</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border-b border-border bg-background",
        className
      )}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="relative shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={chat.avatarUrl ?? ""} alt={chat.fullname ?? ""} />
            <AvatarFallback>
              {chat.fullname ? chat.fullname.charAt(0) : "?"}
            </AvatarFallback>
          </Avatar>
          <OnlineIndicator
            isOnline={isOnline}
            size="sm"
            className="absolute -bottom-0.5 -right-0.5"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {chat.fullname ?? ""}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isOnline
              ? "Đang hoạt động"
              : lastSeen && formatLastSeen(lastSeen)
              ? formatLastSeen(lastSeen)
              : "Ngoại tuyến"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onCall?.("voice")}
        >
          <Phone className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onCall?.("video")}
        >
          <Video className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Info className="h-4 w-4 mr-2" />
              Xem trang cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem>Tìm kiếm trong cuộc trò chuyện</DropdownMenuItem>
            <DropdownMenuItem>Tắt thông báo</DropdownMenuItem>
            <DropdownMenuItem>Biệt danh</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-warning">
              Hạn chế
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Chặn
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Báo cáo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
