import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnlineIndicator } from "./OnlineIndicator";
import type { ConversationResponseDTO, UserDTO } from "../types";
import { cn } from "@/lib/utils";
import { formatLastSeen } from "../hooks/usePresence";

interface InstagramChatHeaderProps {
  chat?: ConversationResponseDTO;
  onBack?: () => void;
  onCall?: (type: "voice" | "video") => void;
  onNicknameUpdated?: () => void;
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
  onNicknameUpdated,
  showBackButton = false,
  className,
  isOnline = false,
  lastSeen,
  currentUserId,
}) => {
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [participants, setParticipants] = useState<UserDTO[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [nickname, setNickname] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  const handleOpenNicknameDialog = async () => {
    if (!chat?.id || !currentUserId) return;

    setNicknameDialogOpen(true);
    setIsLoadingParticipants(true);

    try {
      const { conversationApi } = await import("../services/messageApi");
      const response = await conversationApi.getConversationNickname(chat.id);

      if (response?.data?.participants) {
        setParticipants(response.data.participants);
      }
    } catch (error) {
      console.error("Error loading participants:", error);
      setParticipants([]);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const handleStartEditing = (userId: number, currentNickname?: string) => {
    setEditingUserId(userId);
    setNickname(currentNickname || "");
  };

  const handleCancelEditing = () => {
    setEditingUserId(null);
    setNickname("");
  };

  const handleUpdateNickname = async () => {
    if (!chat?.id || !nickname.trim() || !editingUserId) return;

    setIsUpdating(true);
    try {
      const { conversationApi } = await import("../services/messageApi");
      await conversationApi.updateNickname(
        chat.id,
        editingUserId,
        nickname.trim()
      );

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === editingUserId ? { ...p, nickname: nickname.trim() } : p
        )
      );

      setEditingUserId(null);
      setNickname("");

      if (onNicknameUpdated) {
        onNicknameUpdated();
      }
    } catch (error) {
      console.error("Error updating nickname:", error);
    } finally {
      setIsUpdating(false);
    }
  };

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
            <DropdownMenuItem>Xem trang cá nhân</DropdownMenuItem>
            <DropdownMenuItem>Tìm kiếm trong cuộc trò chuyện</DropdownMenuItem>
            <DropdownMenuItem>Tắt thông báo</DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenNicknameDialog}>
              Biệt danh
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Chặn
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Báo cáo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nickname Dialog */}
      <Dialog
        open={nicknameDialogOpen}
        onOpenChange={(open) => {
          setNicknameDialogOpen(open);
          if (!open) {
            setEditingUserId(null);
            setNickname("");
            setParticipants([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Biệt danh</DialogTitle>
            <DialogDescription>
              Đặt biệt danh cho người trong cuộc trò chuyện
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingParticipants ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => {
                  const isCurrentUser = participant.id === currentUserId;
                  const isEditing = editingUserId === participant.id;
                  const displayName =
                    participant.nickname || participant.fullName;

                  return (
                    <div
                      key={participant.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border bg-card",
                        !isEditing &&
                          "cursor-pointer hover:bg-muted/50 transition-colors"
                      )}
                      onClick={() => {
                        if (!isEditing) {
                          handleStartEditing(
                            participant.id,
                            participant.nickname
                          );
                        }
                      }}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={participant.avatarUrl}
                          alt={participant.fullName}
                        />
                        <AvatarFallback>
                          {participant.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div
                            className="space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Input
                              placeholder="Nhập biệt danh..."
                              value={nickname}
                              onChange={(e) => setNickname(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !isUpdating) {
                                  handleUpdateNickname();
                                } else if (e.key === "Escape") {
                                  handleCancelEditing();
                                }
                              }}
                              disabled={isUpdating}
                              autoFocus
                              className="h-9"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleUpdateNickname}
                                disabled={!nickname.trim() || isUpdating}
                              >
                                {isUpdating ? "Đang lưu..." : "Lưu"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEditing}
                                disabled={isUpdating}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium text-sm truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {participant.fullName}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNicknameDialogOpen(false)}
              disabled={isUpdating}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
