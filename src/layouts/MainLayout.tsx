import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/common/Header';
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
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 flex justify-center min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-lg xl:max-w-xl 2xl:max-w-2xl">
            <Outlet />
          </div>
          {location.pathname === '/' && (
            <div className="hidden xl:block xl:w-80 2xl:w-96">
              <div className="sticky top-20 pt-8">
                <Suggestions />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Message Tab - Only show on non-message pages */}
      {!location.pathname.includes('/messages') && (
        <FloatingMessageTab />
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