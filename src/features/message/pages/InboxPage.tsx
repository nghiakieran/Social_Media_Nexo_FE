import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { useBatchPresence } from "../hooks/usePresence";
import { useAppDispatch, useAppSelector } from "@/store";
import { ChatList } from "../components/ChatList";
import { ChatWindow } from "../components/ChatWindow";
import { MessageComposer } from "../components/MessageComposer";
import { MessageRequestActions } from "../components/MessageRequestActions";
import { InstagramInboxHeader } from "../components/InstagramInboxHeader";
import { InstagramChatHeader } from "../components/InstagramChatHeader";
import { CreateGroupDialog } from "../components/CreateGroupDialog";
import { QuickActionsBar } from "../components/QuickActionsBar";
import { Button } from "@/components/ui/button";
import {
  setConversations,
  upsertConversation,
  setMessages,
  addMessage,
  addMessageWithUnreadUpdate,
  setActiveConversation,
  updateMessageReactionsFromAggregated,
  handleReadAll,
  handleTypingNotification,
  clearOldTypingIndicators,
  acceptRequest,
  declineRequest,
  updateMessagesPagination,
  fetchMessages,
  setReplyingTo,
  clearReplyingTo,
  addReaction,
  removeReaction,
} from "../messageSlice";
import {
  MessageDTO,
  EMessageType,
  EReactionType,
  EConversationStatus,
  PresenceStatusDTO,
  ReadAllDTO,
  TypingNotificationDTO,
  ReactionUpdateDTO,
} from "../types";
import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export const InboxPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    conversations,
    messages,
    activeConversationId,
    typingUsers,
    messagesPagination,
    replyingTo,
  } = useAppSelector((state) => state.message);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeView, setActiveView] = useState<"primary" | "requests">(
    "primary"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [presenceUpdates, setPresenceUpdates] = useState<
    Record<number, { isOnline: boolean; lastSeen?: string }>
  >({});

  const lastLoadMoreTimeRef = useRef<number>(0);

  const targetConversationId = location.state?.conversationId as
    | number
    | undefined;

  const isNavigationLoad = useRef(!!targetConversationId);

  const userIds = useMemo(
    () =>
      conversations
        .map((conv) => conv.participants.find((p) => p.id !== user?.id)?.id)
        .filter((id): id is number => id !== undefined),
    [conversations, user?.id]
  );

  const {
    presenceMap,
    lastSeenMap,
    refetch: refetchPresence,
  } = useBatchPresence(userIds);

  useEffect(() => {}, [presenceMap, lastSeenMap, presenceUpdates, userIds]);

  const ws = useWebSocket({
    onMessage: (message: MessageDTO) => {
      if (user?.id) {
        dispatch(
          addMessageWithUnreadUpdate({ message, currentUserId: user.id })
        );
      } else {
        dispatch(addMessage(message));
      }
    },
    onTyping: (typing: TypingNotificationDTO) => {
      dispatch(handleTypingNotification(typing));
    },
    onReadAll: (readAllEvent: ReadAllDTO) => {
      dispatch(handleReadAll({ ...readAllEvent, currentUserId: user.id }));
    },
    onReactionUpdate: (update: ReactionUpdateDTO) => {
      if ("reactions" in update && Array.isArray(update.reactions)) {
        const conversationId = Object.keys(messages).find((convId) =>
          messages[Number(convId)]?.some((msg) => msg.id === update.messageId)
        );

        if (conversationId) {
          dispatch(
            updateMessageReactionsFromAggregated({
              conversationId: Number(conversationId),
              messageId: update.messageId,
              aggregatedReactions: update.reactions,
            })
          );
        }
      } else if ("action" in update && "reaction" in update) {
        // Legacy format: single reaction with action
        if (update.action === "ADD") {
          dispatch(
            addReaction({
              messageId: update.messageId,
              conversationId: update.conversationId,
              reaction: update.reaction,
            })
          );
        } else if (update.action === "REMOVE") {
          dispatch(
            removeReaction({
              messageId: update.messageId,
              conversationId: update.conversationId,
              userId: update.reaction.userId,
            })
          );
        }
      }
    },
    onPresence: (presence: PresenceStatusDTO) => {
      setPresenceUpdates((prev) => ({
        ...prev,
        [presence.userId]: {
          isOnline: presence.isOnline,
          lastSeen: presence.lastSeen,
        },
      }));
    },
    autoConnect: true,
  });

  const handleChatSelect = useCallback(
    async (chatId: string) => {
      dispatch(setActiveConversation(Number(chatId)));

      try {
        const { messageApi } = await import("../services/messageApi");
        const response = await messageApi.getMessages({
          conversationId: Number(chatId),
          page: 1,
          size: 8,
        });
        if (response?.data?.content) {
          dispatch(
            setMessages({
              conversationId: Number(chatId),
              messages: response.data.content,
            })
          );
          dispatch(
            updateMessagesPagination({
              conversationId: Number(chatId),
              pagination: {
                page: 1,
                size: response.data.size,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                hasMore: !response.data.last,
              },
            })
          );
        }
      } catch (error) {
        // Error handled silently
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (isNavigationLoad.current) {
      isNavigationLoad.current = false;
      setIsLoading(false);
      return;
    }

    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const { conversationApi } = await import("../services/messageApi");
        let response;

        if (activeView === "requests") {
          response = await conversationApi.getConversationRequests({});
        } else if (activeFilter === "unread") {
          response = await conversationApi.getUnreadConversations({});
        } else if (activeFilter === "archived") {
          response = await conversationApi.getArchivedConversations({});
        } else {
          response = await conversationApi.getConversations({});
        }

        if (response?.data?.content) {
          dispatch(setConversations(response.data.content));
        }
      } catch (error) {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [dispatch, activeFilter, activeView]);

  useEffect(() => {
    if (targetConversationId && conversations.length > 0) {
      const conversation = conversations.find(
        (conv) => conv.id === targetConversationId
      );
      if (conversation) {
        handleChatSelect(String(targetConversationId));
      }
    }
  }, [targetConversationId, conversations, handleChatSelect]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchPresence();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchPresence]);

  const filteredChats = conversations.filter((conv) => {
    if (!conv.lastMessage && conv.id !== targetConversationId && !conv.isGroup) {
      return false;
    }

    if (activeView === "requests") {
      if (conv.status === EConversationStatus.PENDING) {
        const isRecipient = conv.lastMessage?.sender.id !== user?.id;
        if (!isRecipient) {
          return false;
        }
      } else {
        return false;
      }
    } else {
      if (conv.status === EConversationStatus.PENDING) {
        const isRecipient = conv.lastMessage?.sender.id !== user?.id;
        if (isRecipient) {
          return false;
        }
      } else if (conv.status === EConversationStatus.DECLINED) {
        const isRecipient = conv.lastMessage?.sender.id !== user?.id;
        if (isRecipient) {
          return false;
        }
      }
    }

    const displayName = conv.isGroup
      ? (conv.groupName ?? conv.fullname)
      : conv.fullname;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentMessages = activeConversationId
    ? [...(messages[activeConversationId] || [])].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : [];

  const currentChat = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  const currentChatOtherUser = useMemo(
    () => currentChat?.participants.find((p) => p.id !== user?.id),
    [currentChat, user?.id]
  );

  const currentChatPresence = useMemo(
    () =>
      currentChatOtherUser
        ? presenceUpdates[currentChatOtherUser.id] || {
            isOnline: presenceMap[currentChatOtherUser.id] || false,
            lastSeen: lastSeenMap[currentChatOtherUser.id],
          }
        : null,
    [currentChatOtherUser, presenceUpdates, presenceMap, lastSeenMap]
  );

  const isOtherUserTyping = useMemo(() => {
    if (!activeConversationId || !user?.id) return false;

    const typingInChat = typingUsers[activeConversationId] || [];
    const isTyping = typingInChat.some((t) => t.userId !== user.id);

    return isTyping;
  }, [activeConversationId, typingUsers, user?.id]);

  useEffect(() => {
    if (currentChat && currentChatOtherUser) {
      // Chat presence is already being tracked
    }
  }, [
    currentChat,
    currentChatOtherUser,
    currentChatPresence,
    presenceMap,
    presenceUpdates,
    lastSeenMap,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(clearOldTypingIndicators());
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (activeConversationId && ws) {
      ws.subscribeToConversation(Number(activeConversationId));

      ws.markConversationAsRead(Number(activeConversationId));
    }
  }, [activeConversationId, ws]);

  const handleSendMessage = (
    content: string,
    type: "text" | "image" | "file" | "voice",
    mediaUrls?: string[]
  ) => {
    if (!activeConversationId) return;

    try {
      ws.sendMessage(
        activeConversationId,
        content,
        type === "text"
          ? EMessageType.TEXT
          : type === "image"
          ? EMessageType.IMAGE
          : type === "file"
          ? EMessageType.FILE
          : EMessageType.AUDIO,
        replyingTo ? replyingTo.id : undefined,
        mediaUrls
      );
      dispatch(clearReplyingTo());
    } catch (error) {
      // Error handled silently
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!activeConversationId) return;

    if (isTyping) {
      ws.sendTyping(activeConversationId);
    }
  };

  const handleAddReaction = async (messageId: string, reactionType: string) => {
    if (!activeConversationId || !user) return;

    try {
      const currentMessage = messages[activeConversationId]?.find(
        (m) => m.id === Number(messageId)
      );
      const currentUserReaction = currentMessage?.reactions.find(
        (r) => r.userId === user.id
      );

      // If user already has this reaction type, toggle it off (remove)
      if (currentUserReaction?.reactionType === reactionType) {
        ws.sendRemoveReaction(
          Number(messageId),
          currentUserReaction.reactionType
        );
        // No need to dispatch - WebSocket handler will update state automatically
        return;
      }

      // If user has a different reaction, remove it first
      if (currentUserReaction) {
        ws.sendRemoveReaction(
          Number(messageId),
          currentUserReaction.reactionType
        );
      }

      // Add new reaction via WebSocket - backend will broadcast update to all clients
      ws.sendReaction(Number(messageId), reactionType as EReactionType);
      // No need to dispatch - WebSocket handler will update state automatically
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleRemoveReaction = async (
    messageId: string,
    reactionType: string
  ) => {
    if (!activeConversationId || !user) return;

    try {
      // Send remove reaction via WebSocket - backend will broadcast update to all clients
      ws.sendRemoveReaction(Number(messageId), reactionType as EReactionType);
      // No need to dispatch - WebSocket handler will update state automatically
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  };

  const handleForwardMessage = (messageId: string, userIds: string[]) => {};

  const handleDeleteMessage = (messageId: string) => {};

  const handleReplyToMessage = useCallback(
    (message: MessageDTO) => {
      dispatch(setReplyingTo(message));
    },
    [dispatch]
  );

  const handleNewMessage = () => {
    navigate("/people/suggestions");
  };

  const handleViewChange = (view: "primary" | "requests") => {
    setActiveView(view);
    if (view === "requests") {
      setActiveFilter("all");
    }
  };

  const handleCallAction = (type: "voice" | "video") => {};

  const handleCreateGroup = async (
    groupName: string,
    memberIds: number[]
  ) => {
    const { conversationApi } = await import("../services/messageApi");
    const response = await conversationApi.createGroup({
      groupName,
      memberUserIds: memberIds,
    });
    if (response?.data) {
      dispatch(upsertConversation(response.data));
      dispatch(setActiveConversation(response.data.id));
    }
  };

  const handleAcceptRequest = async (conversationId: number) => {
    try {
      await dispatch(acceptRequest(conversationId)).unwrap();
    } catch (error) {
      // Error handled silently
    }
  };

  const handleDeclineRequest = async (conversationId: number) => {
    try {
      await dispatch(declineRequest(conversationId)).unwrap();
      if (activeConversationId === conversationId) {
        dispatch(setActiveConversation(null));
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const handleRefreshConversations = async () => {
    try {
      const { conversationApi } = await import("../services/messageApi");
      let response;

      if (activeView === "requests") {
        response = await conversationApi.getConversationRequests({});
      } else if (activeFilter === "unread") {
        response = await conversationApi.getUnreadConversations({});
      } else if (activeFilter === "archived") {
        response = await conversationApi.getArchivedConversations({});
      } else {
        response = await conversationApi.getConversations({});
      }

      if (response?.data?.content) {
        dispatch(setConversations(response.data.content));
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const handleMarkMessageAsRead = (messageId: number) => {
    if (!activeConversationId) return;

    ws.markMessageAsRead(messageId, activeConversationId);
  };

  const handleLoadMoreMessages = useCallback(async () => {
    if (!activeConversationId || isLoadingMore) return;

    const now = Date.now();
    if (now - lastLoadMoreTimeRef.current < 1000) return;
    lastLoadMoreTimeRef.current = now;

    const currentPage = messagesPagination[activeConversationId]?.page || 0;
    const nextPage = currentPage + 1;

    setIsLoadingMore(true);
    try {
      await dispatch(
        fetchMessages({
          conversationId: activeConversationId,
          page: nextPage,
          size: 8,
        })
      ).unwrap();
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeConversationId, dispatch, isLoadingMore, messagesPagination]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background md:flex-row">
      {/* Danh sách: full width mobile; ẩn khi đang xem chat trên mobile */}
      <div
        className={cn(
          "flex min-h-0 w-full shrink-0 flex-col border-border bg-background transition-transform duration-300 md:flex md:h-full md:w-80 md:max-w-[20rem] md:border-r",
          activeConversationId ? "hidden md:flex" : "flex flex-1 md:flex-none"
        )}
      >
        <InstagramInboxHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewMessage={handleNewMessage}
          onCreateGroup={() => setCreateGroupDialogOpen(true)}
          activeView={activeView}
          onViewChange={handleViewChange}
        />

        {activeView === "primary" && (
          <QuickActionsBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {isLoading ? (
            <div className="flex h-full min-h-[12rem] items-center justify-center">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex min-h-[min(100%,20rem)] flex-col items-center justify-center px-4 py-8 md:py-12">
              <div className="mx-auto w-full max-w-sm space-y-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20">
                  <MessageSquarePlus className="h-9 w-9" strokeWidth={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground md:text-xl">
                    {activeView === "requests"
                      ? "Không có yêu cầu nào"
                      : "Chưa có cuộc trò chuyện"}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activeView === "requests"
                      ? "Yêu cầu nhắn tin mới sẽ hiện ở đây."
                      : "Kết bạn hoặc bắt đầu chat — tin nhắn sẽ hiển thị trong danh sách này."}
                  </p>
                </div>
                {activeView === "primary" && (
                  <Button
                    className="w-full sm:w-auto"
                    onClick={handleNewMessage}
                  >
                    Tìm bạn bè để nhắn tin
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ChatList
              chats={filteredChats}
              activeChat={String(activeConversationId)}
              onChatSelect={handleChatSelect}
              className="px-3 py-2 md:p-2"
              presenceMap={{
                ...presenceMap,
                ...Object.fromEntries(
                  Object.entries(presenceUpdates).map(([id, status]) => [
                    Number(id),
                    status.isOnline,
                  ])
                ),
              }}
              currentUserId={user?.id}
            />
          )}
        </div>
      </div>

      {/* Desktop: cột phải (empty / chat). Mobile: chỉ hiện khi đã chọn hội thoại — tránh 2 empty state chồng nhau */}
      <div
        className={cn(
          "min-h-0 w-full flex-col md:w-auto",
          activeConversationId
            ? "flex flex-1"
            : "hidden md:flex md:flex-1"
        )}
      >
        {activeConversationId && currentChat ? (
          <>
            <InstagramChatHeader
              chat={currentChat}
              onCall={handleCallAction}
              onNicknameUpdated={handleRefreshConversations}
              onBlockStatusChanged={handleRefreshConversations}
              onGroupUpdated={handleRefreshConversations}
              onGroupLeft={() => dispatch(setActiveConversation(null))}
              showBackButton={!!activeConversationId}
              mobileOnlyBack
              onBack={() => dispatch(setActiveConversation(null))}
              isOnline={currentChatPresence?.isOnline || false}
              lastSeen={currentChatPresence?.lastSeen}
              currentUserId={user?.id}
            />
            <ChatWindow
              chat={currentChat}
              messages={currentMessages}
              isTyping={isOtherUserTyping}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              onForwardMessage={handleForwardMessage}
              onDeleteMessage={handleDeleteMessage}
              onReplyToMessage={handleReplyToMessage}
              onMarkAsRead={handleMarkMessageAsRead}
              onLoadMoreMessages={handleLoadMoreMessages}
              hasMoreMessages={
                messagesPagination[activeConversationId]?.hasMore || false
              }
              isLoadingMore={isLoadingMore}
              className="min-h-0 flex-1"
            />
            {currentChat.status === EConversationStatus.PENDING &&
            currentChat.lastMessage &&
            currentChat.lastMessage.sender.id !== user?.id ? (
              <MessageRequestActions
                conversation={currentChat}
                currentUserId={user?.id}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
              />
            ) : (
              <MessageComposer
                className="shrink-0 border-primary/10 bg-background/95 backdrop-blur-sm"
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                isBlockedByMe={currentChat.blockedByMe || false}
                isBlockedByThem={
                  currentChat.status === EConversationStatus.BLOCKED &&
                  !currentChat.blockedByMe
                }
                fullname={
                  currentChat.participants.find((p) => p.id !== user?.id)
                    ?.fullName || currentChat.fullname
                }
                replyingTo={replyingTo}
                onCancelReply={() => dispatch(clearReplyingTo())}
                onUnblock={async () => {
                  const targetUser = currentChat.participants.find(
                    (p) => p.id !== user?.id
                  );
                  if (targetUser?.username) {
                    try {
                      const { unblockUser } = await import(
                        "@/features/profile/api/profileApi"
                      );
                      await unblockUser(targetUser.username);
                      await handleRefreshConversations();
                    } catch (error) {
                      // Error handled silently
                    }
                  }
                }}
              />
            )}
          </>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-gradient-subtle px-6 py-10">
            <div className="mx-auto max-w-md space-y-5 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
                <MessageSquarePlus className="h-12 w-12" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Chọn một cuộc trò chuyện
                </h2>
                <p className="text-sm text-muted-foreground md:text-base">
                  Chọn người ở danh sách bên trái để xem tin nhắn, hoặc tìm bạn
                  mới để bắt đầu chat.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" onClick={handleNewMessage}>
                  Tìm bạn bè
                </Button>
                {filteredChats[0] && (
                  <Button
                    onClick={() =>
                      handleChatSelect(String(filteredChats[0].id))
                    }
                  >
                    Mở chat gần nhất
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateGroupDialog
        open={createGroupDialogOpen}
        onOpenChange={setCreateGroupDialogOpen}
        conversations={conversations}
        currentUserId={user?.id}
        onCreate={handleCreateGroup}
      />
    </div>
  );
};
