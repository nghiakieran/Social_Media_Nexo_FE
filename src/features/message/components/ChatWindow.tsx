import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Reply,
  Copy,
  Forward,
  Trash2,
  MoreVertical,
  Check,
  CheckCheck,
} from "lucide-react";
import { TypingIndicator } from "./TypingIndicator";
import { ReactionMessage } from "./ReactionMessage";
import { ForwardMessageDialog } from "./ForwardMessageDialog";
import { cn } from "@/lib/utils";
import type {
  MessageDTO,
  ConversationResponseDTO,
  ReactionDetailDTO,
} from "../types";
import { useAppSelector } from "@/store";

interface ChatWindowProps {
  chat: ConversationResponseDTO;
  messages: MessageDTO[];
  isTyping: boolean;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, reactionType: string) => void;
  onForwardMessage: (messageId: string, userIds: string[]) => void;
  onDeleteMessage: (messageId: string) => void;
  onReplyToMessage: (messageId: string) => void;
  onMarkAsRead?: (messageId: number) => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  isTyping,
  onAddReaction,
  onRemoveReaction,
  onForwardMessage,
  onDeleteMessage,
  onReplyToMessage,
  onMarkAsRead,
  className,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const markedAsReadRef = useRef<Set<number>>(new Set());
  const [forwardDialog, setForwardDialog] = useState<{
    open: boolean;
    messageId: string;
    content: string;
  }>({ open: false, messageId: "", content: "" });

  const [reactionsDialog, setReactionsDialog] = useState<{
    open: boolean;
    messageId: string;
    reactions: ReactionDetailDTO[];
    loading: boolean;
  }>({ open: false, messageId: "", reactions: [], loading: false });

  const { user } = useAppSelector((state) => state.auth);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }

    if (isFocused && messages.length > 0 && onMarkAsRead && user) {
      const lastMessage = messages[messages.length - 1];

      if (
        lastMessage.sender.id !== user.id &&
        !markedAsReadRef.current.has(lastMessage.id)
      ) {
        setTimeout(() => {
          if (isFocused) {
            markedAsReadRef.current.add(lastMessage.id);
            onMarkAsRead(lastMessage.id);
          }
        }, 500);
      }
    }
  }, [messages, isFocused, onMarkAsRead, user]);

  useEffect(() => {
    if (!onMarkAsRead || !user) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = Number(
              entry.target.getAttribute("data-message-id")
            );
            const senderId = Number(
              entry.target.getAttribute("data-sender-id")
            );

            if (
              messageId &&
              senderId !== user.id &&
              !markedAsReadRef.current.has(messageId)
            ) {
              markedAsReadRef.current.add(messageId);
              onMarkAsRead(messageId);
            }
          }
        });
      },
      {
        root: scrollAreaRef.current,
        threshold: 0.5, // Mark as read when 50% visible
      }
    );

    messageRefs.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, onMarkAsRead, user]);

  useEffect(() => {
    markedAsReadRef.current.clear();
  }, [chat.id]);

  const isCurrentUser = (senderId: string | number) => {
    return user && String(senderId) === String(user.id);
  };

  const getReadStatus = (message: MessageDTO, isOwn: boolean) => {
    if (!isOwn) return null;

    const lastReadMessageId = chat.lastReadMessageId || 0;

    if (message.id <= lastReadMessageId) {
      return {
        icon: <CheckCheck className="h-3 w-3 inline text-primary" />,
        tooltip: "Đã xem",
      };
    } else {
      return {
        icon: <Check className="h-3 w-3 inline text-muted-foreground" />,
        tooltip: "Đã gửi",
      };
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleOpenReactionsDialog = async (messageId: string) => {
    setReactionsDialog({
      open: true,
      messageId,
      reactions: [],
      loading: true,
    });

    try {
      const { messageApi } = await import("../services/messageApi");
      const response = await messageApi.getReactions(Number(messageId));

      setReactionsDialog({
        open: true,
        messageId,
        reactions: response.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching reactions:", error);
      setReactionsDialog({
        open: true,
        messageId,
        reactions: [],
        loading: false,
      });
    }
  };

  const handleForwardMessage = (messageId: string, content: string) => {
    setForwardDialog({ open: true, messageId, content });
  };

  const handleForwardConfirm = (userIds: string[]) => {
    onForwardMessage(forwardDialog.messageId, userIds);
    setForwardDialog({ open: false, messageId: "", content: "" });
  };

  const getLastOwnMessageId = () => {
    if (!user) return null;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender.id === user.id) {
        return messages[i].id;
      }
    }
    return null;
  };

  const lastOwnMessageId = getLastOwnMessageId();

  return (
    <>
      <div className={cn("flex flex-col h-full overflow-hidden", className)}>
        {}
        <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = isCurrentUser(String(message.sender.id));
              const messageDate = new Date(message.createdAt);
              const prevMessageDate =
                index > 0 ? new Date(messages[index - 1].createdAt) : null;
              const showDateSeparator =
                !prevMessageDate ||
                messageDate.toDateString() !== prevMessageDate.toDateString();

              return (
                <div
                  key={message.id}
                  className="space-y-2"
                  ref={(el) => {
                    if (el) {
                      messageRefs.current.set(message.id, el);
                    } else {
                      messageRefs.current.delete(message.id);
                    }
                  }}
                  data-message-id={message.id}
                  data-sender-id={message.sender.id}
                >
                  {showDateSeparator && (
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {messageDate.toLocaleDateString("vi-VN", {
                          weekday: "long",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "group flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-300",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={message.sender.avatarUrl || chat.avatarUrl}
                          alt={message.sender.fullName}
                        />
                        <AvatarFallback>
                          {message.sender.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        "flex flex-col gap-1",
                        isOwn ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "relative max-w-md",
                          message.reactions &&
                            message.reactions.length > 0 &&
                            "mb-6"
                        )}
                      >
                        <div
                          className={cn(
                            "px-4 py-2 rounded-2xl relative break-words",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          <p className="break-words whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <div
                            className={cn(
                              "text-xs opacity-70 mt-1 flex items-center gap-1",
                              isOwn
                                ? "text-primary-foreground/70 justify-end"
                                : "text-muted-foreground"
                            )}
                          >
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )}
                            </span>
                            {}
                            {isOwn && message.id === lastOwnMessageId && (
                              <span
                                className="ml-1"
                                title={getReadStatus(message, isOwn)?.tooltip}
                              >
                                {getReadStatus(message, isOwn)?.icon}
                              </span>
                            )}
                          </div>
                        </div>

                        {}
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                            isOwn ? "-left-12" : "-right-12"
                          )}
                        >
                          <ReactionMessage
                            messageId={String(message.id)}
                            reactions={message.reactions.reduce((acc, r) => {
                              acc[String(r.userId)] = r.reactionType;
                              return acc;
                            }, {} as { [userId: string]: string })}
                            onAddReaction={(reactionType) => {
                              onAddReaction(String(message.id), reactionType);
                            }}
                            onRemoveReaction={(reactionType) =>
                              onRemoveReaction(String(message.id), reactionType)
                            }
                          />
                        </div>

                        {}
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                            isOwn ? "-left-20" : "-right-20"
                          )}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  onReplyToMessage(String(message.id))
                                }
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Trả lời
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCopyMessage(message.content)
                                }
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Sao chép
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleForwardMessage(
                                    String(message.id),
                                    message.content
                                  )
                                }
                              >
                                <Forward className="h-4 w-4 mr-2" />
                                Chuyển tiếp
                              </DropdownMenuItem>
                              {isOwn && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onDeleteMessage(String(message.id))
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {}
                        {message.reactions && message.reactions.length > 0 && (
                          <button
                            className={cn(
                              "absolute -bottom-2 translate-y-full flex flex-row items-center gap-0.5 border rounded-full px-2 py-1 bg-background shadow-sm hover:scale-105 transition-transform cursor-pointer",
                              isOwn ? "right-0" : "left-0"
                            )}
                            onClick={() =>
                              handleOpenReactionsDialog(String(message.id))
                            }
                          >
                            {Object.keys(
                              message.reactions.reduce((acc, r) => {
                                acc[r.reactionType] = true;
                                return acc;
                              }, {} as { [reactionType: string]: boolean })
                            ).map((reactionType) => {
                              const emoji =
                                reactionType === "LIKE"
                                  ? "👍"
                                  : reactionType === "LOVE"
                                  ? "❤️"
                                  : reactionType === "HAHA"
                                  ? "😂"
                                  : reactionType === "WOW"
                                  ? "😮"
                                  : reactionType === "SAD"
                                  ? "😢"
                                  : reactionType === "ANGRY"
                                  ? "😡"
                                  : "🔥";
                              return (
                                <span key={reactionType} className="text-sm">
                                  {emoji}
                                </span>
                              );
                            })}
                            <span className="text-xs text-muted-foreground ml-1">
                              {message.reactions.length}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {}
            {isTyping && (
              <div className="flex items-end space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.avatarUrl} alt={chat.fullname} />
                  <AvatarFallback>{chat.fullname.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <ForwardMessageDialog
        open={forwardDialog.open}
        onOpenChange={(open) => setForwardDialog((prev) => ({ ...prev, open }))}
        messageContent={forwardDialog.content}
        onForward={handleForwardConfirm}
      />

      {}
      <Dialog
        open={reactionsDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setReactionsDialog({
              open: false,
              messageId: "",
              reactions: [],
              loading: false,
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cảm xúc</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reactionsDialog.loading ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            ) : reactionsDialog.reactions.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-sm text-muted-foreground">Chưa có cảm xúc</p>
              </div>
            ) : (
              reactionsDialog.reactions.map((reaction) => (
                <div
                  key={`${reaction.userId}-${reaction.reactionType}`}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    reaction.userId === user?.id
                      ? "hover:bg-muted cursor-pointer"
                      : "cursor-default"
                  )}
                  onClick={() => {
                    if (reaction.userId === user?.id) {
                      setReactionsDialog({
                        open: false,
                        messageId: "",
                        reactions: [],
                        loading: false,
                      });

                      onRemoveReaction(
                        reactionsDialog.messageId,
                        reaction.reactionType
                      );
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={reaction.avatarUrl}
                        alt={reaction.fullName}
                      />
                      <AvatarFallback>
                        {reaction.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{reaction.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {reaction.userId === user?.id
                          ? "Chọn để gỡ"
                          : `@${reaction.username}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">
                    {reaction.reactionType === "LIKE"
                      ? "👍"
                      : reaction.reactionType === "LOVE"
                      ? "❤️"
                      : reaction.reactionType === "HAHA"
                      ? "😂"
                      : reaction.reactionType === "WOW"
                      ? "😮"
                      : reaction.reactionType === "SAD"
                      ? "😢"
                      : reaction.reactionType === "ANGRY"
                      ? "😡"
                      : "🔥"}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
