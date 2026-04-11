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
  Reply,
  Copy,
  Forward,
  Trash2,
  MoreVertical,
  Check,
  CheckCheck,
  Play,
  X,
  Video as VideoIcon,
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

const checkIsVideo = (url: string | null | undefined) => {
  if (!url) return false;
  return (
    url.includes("/video/") ||
    /\.(mp4|mov|webm|ogg|mkv|m3u8)$/i.test(url)
  );
};

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

  const [viewingStory, setViewingStory] = useState<string | null>(null);

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

  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);

  useEffect(() => {
    messages.forEach((message) => {
      if (message.reactions && message.reactions.length > 0) {
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

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (viewingStory) {
      const isVideo = checkIsVideo(viewingStory);
      const duration = isVideo ? 15000 : 5000;
      
      timeout = setTimeout(() => {
        setViewingStory(null);
      }, duration);
    }
    return () => clearTimeout(timeout);
  }, [viewingStory]);

  useEffect(() => {
    if (prevChatIdRef.current !== chat.id) {
      hasScrolledToBottomRef.current = false;
      prevChatIdRef.current = chat.id;
      prevMessagesLengthRef.current = 0;
      isLoadingMoreRef.current = false;
      lastLoadMoreScrollTopRef.current = -1;
      
      // Khi chuyển chat, luôn reset scroll xuống dưới cùng
      if (scrollAreaRef.current) {
        requestAnimationFrame(() => {
            if(scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            }
        });
      }
    }
  }, [chat.id]);

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

  // Logic scroll chính
  useLayoutEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const currentScrollHeight = scrollArea.scrollHeight;
    const prevScrollHeight = prevScrollHeightRef.current;
    const prevScrollTop = prevScrollTopRef.current;
    const messagesLengthChanged =
      messages.length !== prevMessagesLengthRef.current;

    prevMessagesLengthRef.current = messages.length;

    // Kiểm tra tin nhắn cuối cùng có phải của mình không
    const lastMessage = messages[messages.length - 1];
    const isLastMessageMine = user && lastMessage?.sender && String(lastMessage.sender.id) === String(user.id);

    if (
      messagesLengthChanged &&
      currentScrollHeight > prevScrollHeight &&
      prevScrollTop < 500 &&
      !isNearBottomRef.current &&
      !isLastMessageMine // Chỉ giữ vị trí khi load more message cũ, và tin nhắn mới ko phải của mình
    ) {
      const heightDifference = currentScrollHeight - prevScrollHeight;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollArea) {
            const newScrollTop = prevScrollTop + heightDifference;
            scrollArea.scrollTop = newScrollTop;

            setTimeout(() => {
              // Logic check load more cũ
              if (scrollArea && scrollArea.scrollTop < 200) {
                if (topSentinelRef.current && loadMoreObserverRef.current) {
                  const rect = topSentinelRef.current.getBoundingClientRect();
                  const rootRect = scrollArea.getBoundingClientRect();
                  const isVisible =
                    rect.top < rootRect.bottom + 150 &&
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
    } else if (
      messagesLengthChanged ||
      (!hasScrolledToBottomRef.current && messages.length > 0)
    ) {
      // Logic cuộn xuống dưới:
      // 1. Đang ở gần đáy
      // 2. Hoặc lần đầu vào chưa cuộn
      // 3. HOẶC tin nhắn mới nhất là CỦA MÌNH (isLastMessageMine) -> BẮT BUỘC CUỘN
      if (
        isNearBottomRef.current ||
        !hasScrolledToBottomRef.current ||
        isLastMessageMine
      ) {
        requestAnimationFrame(() => {
          if (scrollArea) {
            // Dùng scrollTo để có thể set behavior smooth
            scrollArea.scrollTo({
                top: scrollArea.scrollHeight,
                behavior: isLastMessageMine ? "smooth" : "auto"
            });
            hasScrolledToBottomRef.current = true;
          }
        });
      }
    }
  }, [messages, hasMoreMessages, isLoadingMore, onLoadMoreMessages, user]);

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

  useEffect(() => {
    if (loadMoreObserverRef.current) {
      loadMoreObserverRef.current.disconnect();
      loadMoreObserverRef.current = null;
    }

    isLoadingMoreRef.current = false;
    lastLoadMoreScrollTopRef.current = -1;

    if (!topSentinelRef.current || !onLoadMoreMessages || !hasMoreMessages) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!topSentinelRef.current || !scrollAreaRef.current) return;

      loadMoreObserverRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
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
            const shouldTrigger =
              lastLoadMoreScrollTopRef.current === -1 ||
              Math.abs(currentScrollTop - lastLoadMoreScrollTopRef.current) >
                10 ||
              currentScrollTop < 100;

            if (shouldTrigger) {
              isLoadingMoreRef.current = true;
              lastLoadMoreScrollTopRef.current = currentScrollTop;
              onLoadMoreMessages();

              setTimeout(() => {
                if (!isLoadingMore) {
                  isLoadingMoreRef.current = false;
                }
              }, 800);
            }
          }
        },
        {
          root: scrollAreaRef.current,
          rootMargin: "200px",
          threshold: [0, 0.1, 0.5, 1],
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

  useEffect(() => {
    if (isLoadingMore || !hasMoreMessages || !onLoadMoreMessages) {
      return;
    }

    const scrollArea = scrollAreaRef.current;
    if (!scrollArea || !topSentinelRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!scrollArea || !topSentinelRef.current) return;

      const scrollTop = scrollArea.scrollTop;

      if (scrollTop < 200 && !isLoadingMoreRef.current) {
        const rect = topSentinelRef.current.getBoundingClientRect();
        const rootRect = scrollArea.getBoundingClientRect();
        const isVisible =
          rect.top < rootRect.bottom + 200 && rect.bottom > rootRect.top - 200;

        if (isVisible) {
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

  const handleScrollToMessage = (messageId: number) => {
    const element = messageRefs.current.get(messageId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 1500);
    }
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
            {hasMoreMessages && (
              <div
                ref={topSentinelRef}
                className="h-1 w-full"
                aria-hidden="true"
              />
            )}

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
              const isHighlighted = highlightedMessageId === message.id;

              const renderTime = (className?: string) => (
                <span
                  className={cn(
                    "text-[10px] select-none inline-flex items-center gap-1",
                    className
                  )}
                >
                  {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                  {isOwn && message.id === lastOwnMessageId && (
                    <span title={getReadStatus(message, isOwn)?.tooltip}>
                      {getReadStatus(message, isOwn)?.icon}
                    </span>
                  )}
                </span>
              );

              return (
                <div
                  key={message.id}
                  className={cn(
                    "space-y-2 py-2 transition-colors duration-1000 rounded-lg px-2 -mx-2",
                    isHighlighted ? "bg-primary/10" : "bg-transparent"
                  )}
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
                      "group flex items-end gap-2",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mb-1">
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
                        "flex flex-col max-w-[85%] md:max-w-[70%]",
                        isOwn ? "items-end" : "items-start"
                      )}
                    >
                      {message.replyToMessage && (
                        <div
                          onClick={() => handleScrollToMessage(message.replyToMessage.id)}
                          className={cn(
                            "mb-1 px-3 py-2 rounded-lg border-l-[3px] text-xs max-w-full w-fit cursor-pointer hover:opacity-80 transition-opacity",
                            isOwn
                              ? "bg-primary/5 border-primary/40 text-primary/80"
                              : "bg-muted/50 border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          <div className="font-semibold text-[11px] mb-0.5 opacity-90 flex items-center gap-1">
                            <Reply className="w-3 h-3" />
                            Trả lời {message.replyToMessage.sender.fullName}
                          </div>
                          <div className="break-words line-clamp-2 overflow-hidden italic opacity-80">
                            {message.replyToMessage.messageType === "IMAGE" ? (
                              <span className="flex items-center gap-1">
                                📷 Hình ảnh
                              </span>
                            ) : message.replyToMessage.messageType === "STORY" ? (
                              <span className="flex items-center gap-1">
                                🎥 Story
                              </span>
                            ) : (
                              message.replyToMessage.content
                            )}
                          </div>
                        </div>
                      )}

                      <div className="relative group/msg flex flex-col gap-1.5">
                        {message.messageType === "STORY" &&
                          message.storyMediaUrl && (
                            <div
                              className={cn(
                                "relative",
                                isOwn ? "ml-auto" : "mr-auto"
                              )}
                              onClick={() =>
                                setViewingStory(message.storyMediaUrl)
                              }
                            >
                              <div
                                className={cn(
                                  "relative overflow-hidden rounded-xl bg-black border border-border/10 shadow-md",
                                  "w-[140px] md:w-[160px] aspect-[9/16]",
                                  "group/story cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all duration-300"
                                )}
                              >
                                {checkIsVideo(message.storyMediaUrl) ? (
                                  <video
                                    src={message.storyMediaUrl}
                                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover/story:scale-105"
                                    muted
                                    playsInline
                                    loop
                                  />
                                ) : (
                                  <img
                                    src={message.storyMediaUrl}
                                    alt="Story media"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/story:scale-105 opacity-90"
                                  />
                                )}
                                
                                <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/story:scale-110 transition-transform">
                                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full shadow-lg border border-white/30">
                                    <Play
                                      className="w-5 h-5 text-white fill-white ml-0.5"
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                </div>

                                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                  <span className="text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Story
                                  </span>
                                </div>

                                {!message.content?.trim() && (
                                  <div className="absolute bottom-2 right-2 text-white/90 drop-shadow-md">
                                    {renderTime("text-white/80")}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {message.messageType === "IMAGE" && (
                          <div
                            className={cn(
                              "flex flex-col gap-1",
                              isOwn ? "items-end" : "items-start"
                            )}
                          >
                            {message.mediaList.map((media, idx) => (
                              <div
                                key={media.id || idx}
                                className="relative rounded-lg overflow-hidden border border-border/10 shadow-sm max-w-full"
                              >
                                <img
                                  src={media.mediaUrl}
                                  alt="Image"
                                  className="max-w-full h-auto max-h-[400px] object-cover"
                                />
                                {idx === message.mediaList.length - 1 &&
                                  !message.content?.trim() && (
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-white/90">
                                      {renderTime("text-white")}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}

                        {message.content?.trim() && (
                          <div
                            className={cn(
                              "px-4 py-2 rounded-2xl relative break-words text-sm shadow-sm w-fit",
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-sm ml-auto"
                                : "bg-muted text-foreground rounded-bl-sm mr-auto"
                            )}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                            <div
                              className={cn(
                                "mt-1 text-right opacity-70",
                                isOwn
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              )}
                            >
                              {renderTime()}
                            </div>
                          </div>
                        )}

                        <div
                          className={cn(
                            "absolute z-10 flex items-center gap-1 rounded-full border border-border/50 bg-background/95 px-2 py-1 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover/msg:opacity-100 max-sm:bottom-full max-sm:left-1/2 max-sm:top-auto max-sm:mb-1 max-sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2",
                            isOwn
                              ? "sm:-left-12 md:-left-20"
                              : "sm:-right-12 md:-right-20"
                          )}
                        >
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

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
                                "absolute -bottom-2 translate-y-full flex flex-row items-center gap-0.5 border rounded-full px-2 py-1 bg-background shadow-sm hover:scale-105 transition-transform cursor-pointer z-20",
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

      {viewingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-300">
          <div className="relative w-full h-full md:w-auto md:h-[85vh] md:aspect-[9/16] bg-black flex flex-col animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 z-20 p-4 space-y-2">
              <div className="flex gap-1 h-1">
                <div className="flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white animate-[progress_5s_linear_forwards] w-0 origin-left" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarImage src={chat.avatarUrl} />
                    <AvatarFallback>...</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-medium shadow-sm">
                    {chat.fullname || "Story"}
                  </span>
                </div>
                <button
                  onClick={() => setViewingStory(null)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {checkIsVideo(viewingStory) ? (
              <video
                src={viewingStory}
                className="w-full h-full object-contain md:object-cover md:rounded-lg"
                autoPlay
                controls
                playsInline
              />
            ) : (
              <img
                src={viewingStory}
                alt="Viewing Story"
                className="w-full h-full object-contain md:object-cover md:rounded-lg"
              />
            )}
          </div>
        </div>
      )}

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

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </>
  );
};