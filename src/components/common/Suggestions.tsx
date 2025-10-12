import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppSelector } from "@/store";
import { SwitchAccountDialog } from "@/features/auth";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";

interface SuggestionUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mutualFollowers?: string;
  isFollowing?: boolean;
  posts?: number;
  followers?: number;
  following?: number;
  bio?: string;
  profileImages?: string[];
}

const mockSuggestions: SuggestionUser[] = [
  {
    id: "1",
    username: "_zikiu_",
    displayName: "Hoàng Nhi",
    avatar: "https://picsum.photos/44/44?random=1",
    mutualFollowers: "Có nvaannhi và 3 người khác theo dõi",
    posts: 11,
    followers: 464,
    following: 72,
    bio: "✨ Lifestyle & Fashion",
    profileImages: [
      "https://picsum.photos/200/200?random=11",
      "https://picsum.photos/200/200?random=12",
      "https://picsum.photos/200/200?random=13",
      "https://picsum.photos/200/200?random=14",
      "https://picsum.photos/200/200?random=15",
      "https://picsum.photos/200/200?random=16",
    ],
  },
  {
    id: "2",
    username: "dd_phuongg",
    displayName: "Phương Đoàn",
    avatar: "https://picsum.photos/44/44?random=2",
    mutualFollowers: "Đang theo dõi z.lam2384",
    posts: 23,
    followers: 892,
    following: 156,
    profileImages: [
      "https://picsum.photos/200/200?random=21",
      "https://picsum.photos/200/200?random=22",
      "https://picsum.photos/200/200?random=23",
    ],
  },
  {
    id: "3",
    username: "treasure_inocean",
    displayName: "Quỳnh Nhi",
    avatar: "https://picsum.photos/44/44?random=3",
    mutualFollowers: "Gợi ý cho bạn",
    posts: 45,
    followers: 1234,
    following: 89,
    profileImages: [
      "https://picsum.photos/200/200?random=31",
      "https://picsum.photos/200/200?random=32",
      "https://picsum.photos/200/200?random=33",
    ],
  },
  {
    id: "4",
    username: "att.w.ig",
    displayName: "Anh Tho",
    avatar: "https://picsum.photos/44/44?random=4",
    mutualFollowers: "Gợi ý cho bạn",
    posts: 67,
    followers: 567,
    following: 234,
    profileImages: [
      "https://picsum.photos/200/200?random=41",
      "https://picsum.photos/200/200?random=42",
    ],
  },
  {
    id: "5",
    username: "nn_mai0110",
    displayName: "Ngọc Mai",
    avatar: "https://picsum.photos/44/44?random=5",
    mutualFollowers: "Có nvaannhi và 1 người khác theo dõi",
    posts: 89,
    followers: 345,
    following: 123,
    profileImages: [
      "https://picsum.photos/200/200?random=51",
      "https://picsum.photos/200/200?random=52",
      "https://picsum.photos/200/200?random=53",
    ],
  },
  {
    id: "6",
    username: "att.w.ig",
    displayName: "Anh Tho",
    avatar: "https://picsum.photos/44/44?random=4",
    mutualFollowers: "Gợi ý cho bạn",
    posts: 67,
    followers: 567,
    following: 234,
    profileImages: [
      "https://picsum.photos/200/200?random=41",
      "https://picsum.photos/200/200?random=42",
    ],
  },
  {
    id: "7",
    username: "nn_mai0110",
    displayName: "Ngọc Mai",
    avatar: "https://picsum.photos/44/44?random=5",
    mutualFollowers: "Có nvaannhi và 1 người khác theo dõi",
    posts: 89,
    followers: 345,
    following: 123,
    profileImages: [
      "https://picsum.photos/200/200?random=51",
      "https://picsum.photos/200/200?random=52",
      "https://picsum.photos/200/200?random=53",
    ],
  },
  {
    id: "8",
    username: "att.w.ig",
    displayName: "Anh Tho",
    avatar: "https://picsum.photos/44/44?random=4",
    mutualFollowers: "Gợi ý cho bạn",
    posts: 67,
    followers: 567,
    following: 234,
    profileImages: [
      "https://picsum.photos/200/200?random=41",
      "https://picsum.photos/200/200?random=42",
    ],
  },
  {
    id: "9",
    username: "nn_mai0110",
    displayName: "Ngọc Mai",
    avatar: "https://picsum.photos/44/44?random=5",
    mutualFollowers: "Có nvaannhi và 1 người khác theo dõi",
    posts: 89,
    followers: 345,
    following: 123,
    profileImages: [
      "https://picsum.photos/200/200?random=51",
      "https://picsum.photos/200/200?random=52",
      "https://picsum.photos/200/200?random=53",
    ],
  },
];

interface AllSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserClick: (user: SuggestionUser) => void;
}

const AllSuggestionsModal = ({
  isOpen,
  onClose,
  onUserClick,
}: AllSuggestionsModalProps) => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

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
            <div className="space-y-3">
              {mockSuggestions.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 transition-all duration-300 hover:shadow-glow border border-transparent hover:border-border/30"
                  onMouseEnter={() => setHoveredUser(user.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  onClick={() => {
                    onUserClick(user);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar
                        className={`h-12 w-12 transition-all duration-300 ${
                          hoveredUser === user.id
                            ? "ring-2 ring-gradient-instagram scale-110"
                            : ""
                        }`}
                      >
                        <AvatarImage src={getAvatarUrl(user.avatar)} />
                        <AvatarFallback className="bg-gradient-to-br from-muted to-secondary text-foreground font-semibold">
                          {getAvatarInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      {hoveredUser === user.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-story rounded-full border-2 border-background animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground group-hover:bg-gradient-instagram group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {user.username}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {user.displayName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {user.mutualFollowers}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`font-bold text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                      hoveredUser === user.id
                        ? "bg-gradient-instagram text-white hover:opacity-90 scale-110 shadow-glow"
                        : "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle follow action
                    }}
                  >
                    Theo dõi
                  </Button>
                </div>
              ))}
            </div>
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
  const user = useAppSelector((state) => state.auth.user);

  const displayedSuggestions = mockSuggestions.slice(0, 5);

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
            className="flex items-center gap-3 cursor-pointer flex-1 hover:opacity-80 transition-opacity"
            onClick={() => user?.username && navigate(`/${user.username}`)}
          >
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-gradient-instagram">
                <AvatarImage src={getAvatarUrl(user?.avatar)} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getAvatarInitials(user?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-story rounded-full border-2 border-background"></div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground hover:underline">
                {user?.username || "username"}
              </p>
              <p className="text-muted-foreground text-sm">
                {user?.fullName || "Full Name"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-600 font-bold hover:bg-blue-50 transition-all duration-200 hover:scale-105"
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
            {displayedSuggestions.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 transition-all duration-300 hover:shadow-glow border border-transparent hover:border-border/30"
                onMouseEnter={() => setHoveredUser(user.id)}
                onMouseLeave={() => setHoveredUser(null)}
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      className={`h-11 w-11 transition-all duration-300 ${
                        hoveredUser === user.id
                          ? "ring-2 ring-gradient-instagram scale-110"
                          : ""
                      }`}
                    >
                      <AvatarImage src={getAvatarUrl(user.avatar)} />
                      <AvatarFallback className="bg-gradient-to-br from-muted to-secondary text-foreground font-semibold">
                        {getAvatarInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    {hoveredUser === user.id && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-story rounded-full border-2 border-background animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-foreground group-hover:bg-gradient-instagram group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {user.username}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {user.mutualFollowers}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-bold text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                    hoveredUser === user.id
                      ? "bg-gradient-instagram text-white hover:opacity-90 scale-110 shadow-glow"
                      : "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle follow action
                  }}
                >
                  Theo dõi
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <a
                href="#"
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
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            © 2025 Nexo
          </p>
        </div>
      </div>

      {/* AllSuggestionsModal for "Xem tất cả" functionality */}
      <AllSuggestionsModal
        isOpen={showAllSuggestions}
        onClose={() => setShowAllSuggestions(false)}
        onUserClick={handleUserClick}
      />

      {/* Switch Account Dialog */}
      <SwitchAccountDialog
        isOpen={isSwitchAccountOpen}
        onClose={() => setIsSwitchAccountOpen(false)}
      />
    </>
  );
};
