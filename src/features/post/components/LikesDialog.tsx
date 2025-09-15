import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const u of users) next[u.id] = !!u.isFollowing;
    setFollowMap(next);
  }, [users]);

  const handleToggle = (id: string) => {
    setFollowMap(prev => {
      const next = !prev[id];
      const out = { ...prev, [id]: next };
      onToggleFollow?.(id, next);
      return out;
    });
  };

  if (!isOpen) return null;

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


