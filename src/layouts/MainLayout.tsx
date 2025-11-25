import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/common/Sidebar";
import { FloatingMessageTab } from "@/features/message/components/FloatingMessageTab";
import { FloatingChatWindow } from "@/features/message/components/FloatingChatWindow";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  closeFloatingConversation,
  minimizeFloatingConversation,
  restoreFloatingConversation,
  fetchMessages,
} from "@/features/message/messageSlice";
import { Suggestions } from "@/components/common/Suggestions";

export const MainLayout = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isHome = location.pathname === "/";
  const isMessagesPage = location.pathname.includes("/messages");
  const {
    conversations,
    messages,
    floatingConversations,
    minimizedConversations,
  } = useAppSelector((state) => state.message);

  const [showMessageTab, setShowMessageTab] = React.useState(false);

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
          <main className="flex-1 min-h-screen">
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

      {/* Floating Message Tab - Only show on desktop and non-message pages, hide when floating chats are open */}
      {!location.pathname.includes("/messages") && floatingConversations.length === 0 && (
        <div className="hidden lg:block">
          <FloatingMessageTab defaultOpen={showMessageTab} />
        </div>
      )}

      {/* Floating Chat Windows - Hide on messages page */}
      {!isMessagesPage && floatingConversations.map((conversationId, index) => {
        const floatingChat = conversations.find((c) => c.id === conversationId);
        const rawMessages = messages[conversationId] || [];
        // Sort messages by createdAt ascending (oldest first, newest last)
        const floatingMessages = [...rawMessages].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        if (!floatingChat) return null;

        return (
          <FloatingChatWindow
            key={conversationId}
            chat={floatingChat}
            messages={floatingMessages}
            isMinimized={minimizedConversations.includes(conversationId)}
            position={index}
            onClose={() => dispatch(closeFloatingConversation(conversationId))}
            onMinimize={() =>
              dispatch(minimizeFloatingConversation(conversationId))
            }
            onRestore={() =>
              dispatch(restoreFloatingConversation(conversationId))
            }
            onBack={() => {
              // Close floating chat and show FloatingMessageTab list view
              dispatch(closeFloatingConversation(conversationId));
              setShowMessageTab(true);
            }}
          />
        );
      })}
    </div>
  );
};
