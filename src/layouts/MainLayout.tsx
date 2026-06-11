import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/common/Sidebar";
import { FloatingMessageTab } from "@/features/message/components/FloatingMessageTab";
import { FloatingChatWindow } from "@/features/message/components/FloatingChatWindow";
import { useAppDispatch, useAppSelector } from "@/store";
import { useWebSocket as useMessageWebSocket } from "@/features/message/hooks/useWebSocket";
import {
  closeFloatingConversation,
  minimizeFloatingConversation,
  restoreFloatingConversation,
  fetchMessages,
  fetchConversations,
  addMessageWithUnreadUpdate,
  addMessage,
  fetchPendingRequestsCountThunk,
} from "@/features/message/messageSlice";
import { MessageDTO } from "@/features/message/types";
import { playIncomingChatAlertIfNeeded } from "@/utils/inAppAlertSounds";
import { Suggestions } from "@/components/common/Suggestions";
import { getUnreadNotificationCountThunk } from "@/features/notification/notificationSlice";

export const MainLayout = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isHome = location.pathname === "/";
  const isMessagesPage = location.pathname.includes("/messages");
  const {
    conversations,
    messages,
    floatingConversations,
    minimizedConversations,
  } = useAppSelector((state) => state.message);

  const [showMessageTab, setShowMessageTab] = React.useState(false);

  const ws = useMessageWebSocket();

  React.useEffect(() => {
    if (!user?.id) return;
    dispatch(getUnreadNotificationCountThunk());
    dispatch(fetchConversations());
    dispatch(fetchPendingRequestsCountThunk());
  }, [dispatch, user?.id]);

  React.useEffect(() => {
    if (!ws.isConnected || conversations.length === 0) return;
    conversations.forEach((conv) => {
      ws.subscribeToMessageOnly(conv.id, (message: MessageDTO) => {
        if (user?.id) {
          dispatch(addMessageWithUnreadUpdate({ message, currentUserId: user.id }));
        } else {
          dispatch(addMessage(message));
        }
        const sid = message.sender?.id;
        if (sid != null) playIncomingChatAlertIfNeeded(message.id, sid, user?.id);
      });
    });
  }, [ws.isConnected, conversations.length, dispatch, user?.id, ws]);

  // Load messages when floating chat opens
  React.useEffect(() => {
    floatingConversations.forEach((conversationId) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation && !messages[conversationId]) {
        // Load initial messages if not already loaded
        dispatch(
          fetchMessages({
            conversationId,
            page: 0,
            size: 20,
          })
        );
      }
    });
    // Reset showMessageTab when a floating chat opens
    if (floatingConversations.length > 0) {
      setShowMessageTab(false);
    }
  }, [floatingConversations, conversations, messages, dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        {isMessagesPage ? (
          <main className="box-border flex h-[100dvh] max-h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden pt-14 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pt-0 lg:pb-0">
            <Outlet />
          </main>
        ) : (
          <main className="flex-1 flex justify-center min-h-screen pt-16 pb-16 lg:pt-0 lg:pb-0">
            <div
              className={
                isHome
                  ? "w-full max-w-lg xl:max-w-xl 2xl:max-w-2xl"
                  : "w-full max-w-[935px]"
              }
            >
              <Outlet />
            </div>
            {isHome && (
              <div className="hidden xl:block xl:w-80 2xl:w-96">
                <div className="sticky top-4 pt-8">
                  <Suggestions />
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Chat nổi (FAB + cửa sổ): chỉ desktop — mobile dùng tab Tin nhắn trong bottom nav */}
      <div className="hidden lg:block">
        {!location.pathname.includes("/messages") &&
          floatingConversations.length === 0 && (
            <FloatingMessageTab defaultOpen={showMessageTab} />
          )}

        {!isMessagesPage &&
          floatingConversations.map((conversationId, index) => {
            const floatingChat = conversations.find(
              (c) => c.id === conversationId
            );
            const rawMessages = messages[conversationId] || [];
            const floatingMessages = [...rawMessages].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );

            if (!floatingChat) return null;

            return (
              <FloatingChatWindow
                key={conversationId}
                chat={floatingChat}
                messages={floatingMessages}
                isMinimized={minimizedConversations.includes(conversationId)}
                position={index}
                onClose={() =>
                  dispatch(closeFloatingConversation(conversationId))
                }
                onMinimize={() =>
                  dispatch(minimizeFloatingConversation(conversationId))
                }
                onRestore={() =>
                  dispatch(restoreFloatingConversation(conversationId))
                }
                onBack={() => {
                  dispatch(closeFloatingConversation(conversationId));
                  setShowMessageTab(true);
                }}
              />
            );
          })}
      </div>
    </div>
  );
};
