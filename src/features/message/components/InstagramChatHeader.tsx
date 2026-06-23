import React, { useState, useEffect, useMemo, lazy } from "react";

const GroupInfoPanelLazy = lazy(() =>
  import("./GroupInfoPanel").then((m) => ({ default: m.GroupInfoPanel }))
);
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Phone,
  Video,
  Info,
  MoreVertical,
  Settings,
  Users,
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
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface InstagramChatHeaderProps {
  chat?: ConversationResponseDTO;
  onBack?: () => void;
  onCall?: (type: "voice" | "video") => void;
  onNicknameUpdated?: () => void;
  onBlockStatusChanged?: () => void;
  onGroupUpdated?: () => void;
  onGroupLeft?: () => void;
  showBackButton?: boolean;
  /** Chỉ hiện nút quay lại trên mobile (ẩn từ md trở lên) — dùng khi inbox và chat nằm cạnh nhau trên desktop */
  mobileOnlyBack?: boolean;
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
  onBlockStatusChanged,
  onGroupUpdated,
  onGroupLeft,
  showBackButton = false,
  mobileOnlyBack = false,
  className,
  isOnline = false,
  lastSeen,
  currentUserId,
}) => {
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [participants, setParticipants] = useState<UserDTO[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [nickname, setNickname] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [targetUser, setTargetUser] = useState<UserDTO | null>(null);
  const [currentUserOnlineStatus, setCurrentUserOnlineStatus] = useState<
    boolean | undefined
  >(undefined);
  const [isLoadingOnlineStatus, setIsLoadingOnlineStatus] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCurrentUserOnlineStatus = async () => {
      console.log("[InstagramChatHeader] Bắt đầu load currentUserOnlineStatus");
      setIsLoadingOnlineStatus(true);
      try {
        const { getCurrentUserProfile } = await import(
          "@/features/profile/api/profileApi"
        );
        const profile = await getCurrentUserProfile();
        console.log(
          "[InstagramChatHeader] Loaded profile.onlineStatus:",
          profile.onlineStatus
        );
        setCurrentUserOnlineStatus(profile.onlineStatus);
      } catch (error) {
        console.error(
          "[InstagramChatHeader] Error loading current user online status:",
          error
        );
      } finally {
        setIsLoadingOnlineStatus(false);
        console.log(
          "[InstagramChatHeader] Hoàn thành load currentUserOnlineStatus"
        );
      }
    };

    loadCurrentUserOnlineStatus();
  }, []);

  const otherUser = useMemo(
    () => chat?.participants?.find((p) => p.id !== currentUserId),
    [chat?.participants, currentUserId]
  );

  const shouldShowPresence = useMemo(() => {
    const result =
      !isLoadingOnlineStatus &&
      currentUserOnlineStatus !== false &&
      otherUser?.onlineStatus !== false;
    return result;
  }, [
    isLoadingOnlineStatus,
    currentUserOnlineStatus,
    otherUser?.onlineStatus,
    lastSeen,
    chat?.id,
  ]);

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

  const handleBlockUser = async () => {
    if (!chat?.participants || chat.participants.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không thể xác định người dùng",
        variant: "destructive",
      });
      return;
    }

    const userToBlock = chat.participants.find((p) => p.id !== currentUserId);
    if (!userToBlock?.username) {
      toast({
        title: "Lỗi",
        description: "Không thể xác định người dùng",
        variant: "destructive",
      });
      return;
    }

    setIsBlocking(true);
    try {
      if (chat.blockedByMe) {
        // Bỏ chặn
        const { unblockUser } = await import(
          "@/features/profile/api/profileApi"
        );
        await unblockUser(userToBlock.username);

        toast({
          title: "Đã bỏ chặn",
          description: `Bạn đã bỏ chặn ${userToBlock.fullName}.`,
        });
      } else {
        // Chặn
        const { blockUser } = await import("@/features/profile/api/profileApi");
        await blockUser(userToBlock.username);

        toast({
          title: "Đã chặn người dùng",
          description: `Bạn đã chặn ${userToBlock.fullName}. Họ sẽ không thể nhìn thấy hồ sơ, bài viết hoặc liên hệ với bạn.`,
        });
      }

      setBlockDialogOpen(false);
      setTargetUser(null);

      // Callback to parent to refresh
      if (onBlockStatusChanged) {
        onBlockStatusChanged();
      }

      // Reload trang hoặc update state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: "Lỗi",
        description:
          err.message ||
          `Không thể ${chat.blockedByMe ? "bỏ chặn" : "chặn"} người dùng`,
        variant: "destructive",
      });
    } finally {
      setIsBlocking(false);
    }
  };

  const handleOpenBlockDialog = () => {
    if (!chat?.participants || chat.participants.length === 0) return;

    const userToBlock = chat.participants.find((p) => p.id !== currentUserId);
    if (userToBlock) {
      setTargetUser(userToBlock);
      setBlockDialogOpen(true);
    }
  };

  if (!chat) {
    return (
      <div
        className={cn(
          "flex items-center justify-between border-b border-primary/10 bg-background/95 p-4 backdrop-blur-sm",
          className
        )}
      >
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className={cn(mobileOnlyBack && "md:hidden")}
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
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
        "flex items-center justify-between border-b border-primary/10 bg-background/95 p-2 backdrop-blur-sm md:p-3",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center space-x-2 md:space-x-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className={cn(
              "h-8 w-8 shrink-0 md:h-10 md:w-10",
              mobileOnlyBack && "md:hidden"
            )}
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
          </Button>
        )}

        <div className="relative shrink-0">
          {chat.isGroup ? (
            <div
              className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer"
              onClick={() => setGroupInfoOpen(true)}
            >
              {chat.groupAvatarUrl ? (
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage src={chat.groupAvatarUrl} alt={chat.groupName} />
                  <AvatarFallback><Users className="h-4 w-4 text-primary" /></AvatarFallback>
                </Avatar>
              ) : (
                <Users className="h-4 w-4 text-primary" />
              )}
            </div>
          ) : (
            <>
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src={chat.avatarUrl ?? ""} alt={chat.fullname ?? ""} />
                <AvatarFallback>
                  {chat.fullname ? chat.fullname.charAt(0) : "?"}
                </AvatarFallback>
              </Avatar>
              {shouldShowPresence && (
                <OnlineIndicator
                  isOnline={isOnline}
                  size="sm"
                  className="absolute -bottom-0.5 -right-0.5"
                />
              )}
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm md:text-base truncate cursor-pointer hover:underline"
            onClick={() => {
              if (chat.isGroup) {
                setGroupInfoOpen(true);
              } else if (chat.username) {
                navigate(`/${chat.username}`);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={chat.isGroup ? `Xem thông tin nhóm ${chat.groupName ?? ""}` : `Xem trang cá nhân của ${chat.fullname ?? ""}`}
          >
            {chat.isGroup ? (chat.groupName ?? chat.fullname ?? "") : (chat.fullname ?? "")}
          </h3>
          {chat.isGroup ? (
            <p className="text-xs text-muted-foreground">
              {chat.participants.length} thành viên
            </p>
          ) : chat.blockedByMe ? (
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive font-medium">
                Bạn đã chặn người này
              </span>
            </p>
          ) : shouldShowPresence ? (
            <p className="text-xs text-muted-foreground">
              {isOnline
                ? "Đang hoạt động"
                : lastSeen && formatLastSeen(lastSeen)
                ? formatLastSeen(lastSeen)
                : null}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center space-x-0.5 md:space-x-1 shrink-0">
        {!chat.isGroup && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary md:h-9 md:w-9"
              onClick={() => onCall?.("voice")}
            >
              <Phone className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary md:h-9 md:w-9"
              onClick={() => onCall?.("video")}
            >
              <Video className="h-4 w-4" />
            </Button>
          </>
        )}

        {chat.isGroup && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary md:h-9 md:w-9"
            onClick={() => setGroupInfoOpen(true)}
            title="Thông tin nhóm"
          >
            <Info className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary md:h-9 md:w-9"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {chat.isGroup ? (
              <>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                  onClick={() => setGroupInfoOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Thông tin nhóm
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                  onClick={() => {
                    if (chat.username) navigate(`/${chat.username}`);
                  }}
                >
                  Xem trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                  onClick={handleOpenNicknameDialog}
                >
                  Biệt danh
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground"
                  onClick={handleOpenBlockDialog}
                >
                  {chat.blockedByMe ? "Bỏ chặn" : "Chặn"}
                </DropdownMenuItem>
              </>
            )}
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

      {/* Group Info Panel */}
      {chat.isGroup && (
        <React.Suspense fallback={null}>
          {groupInfoOpen && (
            <GroupInfoPanelLazy
              open={groupInfoOpen}
              onOpenChange={setGroupInfoOpen}
              conversation={chat}
              currentUserId={currentUserId}
              onUpdated={() => { onGroupUpdated?.(); }}
              onLeft={() => { onGroupLeft?.(); }}
            />
          )}
        </React.Suspense>
      )}

      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {chat.blockedByMe ? "Bỏ chặn" : "Chặn"}{" "}
              {targetUser?.fullName || chat.fullname}?
            </DialogTitle>
            <DialogDescription className="text-justify">
              {chat.blockedByMe
                ? "Sau khi bỏ chặn, người này sẽ có thể tìm thấy hồ sơ, bài viết và story của bạn. Nexo sẽ không cho họ biết rằng bạn đã bỏ chặn họ."
                : "Họ sẽ không thể tìm thấy hồ sơ, bài viết hoặc story của bạn. Nexo sẽ không cho họ biết rằng bạn đã chặn họ."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              variant="destructive"
              onClick={handleBlockUser}
              disabled={isBlocking}
              className="w-full"
            >
              {isBlocking
                ? chat.blockedByMe
                  ? "Đang bỏ chặn..."
                  : "Đang chặn..."
                : chat.blockedByMe
                ? "Bỏ chặn"
                : "Chặn"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setBlockDialogOpen(false)}
              disabled={isBlocking}
              className="w-full"
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
