import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/common/Sidebar";
import { FloatingMessageTab } from "@/features/message/components/FloatingMessageTab";
import { FloatingChatWindow } from "@/features/message/components/FloatingChatWindow";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  closeFloatingConversation,
  minimizeFloatingConversation,
  restoreFloatingConversation,
  addMessage,
  addReaction,
  removeReaction,
} from "@/features/message/messageSlice";
import {
  ConversationUI,
  MessageUI,
  EReactionType,
} from "@/features/message/types";
import { EMessageType } from "@/features/message/types";
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

  const handleFloatingSendMessage =
    (conversationId: number) =>
    (content: string, type: "image" | "text" | "file" | "voice") => {
      // Map type string to EMessageType
      const typeMap: Record<string, EMessageType> = {
        text: EMessageType.TEXT,
        image: EMessageType.IMAGE,
        file: EMessageType.FILE,
        voice: EMessageType.AUDIO,
      };
      const newMessage: MessageUI = {
        id: Date.now(),
        conversationId,
        sender: {
          id: 1,
          username: "currentUser",
          avatarUrl: "",
          fullName: "Current User",
        },
        content,
        messageType: typeMap[type] || EMessageType.TEXT,
        createdAt: new Date().toISOString(),
        reactions: [],
        isRead: false,
        isSending: false,
      };
      dispatch(addMessage(newMessage));
    };

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

      {/* Floating Message Tab - Only show on desktop and non-message pages */}
      {!location.pathname.includes("/messages") && (
        <div className="hidden lg:block">
          <FloatingMessageTab />
        </div>
      )}

      {/* Floating Chat Windows */}
      {floatingConversations.map((conversationId, index) => {
        const floatingChat = conversations.find((c) => c.id === conversationId);
        const floatingMessages = messages[conversationId] || [];

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
            onSendMessage={handleFloatingSendMessage(conversationId)}
            onAddReaction={(messageId: string, emoji: string) => {
              dispatch(
                addReaction({
                  conversationId,
                  messageId: Number(messageId),
                  reaction: {
                    userId: 1,
                    username: "currentUser",
                    reactionType: emoji as EReactionType,
                  },
                })
              );
            }}
            onRemoveReaction={(messageId: string) => {
              dispatch(
                removeReaction({
                  conversationId,
                  messageId: Number(messageId),
                  userId: 1,
                })
              );
            }}
          />
        );
      })}
    </div>
  );
};
