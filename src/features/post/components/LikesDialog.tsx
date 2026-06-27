import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { getPostLikeDetailThunk, getReelLikeDetailThunk, getCommentLikeDetailThunk } from '@/features/interaction';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useNavigate } from 'react-router-dom';
import { navigateToProfile } from '@/utils/navigation';
import { followUser, unfollowUser } from '@/features/profile/api/profileApi';

interface LikeUserItem {
  id: string;
  name: string;
  avatar: string;
  subtitle?: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  hasRequestedFollow?: boolean;
  isSelf?: boolean;
}

interface LikesDialogProps {
  isOpen: boolean;
  title?: string;
  infoText?: string;
  onClose: () => void;
  users?: Array<LikeUserItem>;
  targetType?: 'post' | 'reel' | 'comment';
  targetId?: number;
  onToggleFollow?: (userId: string, nextIsFollowing: boolean) => void;
}

export const LikesDialog = ({ isOpen, onClose, title = 'Lượt thích', infoText, users = [], targetType, targetId, onToggleFollow }: LikesDialogProps) => {
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Dynamic load state for API-driven mode
  const [list, setList] = useState<LikeUserItem[]>([]);
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [requestMap, setRequestMap] = useState<Record<string, boolean>>({});

  const isDynamic = useMemo(() => !!targetType && !!targetId, [targetType, targetId]);

  const effectiveUsers = isDynamic ? list : users;
  
useEffect(() => {
  if (!isOpen) return;
  const source = effectiveUsers;
  // sync following map
  setFollowMap((prev) => {
    const next: Record<string, boolean> = {};
    for (const u of source) next[u.id] = !!u.isFollowing;

    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    if (prevKeys.length === nextKeys.length) {
      let identical = true;
      for (const k of nextKeys) {
        if (prev[k] !== next[k]) { identical = false; break; }
      }
      if (identical) return prev;
    }
    return next;
  });
  // sync request map
  setRequestMap((prev) => {
    const next: Record<string, boolean> = {};
    for (const u of source) next[u.id] = !!u.hasRequestedFollow;
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    if (prevKeys.length === nextKeys.length) {
      let identical = true;
      for (const k of nextKeys) {
        if (prev[k] !== next[k]) { identical = false; break; }
      }
      if (identical) return prev;
    }
    return next;
  });
}, [isOpen, effectiveUsers]);

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

  const handleToggle = async (id: string) => {
    const target = effectiveUsers.find(u => u.id === id);
    if (!target || target.isSelf) return;

    const isFollowingNow = followMap[id] ?? !!target.isFollowing;
    const isRequestedNow = requestMap[id] ?? !!target.hasRequestedFollow;

    try {
      if (isRequestedNow) {
        // currently request pending -> cancel request (treat as unfollow/cancel)
        setRequestMap(prev => ({ ...prev, [id]: false }));
        setFollowMap(prev => ({ ...prev, [id]: false }));
        onToggleFollow?.(id, false);
        await unfollowUser(target.name);
      } else if (isFollowingNow) {
        // currently following -> unfollow (optimistic)
        setFollowMap(prev => ({ ...prev, [id]: false }));
        setRequestMap(prev => ({ ...prev, [id]: false }));
        onToggleFollow?.(id, false);
        await unfollowUser(target.name);
      } else {
        // currently not following -> follow
        // Optimistically treat as request pending to avoid showing 'Đang theo dõi' on private accounts
        setRequestMap(prev => ({ ...prev, [id]: true }));
        setFollowMap(prev => ({ ...prev, [id]: false }));
        onToggleFollow?.(id, false);
        await followUser(target.name);
      }
    } catch (e) {
      // rollback on error
      setFollowMap(prev => ({ ...prev, [id]: isFollowingNow }));
      setRequestMap(prev => ({ ...prev, [id]: isRequestedNow }));
    }
  };

  // Loader for dynamic mode
  const loadPage = async (nextPage: number) => {
    if (!isDynamic || !targetType || !targetId) return;
    setIsLoading(true);
    setError(null);
    try {
      if (targetType === 'post') {
        const data = await dispatch(
          getPostLikeDetailThunk({
            postId: targetId,
            params: { pageNo: nextPage, pageSize: 10 },
          })
        ).unwrap();
        setList(prev =>
          nextPage === 0
            ? mapApiToItems(data.content)
            : [...prev, ...mapApiToItems(data.content)]
        );
        setHasMore(!data.last);
        setPageNo(data.pageNo);
      } else if (targetType === 'reel') {
        const data = await dispatch(
          getReelLikeDetailThunk({
            reelId: targetId,
            params: { pageNo: nextPage, pageSize: 10 },
          })
        ).unwrap();
        setList(prev =>
          nextPage === 0
            ? mapApiToItems(data.content)
            : [...prev, ...mapApiToItems(data.content)]
        );
        setHasMore(!data.last);
        setPageNo(data.pageNo);
      } else if (targetType === 'comment') {
        const data = await dispatch(
          getCommentLikeDetailThunk({
            commentId: targetId,
            params: { pageNo: nextPage, pageSize: 10 },
          })
        ).unwrap();
        setList(prev =>
          nextPage === 0
            ? mapApiToItems(data.content)
            : [...prev, ...mapApiToItems(data.content)]
        );
        setHasMore(!data.last);
        setPageNo(data.pageNo);
      }
    } catch (e) {
      setError((e as string) || 'Lỗi tải danh sách');
    } finally {
      setIsLoading(false);
    }
  };

  const mapApiToItems = (rows: Array<{ userId: number; userName: string; fullName: string | null; avatar: string | null; isFollowing: boolean | null; hasRequestedFollow?: boolean; }>): LikeUserItem[] => {
    return rows.map(r => ({
      id: String(r.userId),
      name: r.userName,
      avatar: r.avatar || '',
      subtitle: r.fullName || undefined,
      // If isFollowing === null => it's current user; hide follow button for them
      isFollowing: r.isFollowing === true,
      hasRequestedFollow: r.hasRequestedFollow,
      isSelf: r.isFollowing === null,
    }));
  };

  useEffect(() => {
    if (!isOpen || !isDynamic) return;
    // reset list when opening
    setList([]);
    setPageNo(0);
    setHasMore(true);
    setError(null);
    loadPage(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isDynamic, targetType, targetId]);

  const { lastElementRef } = useInfiniteScroll(() => loadPage(pageNo + 1), {
    hasMore,
    isLoading,
    threshold: 200,
    error,
  });

  if (!isOpen) return null;

  const handleNavigateProfile = (username: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigateToProfile(navigate, username);
    onClose();
  };

  // Render as a centered modal dialog on both mobile and desktop via Portal
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-[400px] h-[480px] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header - IG like */}
        <div className="relative px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-center">
          <button 
            type="button" 
            onClick={onClose} 
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
            aria-label="Đóng"
          >
            ✕
          </button>
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-100">{title}</h2>
        </div>

        {infoText && (
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
            {infoText}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* In dynamic mode, avoid showing fake placeholder users to prevent flicker */}
          {isDynamic && effectiveUsers.length === 0 && isLoading && (
            <div className="px-4 py-3 text-xs text-gray-500 text-center">Đang tải...</div>
          )}
          {(!isDynamic
            ? (effectiveUsers.length ? effectiveUsers : Array.from({ length: 12 }).map((_, i) => ({ id: String(i), name: `user_${i+1}`, avatar: '', subtitle: 'Gợi ý cho bạn' })))
            : effectiveUsers
          ).map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <button type="button" onClick={(e) => handleNavigateProfile(u.name, e)}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback>{u.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
                <div className="flex flex-col">
                  <button type="button" onClick={(e) => handleNavigateProfile(u.name, e)} className="text-left text-sm font-medium leading-5 hover:underline">{u.name}</button>
                  {u.subtitle && <div className="text-xs text-gray-500 leading-4">{u.subtitle}</div>}
                </div>
              </div>
              {!u.isSelf && (
                (() => {
                  const requested = (requestMap[u.id] ?? !!u.hasRequestedFollow);
                  const following = (followMap[u.id] ?? !!u.isFollowing);
                  return (
                    <Button 
                      size="sm" 
                      variant={following && !requested ? 'outline' : 'default'} 
                      onClick={() => handleToggle(u.id)}
                      className="h-8 text-xs font-semibold px-4"
                    >
                      {requested ? 'Đang yêu cầu' : (following ? 'Đang theo dõi' : 'Theo dõi')}
                    </Button>
                  );
                })()
              )}
            </div>
          ))}
          {isDynamic && <div ref={lastElementRef as unknown as (node: HTMLDivElement | null) => void} />}
        </div>
      </div>
    </div>,
    document.body
  );
};




