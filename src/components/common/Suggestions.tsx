import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppSelector } from "@/store";
import { SwitchAccountDialog } from "@/features/auth";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import { api } from "@/lib/axios";
import { followUser } from "@/features/profile/api/profileApi";
import type { PageModelResponse } from "@/features/message/types";
import type { ProfileData } from "@/features/profile/types";
import { useToast } from "@/components/ui/use-toast";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Loader2 } from "lucide-react";

type SuggestionUser = ProfileData & { isFollowing?: boolean; isLoading?: boolean };

interface AllSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserClick: (user: SuggestionUser) => void;
}

const AllSuggestionsModal = ({
  isOpen,
  onClose,
  onUserClick,
  onFollowSuccess,
}: AllSuggestionsModalProps & {
  onFollowSuccess: () => void;
}) => {
  const [modalSuggestions, setModalSuggestions] = useState<SuggestionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const { toast } = useToast();
  const isLoadingRef = useRef(false);

  const loadPage = useCallback(async (page: number) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const res = await api.get<{ data: PageModelResponse<ProfileData> }>(
        "/users/suggestions",
        {
          params: {
            pageNo: page,
            pageSize: 15,
          },
        }
      );
      const data = res.data.data;
      const content = data.content || [];
      const mapped = content.map((u) => ({
        ...u,
        isFollowing: false,
        isLoading: false,
      }));

      setModalSuggestions((prev) => (page === 0 ? mapped : [...prev, ...mapped]));
      setHasMore(!data.last);
      setPageNo(page);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách gợi ý. Vui lòng thử lại!",
        variant: "destructive",
      });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      loadPage(0);
    } else {
      setModalSuggestions([]);
      setPageNo(0);
      setHasMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { lastElementRef } = useInfiniteScroll(() => {
    if (!isLoading && hasMore) {
      loadPage(pageNo + 1);
    }
  }, {
    hasMore,
    isLoading,
    threshold: 100,
  });

  const handleFollow = async (user: SuggestionUser, e: React.MouseEvent) => {
    e.stopPropagation();
    const uid = user.id.toString();

    setModalSuggestions((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isLoading: true } : u))
    );

    try {
      await followUser(user.username);
      setModalSuggestions((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isFollowing: true, isLoading: false } : u
        )
      );
      toast({
        title: "Đã gửi yêu cầu theo dõi",
        description: `Bạn đã gửi yêu cầu theo dõi đến @${user.username}`,
      });
      onFollowSuccess();
    } catch (err) {
      setModalSuggestions((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isLoading: false } : u))
      );
      toast({
        title: "Lỗi",
        description: "Không thể gửi yêu cầu theo dõi. Vui lòng thử lại!",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0 overflow-hidden bg-background border shadow-glow">
        <div className="flex flex-col h-[80vh]">
          {/* Header */}
          <div className="p-4 border-b border-border text-center flex-shrink-0">
            <h2 className="text-lg font-bold text-foreground">Gợi ý cho bạn</h2>
          </div>
          {/* Scrollable User List */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-muted min-h-0">
            {modalSuggestions.length === 0 && isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : modalSuggestions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Không có gợi ý nào
              </div>
            ) : (
              <div className="space-y-3">
                {modalSuggestions.map((user) => (
                  <div
                    key={user.id.toString()}
                    className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 transition-all duration-300 hover:shadow-glow border border-transparent hover:border-border/30"
                    onMouseEnter={() => setHoveredUser(user.id.toString())}
                    onMouseLeave={() => setHoveredUser(null)}
                    onClick={() => {
                      onUserClick(user);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative">
                        <Avatar
                          className={`h-12 w-12 transition-all duration-300 ${
                            hoveredUser === user.id.toString()
                              ? "ring-2 ring-primary scale-110"
                              : ""
                          }`}
                        >
                          <AvatarImage src={getAvatarUrl(user.avatar)} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold">
                            {getAvatarInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        {hoveredUser === user.id.toString() && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full border-2 border-background bg-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground group-hover:text-primary transition-all duration-300 truncate">
                          {user.username}
                        </p>
                        <p className="text-muted-foreground text-xs truncate">
                          {user.fullName}
                        </p>
                      </div>
                    </div>

                    {user.isFollowing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="font-bold text-sm px-4 py-2 rounded-lg border-border text-muted-foreground bg-transparent"
                      >
                        Đang theo dõi
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={user.isLoading}
                        className={`font-bold text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                          hoveredUser === user.id.toString()
                            ? "bg-primary text-white hover:bg-primary/90 hover:text-white scale-110 shadow-md"
                            : "text-primary hover:bg-primary/10 hover:text-white dark:hover:bg-primary/20"
                        }`}
                        onClick={(e) => handleFollow(user, e)}
                      >
                        {user.isLoading ? (
                          <Loader2 className="h-4 w-5 animate-spin" />
                        ) : (
                          "Theo dõi"
                        )}
                      </Button>
                    )}
                  </div>
                ))}

                {hasMore && (
                  <div
                    ref={lastElementRef as unknown as (node: HTMLDivElement | null) => void}
                    className="flex justify-center items-center py-4"
                  >
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const Suggestions = () => {
  const navigate = useNavigate();
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAppSelector((state) => state.auth.user);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: PageModelResponse<SuggestionUser> }>(
        "/users/suggestions"
      );
      setSuggestions(res.data.data.content || []);
    } catch (err) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const displayedSuggestions = suggestions.slice(0, 5);

  const handleSeeAll = () => {
    setShowAllSuggestions(true);
  };

  const handleUserClick = (user: SuggestionUser) => {
    navigate(`/${user.username}`);
  };

  const handleSwitchAccount = () => {
    setIsSwitchAccountOpen(true);
  };

  return (
    <>
      <div className="fixed right-4 top-4 w-[22rem] h-[calc(100vh)] overflow-y-auto p-4 space-y-6 bg-background border-l border-border/30">
        {/* Current User Profile */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-muted/50 to-background border border-border/50 shadow-glow">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 hover:opacity-80 transition-opacity"
            onClick={() => user?.username && navigate(`/${user.username}`)}
          >
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-primary">
                <AvatarImage src={getAvatarUrl(user?.avatar)} />
                <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                  {getAvatarInitials(user?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground hover:underline truncate">
                {user?.username || "username"}
              </p>
              <p className="text-muted-foreground text-sm truncate">
                {user?.fullName || "Full Name"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="font-bold text-primary transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
            onClick={handleSwitchAccount}
          >
            Chuyển
          </Button>
        </div>

        {/* Suggestions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground font-bold text-sm">
              Gợi ý cho bạn
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSeeAll}
              className="text-foreground hover:text-muted-foreground font-bold text-sm p-0 hover:bg-transparent transition-all duration-200 hover:scale-105"
            >
              Xem tất cả
            </Button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                Đang tải gợi ý...
              </div>
            ) : displayedSuggestions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Không có gợi ý nào
              </div>
            ) : (
              displayedSuggestions.map((user) => (
                <div
                  key={user.id.toString()}
                  className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 transition-all duration-300 hover:shadow-glow border border-transparent hover:border-border/30"
                  onMouseEnter={() => setHoveredUser(user.id.toString())}
                  onMouseLeave={() => setHoveredUser(null)}
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <Avatar
                        className={`h-11 w-11 transition-all duration-300 ${hoveredUser === user.id.toString()
                          ? "ring-2 ring-primary scale-110"
                          : ""
                          }`}
                      >
                        <AvatarImage src={getAvatarUrl(user.avatar)} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold">
                          {getAvatarInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      {hoveredUser === user.id.toString() && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full border-2 border-background bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground group-hover:text-primary transition-all duration-300 truncate">
                        {user.username}
                      </p>
                      <p className="text-muted-foreground text-xs truncate">
                        {user.fullName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`font-bold text-sm px-4 py-2 rounded-lg transition-all duration-300 ${hoveredUser === user.id.toString()
                      ? "bg-primary text-white hover:bg-primary/90 hover:text-white scale-110 shadow-md"
                      : "text-primary hover:bg-primary/10 hover:text-white dark:hover:bg-primary/20"
                      }`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await followUser(user.username);
                        toast({
                          title: "Đã gửi yêu cầu theo dõi",
                          description: `Bạn đã gửi yêu cầu theo dõi đến @${user.username}`,
                        });
                        await fetchSuggestions();
                      } catch (err) {
                        toast({
                          title: "Lỗi",
                          description:
                            "Không thể gửi yêu cầu theo dõi. Vui lòng thử lại!",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Theo dõi
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          {/* <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <a
                href="/about"
                className="hover:underline hover:text-foreground transition-colors hover:font-semibold"
              >
                Giới thiệu
              </a>
              <span>·</span>
              <a
                href="#"
                className="hover:underline hover:text-foreground transition-colors hover:font-semibold"
              >
                Trợ giúp
              </a>
              <span>·</span>
              <a
                href="#"
                className="hover:underline hover:text-foreground transition-colors hover:font-semibold"
              >
                Điều khoản
              </a>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <a
                href="#"
                className="hover:underline hover:text-foreground transition-colors hover:font-semibold"
              >
                Quyền riêng tư
              </a>
              <span>·</span>
              <a
                href="#"
                className="hover:underline hover:text-foreground transition-colors hover:font-semibold"
              >
                Vị trí
              </a>
              <span>·</span>
              <a
                href="#"
                className="hover:underline hover:text-foreground transition-colors hover:font-semibold"
              >
                Ngôn ngữ
              </a>
            </div>
          </div> */}
          <p className="text-xs text-muted-foreground font-medium">
            © 2025 Nexo
          </p>
        </div>
      </div>

      <AllSuggestionsModal
        isOpen={showAllSuggestions}
        onClose={() => setShowAllSuggestions(false)}
        onUserClick={handleUserClick}
        onFollowSuccess={fetchSuggestions}
      />

      <SwitchAccountDialog
        isOpen={isSwitchAccountOpen}
        onClose={() => setIsSwitchAccountOpen(false)}
      />
    </>
  );
};
