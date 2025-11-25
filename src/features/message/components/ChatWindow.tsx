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
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreObserverRef = useRef<IntersectionObserver | null>(null);

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

  const [reactionsCount, setReactionsCount] = useState<{
    [messageId: number]: number;
  }>({});

  // Clear reactionsCount when message.reactions changes (optimistic updates)
  useEffect(() => {
    messages.forEach((message) => {
      if (message.reactions && message.reactions.length > 0) {
        // Clear cached count when reactions are updated
        setReactionsCount((prev) => {
          const newCount = { ...prev };
          delete newCount[message.id];
          return newCount;
        });
      }
    });
  }, [messages]);

  const { user } = useAppSelector((state) => state.auth);

  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const isNearBottomRef = useRef<boolean>(true);
  const hasScrolledToBottomRef = useRef<boolean>(false);
  const prevChatIdRef = useRef<number | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const lastLoadMoreScrollTopRef = useRef<number>(-1);

  // Reset scroll flag when chat changes
  useEffect(() => {
    if (prevChatIdRef.current !== chat.id) {
      hasScrolledToBottomRef.current = false;
      prevChatIdRef.current = chat.id;
      prevMessagesLengthRef.current = 0;
      isLoadingMoreRef.current = false;
      lastLoadMoreScrollTopRef.current = -1;
    }
  }, [chat.id]);

  // Save scroll position before messages change
  useLayoutEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      prevScrollHeightRef.current = scrollArea.scrollHeight;
      prevScrollTopRef.current = scrollArea.scrollTop;

      const distanceFromBottom =
        scrollArea.scrollHeight -
        scrollArea.scrollTop -
        scrollArea.clientHeight;
      isNearBottomRef.current = distanceFromBottom < 100;
    }
  }, [messages]);

  // Adjust scroll position when messages change
  useLayoutEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const currentScrollHeight = scrollArea.scrollHeight;
    const prevScrollHeight = prevScrollHeightRef.current;
    const prevScrollTop = prevScrollTopRef.current;
    const messagesLengthChanged =
      messages.length !== prevMessagesLengthRef.current;

    // Update messages length ref
    prevMessagesLengthRef.current = messages.length;

    // If loading more messages at the top (scrollHeight increased and we're near top)
    if (
      messagesLengthChanged &&
      currentScrollHeight > prevScrollHeight &&
      prevScrollTop < 500 && // Near top of scroll
      !isNearBottomRef.current // Not near bottom
    ) {
      // Calculate the height difference (new messages added at top)
      const heightDifference = currentScrollHeight - prevScrollHeight;

      // Maintain scroll position by adjusting scrollTop
      // This keeps the user's view stable when new messages are added above
      // Sử dụng double requestAnimationFrame để đảm bảo DOM đã render xong
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollArea) {
            const newScrollTop = prevScrollTop + heightDifference;
            scrollArea.scrollTop = newScrollTop;

            // Sau khi maintain scroll position, kiểm tra xem có cần load tiếp không
            // Nếu scrollTop vẫn còn nhỏ (gần top) và có thêm messages, trigger load tiếp
            setTimeout(() => {
              if (scrollArea && scrollArea.scrollTop < 200) {
                // Kiểm tra xem sentinel có trong viewport không
                if (topSentinelRef.current && loadMoreObserverRef.current) {
                  // Force check intersection
                  const rect = topSentinelRef.current.getBoundingClientRect();
                  const rootRect = scrollArea.getBoundingClientRect();
                  const isVisible =
                    rect.top < rootRect.bottom + 150 && // rootMargin: 150px
                    rect.bottom > rootRect.top - 150;

                  if (
                    isVisible &&
                    !isLoadingMoreRef.current &&
                    !isLoadingMore &&
                    hasMoreMessages &&
                    onLoadMoreMessages
                  ) {
                    isLoadingMoreRef.current = true;
                    lastLoadMoreScrollTopRef.current = scrollArea.scrollTop;
                    onLoadMoreMessages();

                    setTimeout(() => {
                      isLoadingMoreRef.current = false;
                    }, 1000);
                  } else {
                    isLoadingMoreRef.current = false;
                  }
                } else {
                  isLoadingMoreRef.current = false;
                }
              } else {
                isLoadingMoreRef.current = false;
              }
            }, 100);
          }
        });
      });
    }
  
    else if (
      messagesLengthChanged &&
      currentScrollHeight > prevScrollHeight &&
      (isNearBottomRef.current ||
        !hasScrolledToBottomRef.current ||
        prevScrollTop > 100)
    ) {
      // Scroll to bottom for new messages
      requestAnimationFrame(() => {
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }
      });
    }
  }, [messages, hasMoreMessages, isLoadingMore, onLoadMoreMessages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;

    const distanceFromTop = scrollTop;

    const shouldLoadMore =
      distanceFromTop <= 50 &&
      !isLoadingMoreRef.current &&
      !isLoadingMore &&
      hasMoreMessages &&
      onLoadMoreMessages &&
      (lastLoadMoreScrollTopRef.current === -1 ||
        Math.abs(scrollTop - lastLoadMoreScrollTopRef.current) > 15);

    if (shouldLoadMore) {
      isLoadingMoreRef.current = true;
      lastLoadMoreScrollTopRef.current = scrollTop;
      onLoadMoreMessages();

      // Reset flag sau một khoảng thời gian để cho phép load tiếp
      setTimeout(() => {
        if (!isLoadingMore) {
          isLoadingMoreRef.current = false;
        }
      }, 800);
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

  // IntersectionObserver để detect khi scroll đến top và load more
  useEffect(() => {
    // Disconnect observer cũ nếu có
    if (loadMoreObserverRef.current) {
      loadMoreObserverRef.current.disconnect();
      loadMoreObserverRef.current = null;
    }

    // Reset flags khi chat thay đổi
    isLoadingMoreRef.current = false;
    lastLoadMoreScrollTopRef.current = -1;

    if (!topSentinelRef.current || !onLoadMoreMessages || !hasMoreMessages) {
      return;
    }

    // Tạo observer mới với delay nhỏ để đảm bảo DOM đã render
    const timeoutId = setTimeout(() => {
      if (!topSentinelRef.current || !scrollAreaRef.current) return;

      loadMoreObserverRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          // Trigger khi sentinel bắt đầu xuất hiện hoặc vẫn đang trong viewport
          if (
            entry.isIntersecting &&
            !isLoadingMoreRef.current &&
            !isLoadingMore &&
            hasMoreMessages &&
            onLoadMoreMessages
          ) {
            const scrollArea = scrollAreaRef.current;
            if (!scrollArea) return;

            const currentScrollTop = scrollArea.scrollTop;

            // Chỉ trigger nếu scroll position đã thay đổi đáng kể từ lần load trước
            // hoặc đây là lần đầu tiên
            const shouldTrigger =
              lastLoadMoreScrollTopRef.current === -1 ||
              Math.abs(currentScrollTop - lastLoadMoreScrollTopRef.current) >
                10 ||
              currentScrollTop < 100; // Nếu đang ở rất gần top, luôn trigger

            if (shouldTrigger) {
              isLoadingMoreRef.current = true;
              lastLoadMoreScrollTopRef.current = currentScrollTop;
              onLoadMoreMessages();

              // Reset flag sau một khoảng thời gian
              // Nhưng không reset ngay để tránh trigger nhiều lần
              setTimeout(() => {
                // Chỉ reset nếu không còn đang loading
                if (!isLoadingMore) {
                  isLoadingMoreRef.current = false;
                }
              }, 800);
            }
          }
        },
        {
          root: scrollAreaRef.current,
          rootMargin: "200px", // Trigger sớm hơn 200px trước khi đến top để mượt mà hơn
          threshold: [0, 0.1, 0.5, 1], // Trigger ở nhiều threshold để đảm bảo detect được
        }
      );

      if (topSentinelRef.current && loadMoreObserverRef.current) {
        loadMoreObserverRef.current.observe(topSentinelRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (loadMoreObserverRef.current) {
        loadMoreObserverRef.current.disconnect();
        loadMoreObserverRef.current = null;
      }
    };
  }, [onLoadMoreMessages, hasMoreMessages, isLoadingMore, chat.id]);

  // Tự động check và load tiếp sau khi loading xong nếu vẫn ở gần top
  useEffect(() => {
    // Chỉ check khi vừa finish loading (isLoadingMore chuyển từ true sang false)
    if (isLoadingMore || !hasMoreMessages || !onLoadMoreMessages) {
      return;
    }

    const scrollArea = scrollAreaRef.current;
    if (!scrollArea || !topSentinelRef.current) {
      return;
    }

    // Delay một chút để đảm bảo DOM đã update
    const timeoutId = setTimeout(() => {
      if (!scrollArea || !topSentinelRef.current) return;

      const scrollTop = scrollArea.scrollTop;

      // Nếu vẫn ở gần top và chưa load gần đây
      if (scrollTop < 200 && !isLoadingMoreRef.current) {
        // Kiểm tra xem sentinel có trong viewport không
        const rect = topSentinelRef.current.getBoundingClientRect();
        const rootRect = scrollArea.getBoundingClientRect();
        const isVisible =
          rect.top < rootRect.bottom + 200 && // rootMargin: 200px
          rect.bottom > rootRect.top - 200;

        if (isVisible) {
          // Trigger load more tiếp
          isLoadingMoreRef.current = true;
          lastLoadMoreScrollTopRef.current = scrollTop;
          onLoadMoreMessages();

          setTimeout(() => {
            if (!isLoadingMore) {
              isLoadingMoreRef.current = false;
            }
          }, 800);
        }
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [isLoadingMore, hasMoreMessages, onLoadMoreMessages]);

  // Scroll to bottom when chat changes
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      hasScrolledToBottomRef.current = false;
      // Use requestAnimationFrame and setTimeout to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight;
            hasScrolledToBottomRef.current = true;
          }
        }, 100);
      });
    }
  }, [chat.id]);

  // Scroll to bottom when messages are first loaded for a conversation
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea && messages.length > 0 && !hasScrolledToBottomRef.current) {
      // Wait for DOM to render messages
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight;
            hasScrolledToBottomRef.current = true;
          }
        }, 50);
      });
    }
  }, [messages.length, chat.id]);

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

  const fetchReactionsCount = async (messageId: number) => {
    try {
      const { messageApi } = await import("../services/messageApi");
      const response = await messageApi.getReactions(messageId);
      const count = response.data?.length || 0;
      setReactionsCount((prev) => ({
        ...prev,
        [messageId]: count,
      }));
      return count;
    } catch (error) {
      return null;
    }
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

      const count = response.data?.length || 0;
      setReactionsCount((prev) => ({
        ...prev,
        [Number(messageId)]: count,
      }));
    } catch (error) {
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
      <div
        className={cn("flex flex-col h-full overflow-hidden w-full", className)}
        data-chat-id={chat.id}
      >
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-4 w-full"
          ref={scrollAreaRef}
          onScroll={handleScroll}
          data-scroll-area
        >
          <div className="space-y-4">
            {/* Sentinel element để detect khi scroll đến top */}
            {hasMoreMessages && (
              <div
                ref={topSentinelRef}
                className="h-1 w-full"
                aria-hidden="true"
              />
            )}

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
                        "flex flex-col gap-1 max-w-[85%] md:max-w-[70%] w-full",
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
                            "px-4 py-2 rounded-2xl relative break-words text-sm shadow-sm max-w-full",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm border border-border/50"
                          )}
                        >
                          {/* Reply Message */}
                          {message.replyToMessage && (
                            <div
                              className={cn(
                                "mb-2 px-3 py-2 rounded-lg border-l-2 text-xs max-w-full",
                                isOwn
                                  ? "bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground/80"
                                  : "bg-background/50 border-border text-muted-foreground"
                              )}
                            >
                              <div className="font-medium text-xs mb-1">
                                Trả lời {message.replyToMessage.sender.fullName}
                              </div>
                              <div className="break-words line-clamp-3 overflow-hidden">
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

                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-all duration-200 z-10 flex items-center gap-1 px-2 py-1 bg-background/95 backdrop-blur-sm rounded-full shadow-sm border border-border/50",
                            isOwn
                              ? "-left-12 md:-left-20"
                              : "-right-12 md:-right-20"
                          )}
                        >
                          {/* Reaction Bar */}
                          <div className="flex items-center">
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
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  <span className="text-sm">😊</span>
                                </Button>
                              }
                            />
                          </div>

                          {/* Menu Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align={isOwn ? "end" : "start"}
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  if (onReplyToMessage) {
                                    onReplyToMessage(message);
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
                        {(() => {
                          const reactionsLength =
                            message.reactions?.length ?? 0;
                          const apiCount = reactionsCount[message.id];
                          const displayCount =
                            message.reactions !== undefined &&
                            message.reactions !== null
                              ? reactionsLength
                              : apiCount !== undefined
                              ? apiCount
                              : 0;
                          const hasReactions = displayCount > 0;

                          return hasReactions ? (
                            <button
                              className={cn(
                                "absolute -bottom-2 translate-y-full flex flex-row items-center gap-0.5 border rounded-full px-2 py-1 bg-background shadow-sm hover:scale-105 transition-transform cursor-pointer",
                                isOwn ? "right-0" : "left-0"
                              )}
                              onClick={() =>
                                handleOpenReactionsDialog(String(message.id))
                              }
                              onMouseEnter={() => {
                                if (reactionsCount[message.id] === undefined) {
                                  fetchReactionsCount(message.id);
                                }
                              }}
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
                                {displayCount}
                              </span>
                            </button>
                          ) : null;
                        })()}
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
