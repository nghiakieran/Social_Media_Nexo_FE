import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { useBatchPresence } from "../hooks/usePresence";
import { useAppDispatch, useAppSelector } from "@/store";
import { ChatList } from "../components/ChatList";
import { ChatWindow } from "../components/ChatWindow";
import { MessageComposer } from "../components/MessageComposer";
import { MessageRequestActions } from "../components/MessageRequestActions";
import { InstagramInboxHeader } from "../components/InstagramInboxHeader";
import { InstagramChatHeader } from "../components/InstagramChatHeader";
import { QuickActionsBar } from "../components/QuickActionsBar";
import { Button } from "@/components/ui/button";
import {
  setConversations,
  upsertConversation,
  setMessages,
  addMessage,
  addMessageWithUnreadUpdate,
  setActiveConversation,
  addReaction,
  removeReaction,
  handleReadAll,
  handleTypingNotification,
  clearOldTypingIndicators,
  acceptRequest,
  declineRequest,
} from "../messageSlice";
import {
  MessageDTO,
  EMessageType,
  EReactionType,
  EConversationStatus,
  PresenceStatusDTO,
  ReadAllDTO,
  TypingNotificationDTO,
} from "../types";
import { MessageSquarePlus } from "lucide-react";

export const InboxPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { conversations, messages, activeConversationId, typingUsers } =
    useAppSelector((state) => state.message);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeView, setActiveView] = useState<"primary" | "requests">(
    "primary"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [presenceUpdates, setPresenceUpdates] = useState<
    Record<number, { isOnline: boolean; lastSeen?: string }>
  >({});

  // Get conversationId from navigation state
  const targetConversationId = location.state?.conversationId as
    | number
    | undefined;

  // Track if this is initial load from navigation
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
        });
        if (response?.data?.content) {
          dispatch(
            setMessages({
              conversationId: Number(chatId),
              messages: response.data.content,
            })
          );
        }
      } catch (error) {
        console.error("Error loading messages:", error);
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
        console.error("Error fetching conversations:", error);
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
    if (!conv.lastMessage && conv.id !== targetConversationId) {
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

    return conv.fullname.toLowerCase().includes(searchQuery.toLowerCase());
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
    type: "text" | "image" | "file" | "voice"
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
          : EMessageType.AUDIO
      );
    } catch (error) {
      console.error("Error sending message:", error);
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
      const { messageApi } = await import("../services/messageApi");

      const currentMessage = messages[activeConversationId]?.find(
        (m) => m.id === Number(messageId)
      );
      const currentUserReaction = currentMessage?.reactions.find(
        (r) => r.userId === user.id
      );

      // Nếu click vào cùng reaction đang có, thì xóa nó đi
      if (currentUserReaction?.reactionType === reactionType) {
        dispatch(
          removeReaction({
            messageId: Number(messageId),
            conversationId: activeConversationId,
            userId: user.id,
          })
        );

        await messageApi.removeReaction(
          Number(messageId),
          currentUserReaction.reactionType
        );
        return;
      }

      // Optimistic update: addReaction tự động xóa reaction cũ và thêm mới
      dispatch(
        addReaction({
          messageId: Number(messageId),
          conversationId: activeConversationId,
          reaction: {
            userId: user.id,
            username: user.username,
            reactionType: reactionType as EReactionType,
          },
        })
      );

      // Nếu có reaction cũ (khác loại), xóa nó trên server trước
      if (currentUserReaction) {
        await messageApi.removeReaction(
          Number(messageId),
          currentUserReaction.reactionType
        );
      }

      await messageApi.addReaction(
        Number(messageId),
        reactionType as EReactionType
      );
    } catch (error) {
      console.error("Error adding reaction:", error);
      // TODO: Rollback state nếu API fail
    }
  };

  const handleRemoveReaction = async (
    messageId: string,
    reactionType: string
  ) => {
    if (!activeConversationId || !user) return;

    try {
      // Optimistic update: xóa reaction trong Redux store
      dispatch(
        removeReaction({
          messageId: Number(messageId),
          conversationId: activeConversationId,
          userId: user.id,
        })
      );

      // Gọi API để xóa reaction trên server
      const { messageApi } = await import("../services/messageApi");
      await messageApi.removeReaction(
        Number(messageId),
        reactionType as EReactionType
      );
    } catch (error) {
      console.error("Error removing reaction:", error);
      // TODO: Rollback state nếu API fail
    }
  };

  const handleForwardMessage = (messageId: string, userIds: string[]) => {
    // TODO: Implement forward message
  };

  const handleDeleteMessage = (messageId: string) => {
    // TODO: Implement delete message
  };

  const handleReplyToMessage = (messageId: string) => {
    // TODO: Implement reply to message
  };

  const handleMarkMessageAsRead = (messageId: number) => {
    if (!activeConversationId) return;

    ws.markMessageAsRead(messageId, activeConversationId);
  };

  const handleNewMessage = () => {
    // TODO: Implement new message modal
  };

  const handleViewChange = (view: "primary" | "requests") => {
    setActiveView(view);
    // Reset filter when switching views
    if (view === "requests") {
      setActiveFilter("all");
    }
  };

  const handleCallAction = (type: "voice" | "video") => {
    // TODO: Implement voice/video call
  };

  const handleAcceptRequest = async (conversationId: number) => {
    try {
      await dispatch(acceptRequest(conversationId)).unwrap();
      // Conversation status will be updated in Redux store
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDeclineRequest = async (conversationId: number) => {
    try {
      await dispatch(declineRequest(conversationId)).unwrap();
      // Clear active conversation if it was the declined one
      if (activeConversationId === conversationId) {
        dispatch(setActiveConversation(null));
      }
    } catch (error) {
      console.error("Error declining request:", error);
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
      console.error("Error refreshing conversations:", error);
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {}
      <div className="w-80 border-r border-border flex flex-col bg-background shrink-0">
        <InstagramInboxHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewMessage={handleNewMessage}
          activeView={activeView}
          onViewChange={handleViewChange}
        />

        {activeView === "primary" && (
          <QuickActionsBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center space-y-2">
                <MessageSquarePlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">
                  Không có tin nhắn nào
                </h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Tin nhắn mới sẽ hiển thị tại đây
                </p>
              </div>
            </div>
          ) : (
            <ChatList
              chats={filteredChats}
              activeChat={String(activeConversationId)}
              onChatSelect={handleChatSelect}
              className="p-2"
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

      {}
      <div className="flex-1 flex flex-col">
        {activeConversationId && currentChat ? (
          <>
            <InstagramChatHeader
              chat={currentChat}
              onCall={handleCallAction}
              onNicknameUpdated={handleRefreshConversations}
              onBlockStatusChanged={handleRefreshConversations}
              className="border-b border-border"
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
              className="flex-1"
            />
            {currentChat.status === EConversationStatus.PENDING &&
            currentChat.lastMessage?.sender.id !== user?.id ? (
              <MessageRequestActions
                conversation={currentChat}
                currentUserId={user?.id}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
              />
            ) : (
              <MessageComposer
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
                      console.error("Error unblocking user:", error);
                    }
                  }
                }}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-subtle">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full instagram-gradient flex items-center justify-center">
                <MessageSquarePlus className="h-12 w-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Messages</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Send private photos and messages to a friend or group
                </p>
                <Button
                  onClick={() =>
                    filteredChats[0] &&
                    handleChatSelect(String(filteredChats[0].id))
                  }
                  className="bg-primary hover:bg-primary/90"
                  disabled={!filteredChats[0]}
                >
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
