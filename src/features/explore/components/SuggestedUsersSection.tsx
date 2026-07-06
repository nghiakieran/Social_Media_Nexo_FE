import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, UserRoundPlus, Check, UserMinus, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { followUser, unfollowUser } from "@/features/profile/api/profileApi";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import { useToast } from "@/hooks/use-toast";
import type { PageModelResponse } from "@/features/message/types";
import type { ProfileData } from "@/features/profile/types";
import { navigateToProfile } from "@/utils/navigation";
import { cn } from "@/lib/utils";

type SuggestionUser = ProfileData & { isFollowing?: boolean; isLoading?: boolean };

export const SuggestedUsersSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<SuggestionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [justFollowedUsers, setJustFollowedUsers] = useState<Set<string>>(new Set());

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: PageModelResponse<ProfileData> }>(
        "/users/suggestions"
      );
      const content = res.data.data.content || [];
      setUsers(content.map((u) => ({ ...u, isFollowing: false, isLoading: false })));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleFollowToggle = async (user: SuggestionUser, e: React.MouseEvent) => {
    e.stopPropagation();
    const uid = user.id?.toString() ?? "";

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isLoading: true } : u))
    );

    try {
      if (user.isFollowing) {
        await unfollowUser(user.username);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isFollowing: false, isLoading: false } : u
          )
        );
        toast({ description: `Đã bỏ theo dõi @${user.username}` });
      } else {
        await followUser(user.username);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isFollowing: true, isLoading: false } : u
          )
        );
        setJustFollowedUsers((prev) => {
          const next = new Set(prev);
          next.add(uid);
          return next;
        });
        setHoveredBtn(null);
        toast({ description: `Đã theo dõi @${user.username}` });
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isLoading: false } : u))
      );
      toast({
        variant: "destructive",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground/90">Gợi ý cho bạn</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-2/5" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/5" />
              </div>
              <div className="h-8 w-24 bg-muted rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground/90">Gợi ý cho bạn</h2>
        </div>
      </div>

      {/* User List */}
      <div className="space-y-1">
        {users.map((user) => {
          const uid = user.id?.toString() ?? "";
          const isHoveringBtn = hoveredBtn === uid;

          return (
            <div
              key={uid}
              className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent hover:border-border/30"
              onClick={() => navigateToProfile(navigate, user.username)}
            >
              {/* Avatar + Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-200">
                  <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.username} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold">
                    {getAvatarInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.fullName}
                  </p>
                </div>
              </div>

              {/* Follow / Unfollow Button */}
              {user.isFollowing ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={user.isLoading}
                  className={cn(
                    "min-w-[115px] shrink-0 rounded-full font-semibold transition-all duration-300 border-border text-muted-foreground bg-transparent",
                    isHoveringBtn && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  )}
                  onClick={(e) => handleFollowToggle(user, e)}
                  onMouseEnter={() => {
                    if (!justFollowedUsers.has(uid)) {
                      setHoveredBtn(uid);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredBtn(null);
                    setJustFollowedUsers((prev) => {
                      if (prev.has(uid)) {
                        const next = new Set(prev);
                        next.delete(uid);
                        return next;
                      }
                      return prev;
                    });
                  }}
                >
                  {user.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isHoveringBtn ? (
                    <>
                      <UserMinus className="h-3 w-3 mr-1 shrink-0" />
                      Bỏ theo dõi
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 mr-1 shrink-0" />
                      Đang theo dõi
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  disabled={user.isLoading}
                  className="min-w-[100px] shrink-0 rounded-full font-semibold transition-all duration-200 shadow-sm"
                  onClick={(e) => handleFollowToggle(user, e)}
                >
                  {user.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserRoundPlus className="h-3 w-3 mr-1 shrink-0" />
                      Theo dõi
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
