import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';

interface LikeUserItem {
  id: string;
  name: string;
  avatar: string;
  subtitle?: string;
  isVerified?: boolean;
  isFollowing?: boolean;
}

interface LikesDialogProps {
  isOpen: boolean;
  title?: string;
  infoText?: string;
  onClose: () => void;
  users?: Array<LikeUserItem>;
  onToggleFollow?: (userId: string, nextIsFollowing: boolean) => void;
}

export const LikesDialog = ({ isOpen, onClose, title = 'Lượt thích', infoText, users = [], onToggleFollow }: LikesDialogProps) => {
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const u of users) next[u.id] = !!u.isFollowing;
    setFollowMap(next);
  }, [users]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent background scroll when dialog is open
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow || 'unset';
    };
  }, [isOpen]);

  const handleToggle = (id: string) => {
    setFollowMap(prev => {
      const next = !prev[id];
      const out = { ...prev, [id]: next };
      onToggleFollow?.(id, next);
      return out;
    });
  };

  if (!isOpen) return null;

  // Mobile version - align with CommentDialog safe areas (show app header/bottom nav)
  if (isMobile) {
    return (
      <div className="fixed inset-x-0 top-[58px] bottom-20 bg-white dark:bg-gray-900 z-[40] flex flex-col overflow-hidden" role="dialog" aria-modal="true">
        {/* Mobile Header - matching CommentDialog */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-lg">{title}</h1>
          <div className="w-8"></div>
        </div>

        {infoText && (
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
            {infoText}
          </div>
        )}

        {/* List - matching CommentDialog scroll behavior */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          <div className="p-4 space-y-4">
            {(users.length ? users : Array.from({ length: 14 }).map((_, i) => ({ 
              id: String(i), 
              name: `user_${i+1}`, 
              avatar: '', 
              subtitle: 'Gợi ý cho bạn' 
            })) ).map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                    {u.avatar ? (
                      <img 
                        src={u.avatar} 
                        alt={u.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="text-sm font-medium leading-5 truncate">{u.name}</div>
                    {u.subtitle && <div className="text-xs text-gray-500 leading-4 truncate">{u.subtitle}</div>}
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(u.id)}
                  className={
                    followMap[u.id]
                      ? 'px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : 'px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-gradient-instagram hover:opacity-90 active:opacity-85 shadow-glow'
                  }
                >
                  {followMap[u.id] ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - original design
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-[420px] max-w-[90vw] max-h-[72vh] flex flex-col">
        {/* Header - IG like */}
        <div className="relative px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button type="button" onClick={onClose} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-700 dark:text-gray-300" aria-label="Đóng">
            ✕
          </button>
          <h2 className="text-center font-semibold">{title}</h2>
        </div>

        {infoText && (
          <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
            {infoText}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto" style={{maxHeight: 356}}>
          {(users.length ? users : Array.from({ length: 12 }).map((_, i) => ({ id: String(i), name: `user_${i+1}`, avatar: '', subtitle: 'Gợi ý cho bạn' })) ).map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Avatar className="w-11 h-11">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback>{u.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="text-sm font-medium leading-5">{u.name}</div>
                  {u.subtitle && <div className="text-xs text-gray-500 leading-4">{u.subtitle}</div>}
                </div>
              </div>
              <Button size="sm" variant={followMap[u.id] ? 'secondary' : 'default'} onClick={() => handleToggle(u.id)}>
                {followMap[u.id] ? 'Đang theo dõi' : 'Theo dõi'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


