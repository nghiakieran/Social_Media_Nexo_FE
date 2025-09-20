import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/common/Sidebar';
import { FloatingMessageTab } from '@/features/message/components/FloatingMessageTab';
import { FloatingChatWindow } from '@/features/message/components/FloatingChatWindow';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  closeFloatingChat,
  minimizeFloatingChat,
  restoreFloatingChat,
  addMessage,
  addReaction,
  removeReaction,
  Message,
} from '@/features/message/messageSlice';
import { Suggestions } from '@/components/common/Suggestions';

export const MainLayout = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isHome = location.pathname === '/';
  const { 
    chats, 
    messages, 
    floatingChats, 
    minimizedChats 
  } = useAppSelector((state) => state.message);

  const handleFloatingSendMessage = (chatId: string) => (content: string, type: 'text' | 'image' | 'file' | 'voice') => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: 'currentUser',
      content,
      type,
      timestamp: new Date(),
      isRead: false,
    };

    dispatch(addMessage(newMessage));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 flex justify-center min-h-screen pt-16 pb-16 lg:pt-0 lg:pb-0">
          <div className={isHome ? "w-full max-w-lg xl:max-w-xl 2xl:max-w-2xl" : "w-full max-w-[935px]"}>
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
      </div>

      {/* Floating Message Tab - Only show on desktop and non-message pages */}
      {!location.pathname.includes('/messages') && (
        <div className="hidden lg:block">
          <FloatingMessageTab />
        </div>
      )}

      {/* Floating Chat Windows */}
      {floatingChats.map((chatId, index) => {
        const floatingChat = chats.find(c => c.id === chatId);
        const floatingMessages = messages[chatId] || [];
        
        if (!floatingChat) return null;

        return (
          <FloatingChatWindow
            key={chatId}
            chat={floatingChat}
            messages={floatingMessages}
            isMinimized={minimizedChats.includes(chatId)}
            position={index}
            onClose={() => dispatch(closeFloatingChat(chatId))}
            onMinimize={() => dispatch(minimizeFloatingChat(chatId))}
            onRestore={() => dispatch(restoreFloatingChat(chatId))}
            onSendMessage={handleFloatingSendMessage(chatId)}
            onAddReaction={(messageId, emoji) => 
              dispatch(addReaction({ messageId, chatId, userId: 'currentUser', emoji }))
            }
            onRemoveReaction={(messageId) =>
              dispatch(removeReaction({ messageId, chatId, userId: 'currentUser' }))
            }
          />
        );
      })}
    </div>
  );
};