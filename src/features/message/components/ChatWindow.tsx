import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
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
import { ReactionsDialog } from "./ReactionsDialog";
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
  onReplyToMessage: (message: MessageDTO) => void;
  onMarkAsRead?: (messageId: number) => void;
  onLoadMoreMessages?: () => void;
  hasMoreMessages?: boolean;
  isLoadingMore?: boolean;
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
  onLoadMoreMessages,
  hasMoreMessages = true,
  isLoadingMore = false,
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

  const prevScrollHeightRef = useRef<number>(0);
  const isNearBottomRef = useRef<boolean>(true);

  useLayoutEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      prevScrollHeightRef.current = scrollArea.scrollHeight;

      const distanceFromBottom =
        scrollArea.scrollHeight -
        scrollArea.scrollTop -
        scrollArea.clientHeight;
      isNearBottomRef.current = distanceFromBottom < 100;
    }
  }, [messages]);

  useLayoutEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const currentScrollHeight = scrollArea.scrollHeight;
    const prevScrollHeight = prevScrollHeightRef.current;

    if (currentScrollHeight > prevScrollHeight && scrollArea.scrollTop < 200) {
      const heightDifference = currentScrollHeight - prevScrollHeight;
      requestAnimationFrame(() => {
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollTop + heightDifference;
        }
      });
    } else if (isNearBottomRef.current) {
      requestAnimationFrame(() => {
        if (scrollArea) {
          scrollArea.scrollTop = currentScrollHeight;
        }
      });
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    if (
      target.scrollTop <= 200 &&
      !isLoadingMore &&
      hasMoreMessages &&
      onLoadMoreMessages
    ) {
      onLoadMoreMessages();
    }
  };

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
      { root: scrollAreaRef.current, threshold: 0.5 }
    );

    messageRefs.current.forEach((element) => {
      if (observerRef.current) observerRef.current.observe(element);
    });

    return () => observerRef.current?.disconnect();
  }, [messages, onMarkAsRead, user]);

  useEffect(() => {
    markedAsReadRef.current.clear();
  }, [chat.id]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [chat.id]);

  const isCurrentUser = (senderId: string | number) =>
    user && String(senderId) === String(user.id);

  const getReadStatus = (message: MessageDTO, isOwn: boolean) => {
    if (!isOwn) return null;
    const lastReadMessageId = chat.lastReadMessageId || 0;
    return message.id <= lastReadMessageId
      ? {
          icon: <CheckCheck className="h-3 w-3 inline text-primary" />,
          tooltip: "Đã xem",
        }
      : {
          icon: <Check className="h-3 w-3 inline text-muted-foreground" />,
          tooltip: "Đã gửi",
        };
  };

  const handleCopyMessage = (content: string) =>
    navigator.clipboard.writeText(content);

  const getLastOwnMessageId = () => {
    if (!user) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender.id === user.id) return messages[i].id;
    }
    return null;
  };

  const lastOwnMessageId = getLastOwnMessageId();

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

  return (
    <>
      <div className={cn("flex flex-col h-full overflow-hidden", className)}>
        <div
          className="flex-1 overflow-y-auto p-4"
          ref={scrollAreaRef}
          onScroll={handleScroll}
        >
          <div className="space-y-4">
            {/* Spinner hiển thị khi đang load tin cũ */}
            {isLoadingMore && (
              <div className="flex justify-center py-2 w-full">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}

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
                  className="space-y-2 py-2"
                  ref={(el) => {
                    if (el) messageRefs.current.set(message.id, el);
                    else messageRefs.current.delete(message.id);
                  }}
                  data-message-id={message.id}
                  data-sender-id={message.sender.id}
                >
                  {showDateSeparator && (
                    <div className="text-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                        {messageDate.toLocaleDateString("vi-VN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "group flex items-start gap-2",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
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
                        "flex flex-col gap-1 max-w-[70%]",
                        isOwn ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "relative group/msg",
                          message.reactions?.length > 0 && "mb-6"
                        )}
                      >
                        {/* Message Bubble */}
                        <div
                          className={cn(
                            "px-4 py-2 rounded-2xl relative break-words text-sm shadow-sm",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm border border-border/50"
                          )}
                        >
                          {/* Reply Message */}
                          {message.replyToMessage && (
                            <div
                              className={cn(
                                "mb-2 px-3 py-2 rounded-lg border-l-2 text-xs",
                                isOwn
                                  ? "bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground/80"
                                  : "bg-background/50 border-border text-muted-foreground"
                              )}
                            >
                              <div className="font-medium text-xs mb-1">
                                Trả lời {message.replyToMessage.sender.fullName}
                              </div>
                              <div className="truncate">
                                {message.replyToMessage.messageType === "IMAGE"
                                  ? "📷 Hình ảnh"
                                  : message.replyToMessage.content}
                              </div>
                            </div>
                          )}

                          {message.messageType === "IMAGE" ? (
                            <img
                              src={message.content}
                              alt="Sent image"
                              className="rounded-lg max-w-full h-auto mt-1"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                          )}

                          <div
                            className={cn(
                              "text-[10px] opacity-70 mt-1 flex items-center gap-1 select-none",
                              isOwn
                                ? "justify-end text-primary-foreground/80"
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
                            {isOwn && message.id === lastOwnMessageId && (
                              <span
                                title={getReadStatus(message, isOwn)?.tooltip}
                              >
                                {getReadStatus(message, isOwn)?.icon}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reaction Bar (Hiển thị khi hover) */}
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity z-10",
                            isOwn ? "-left-14" : "-right-14"
                          )}
                        >
                          <ReactionMessage
                            messageId={String(message.id)}
                            reactions={message.reactions.reduce(
                              (acc, r) => ({
                                ...acc,
                                [r.userId]: r.reactionType,
                              }),
                              {}
                            )}
                            onAddReaction={(type) =>
                              onAddReaction(String(message.id), type)
                            }
                            onRemoveReaction={(type) =>
                              onRemoveReaction(String(message.id), type)
                            }
                          />
                        </div>

                        {/* Menu Dropdown */}
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity z-10",
                            isOwn ? "-left-24" : "-right-24"
                          )}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-muted"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  console.log(
                                    "Reply clicked for message:",
                                    message.id
                                  );
                                  console.log(
                                    "Calling onReplyToMessage with:",
                                    message
                                  );
                                  console.log(
                                    "onReplyToMessage function:",
                                    onReplyToMessage
                                  );
                                  console.log(
                                    "onReplyToMessage type:",
                                    typeof onReplyToMessage
                                  );
                                  if (onReplyToMessage) {
                                    onReplyToMessage(message);
                                    console.log(
                                      "onReplyToMessage called successfully"
                                    );
                                  } else {
                                    console.error(
                                      "onReplyToMessage is not a function!"
                                    );
                                  }
                                }}
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

                        {/* Reactions Display */}
                        {message.reactions?.length > 0 && (
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

            {isTyping && (
              <div className="flex items-end space-x-2 animate-pulse">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={chat.avatarUrl} />
                  <AvatarFallback>...</AvatarFallback>
                </Avatar>
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs components (ForwardDialog, ReactionsDialog) giữ nguyên như cũ */}
      <ForwardMessageDialog
        open={forwardDialog.open}
        onOpenChange={(open) => setForwardDialog((p) => ({ ...p, open }))}
        messageContent={forwardDialog.content}
        onForward={handleForwardConfirm}
      />

      <ReactionsDialog
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
        reactions={reactionsDialog.reactions}
        loading={reactionsDialog.loading}
        onRemoveReaction={onRemoveReaction}
        userId={user?.id}
        messageId={reactionsDialog.messageId}
      />
    </>
  );
};
