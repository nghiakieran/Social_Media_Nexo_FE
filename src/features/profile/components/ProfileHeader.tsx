import { useState } from "react";
import {
  Settings,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  MessageCircle,
  UserCheck,
  Shield,
  Flag,
  UserX,
  Edit3,
  Link as LinkIcon,
  ChevronDown,
  Archive,
} from "lucide-react";
import { NotesDialog } from "./NotesDialog";
import { FollowingOptionsDialog } from "./FollowingOptionsDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarInitials } from "@/utils/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfile } from "../profileSlice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  profile: UserProfile;
  isCurrentUser: boolean;
  followersCount?: number;
  followingCount?: number;
  onFollow: () => void;
  onUnfollow: () => void;
  onMessage: () => void;
  onEdit: () => void;
  onBlock: () => void;
  onReport: () => void;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  onAvatarClick?: () => void;
  onAddToCloseFriends?: () => void;
  onRemoveFromCloseFriends?: () => void;
  onAddToFavorites?: () => void;
  onRestrict?: () => void;
  onStoryClick?: () => void;
  hasStory?: boolean;
  isStoryViewed?: boolean;
}

export const ProfileHeader = ({
  profile,
  isCurrentUser,
  followersCount,
  followingCount,
  onFollow,
  onUnfollow,
  onMessage,
  onEdit,
  onBlock,
  onReport,
  onShowFollowers,
  onShowFollowing,
  onAvatarClick,
  onAddToCloseFriends,
  onRemoveFromCloseFriends,
  onAddToFavorites,
  onRestrict,
  onStoryClick,
  hasStory = false,
  isStoryViewed = false,
}: ProfileHeaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isFollowingOptionsOpen, setIsFollowingOptionsOpen] = useState(false);

  const handleNotesClick = () => {
    setIsNotesDialogOpen(true);
  };

  const handlePublishNote = (content: string) => {
    // TODO: Implement note publishing logic
    console.log("Publishing note:", content);
    toast({
      title: "Ghi chú đã được chia sẻ",
      description: "Ghi chú của bạn đã được đăng thành công.",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${profile.username}`
      );
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết hồ sơ đã được sao chép vào clipboard",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép liên kết",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 md:px-14 py-6 border-b border-border bg-background">
      <div className="md:hidden flex flex-col w-full">
        {/* Row 1: Avatar on Left, Stats on Right */}
        <div className="flex items-center gap-6 mb-4">
          {/* Avatar Container */}
          <div className="flex-shrink-0 relative">
            <button
              onClick={() => {
                if (hasStory && onStoryClick) {
                  onStoryClick();
                } else if (isCurrentUser && onAvatarClick) {
                  onAvatarClick();
                }
              }}
              className={
                hasStory || isCurrentUser
                  ? "cursor-pointer hover:opacity-80 transition-opacity"
                  : "cursor-default"
              }
              disabled={!hasStory && !isCurrentUser}
            >
              {hasStory ? (
                <div className="relative">
                  <div
                    className={`rounded-full p-[2px] w-[72px] h-[72px] ${isStoryViewed ? "bg-gray-400" : "bg-gradient-story"
                      }`}
                  >
                    <div className="w-full h-full rounded-full bg-background p-[1.5px]">
                      <Avatar className="w-full h-full">
                        <AvatarImage
                          src={getAvatarUrl(profile.avatar)}
                          alt={profile.username}
                        />
                        <AvatarFallback className="text-lg font-semibold">
                          {getAvatarInitials(profile.name || profile.username)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              ) : (
                <Avatar className="w-[72px] h-[72px] ring-2 ring-primary/20">
                  <AvatarImage
                    src={getAvatarUrl(profile.avatar)}
                    alt={profile.username}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {getAvatarInitials(profile.name || profile.username)}
                  </AvatarFallback>
                </Avatar>
              )}
            </button>
          </div>

          {/* Stats on the Right */}
          <div className="flex-1 flex items-center justify-around">
            <div className="text-center">
              <div className="font-semibold text-base">{profile.postsCount}</div>
              <div className="text-xs text-muted-foreground">bài viết</div>
            </div>
            <button
              onClick={onShowFollowers}
              className={`text-center transition-opacity ${!isCurrentUser && profile.isPrivate && !profile.isFollowing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-70"
                }`}
              disabled={
                !isCurrentUser && profile.isPrivate && !profile.isFollowing
              }
            >
              <div className="font-semibold text-base">
                {followersCount !== undefined ? followersCount : profile.followersCount}
              </div>
              <div className="text-xs text-muted-foreground">người theo dõi</div>
            </button>
            <button
              onClick={onShowFollowing}
              className={`text-center transition-opacity ${!isCurrentUser && profile.isPrivate && !profile.isFollowing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-70"
                }`}
              disabled={
                !isCurrentUser && profile.isPrivate && !profile.isFollowing
              }
            >
              <div className="font-semibold text-base">
                {followingCount !== undefined ? followingCount : profile.followingCount}
              </div>
              <div className="text-xs text-muted-foreground">đang theo dõi</div>
            </button>
          </div>
        </div>

        {/* Row 2: Username & Bio */}
        <div className="space-y-0.5 mb-4 text-left w-full">
          <h2 className="font-bold text-base text-foreground leading-tight">{profile.username}</h2>
          <div className="font-semibold text-xs text-foreground/80">{profile.name}</div>
          {profile.bio && (
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed mt-1">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Row 3: Action Buttons */}
        <div className="flex items-center gap-2 w-full">
          {isCurrentUser ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex-1 border-border bg-muted text-xs transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary dark:bg-muted/60 h-9 font-medium"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/archive/stories")}
                className="border-border bg-muted transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary dark:bg-muted/60 h-9 w-9 p-0 flex items-center justify-center shrink-0"
                title="Xem kho lưu trữ"
              >
                <Archive className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/account/settings")}
                className="border-border bg-muted transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary dark:bg-muted/60 h-9 w-9 p-0 flex items-center justify-center shrink-0"
                title="Cài đặt"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              {profile.isFollowing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFollowingOptionsOpen(true)}
                  className="flex-1 text-xs h-9 font-medium"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Đang theo dõi
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              ) : profile.hasRequestedFollow ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUnfollow}
                  className="flex-1 text-xs h-9 font-medium"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Hủy yêu cầu
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onFollow}
                  className="flex-1 text-xs h-9 font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Theo dõi
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={onMessage}
                className="flex-1 text-xs h-9 font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                Nhắn tin
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0 flex items-center justify-center shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover">
                  <DropdownMenuItem
                    onClick={handleCopyLink}
                    className="focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-primary dark:focus:text-primary-foreground cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Sao chép liên kết
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onBlock}
                    className="focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-primary dark:focus:text-primary-foreground cursor-pointer"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Chặn
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onReport}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Báo cáo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Desktop Layout (Hidden on Mobile) */}
      <div className="hidden md:flex flex-row items-start gap-16">
        {/* Avatar Container */}
        <div className="relative">
          <button
            onClick={() => {
              if (hasStory && onStoryClick) {
                onStoryClick();
              } else if (isCurrentUser && onAvatarClick) {
                onAvatarClick();
              }
            }}
            className={
              hasStory || isCurrentUser
                ? "cursor-pointer hover:opacity-80 transition-opacity"
                : "cursor-default"
            }
            disabled={!hasStory && !isCurrentUser}
          >
            {hasStory ? (
              <div className="relative">
                <div
                  className={`rounded-full p-[3px] w-44 h-44 ${isStoryViewed ? "bg-gray-400" : "bg-gradient-story"
                    }`}
                >
                  <div className="w-full h-full rounded-full bg-background p-[2.5px]">
                    <Avatar className="w-full h-full">
                      <AvatarImage
                        src={getAvatarUrl(profile.avatar)}
                        alt={profile.username}
                      />
                      <AvatarFallback className="text-xl font-semibold">
                        {getAvatarInitials(profile.name || profile.username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            ) : (
              <Avatar className="w-44 h-44 ring-2 ring-primary/20">
                <AvatarImage
                  src={getAvatarUrl(profile.avatar)}
                  alt={profile.username}
                />
                <AvatarFallback className="text-xl font-semibold">
                  {getAvatarInitials(profile.name || profile.username)}
                </AvatarFallback>
              </Avatar>
            )}
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          {/* Username and Actions */}
          <div className="flex flex-row items-center gap-3 mb-3">
            <h1 className="text-2xl font-light">{profile.username}</h1>

            {isCurrentUser ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="gap-1 border-border bg-muted text-sm transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary dark:bg-muted/60"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa trang cá nhân</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/archive/stories")}
                  className="border-border bg-muted transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary dark:bg-muted/60"
                  title="Xem kho lưu trữ"
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/account/settings")}
                  className="border-border bg-muted transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary dark:bg-muted/60"
                  title="Cài đặt"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {profile.isFollowing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFollowingOptionsOpen(true)}
                    className="gap-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    Đang theo dõi
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                ) : profile.hasRequestedFollow ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUnfollow}
                    className="gap-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    Hủy yêu cầu
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onFollow}
                    className="gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    Theo dõi
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMessage}
                  className="gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Nhắn tin
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover">
                    <DropdownMenuItem
                      onClick={handleCopyLink}
                      className="focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-primary dark:focus:text-primary-foreground cursor-pointer"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Sao chép liên kết
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onBlock}
                      className="focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-primary dark:focus:text-primary-foreground cursor-pointer"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Chặn
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onReport}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Báo cáo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-3">
            <div className="text-center md:text-left flex gap-1">
              <span className="font-semibold">{profile.postsCount}</span>
              <span className="text-muted-foreground">bài viết</span>
            </div>
            <button
              onClick={onShowFollowers}
              className={`flex gap-1 transition-opacity ${!isCurrentUser && profile.isPrivate && !profile.isFollowing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-70"
                }`}
              disabled={
                !isCurrentUser && profile.isPrivate && !profile.isFollowing
              }
            >
              <span className="font-semibold">
                {followersCount !== undefined ? followersCount : profile.followersCount}
              </span>
              <span className="text-muted-foreground">người theo dõi</span>
            </button>
            <button
              onClick={onShowFollowing}
              className={`flex gap-1 transition-opacity ${!isCurrentUser && profile.isPrivate && !profile.isFollowing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-70"
                }`}
              disabled={
                !isCurrentUser && profile.isPrivate && !profile.isFollowing
              }
            >
              <span className="font-semibold">
                {followingCount !== undefined ? followingCount : profile.followingCount}
              </span>
              <span className="text-muted-foreground">đang theo dõi</span>
            </button>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <div className="font-semibold">{profile.name}</div>
            {profile.bio && (
              <div className="text-sm whitespace-pre-line">{profile.bio}</div>
            )}
          </div>
        </div>
      </div>

      {/* Following Options Dialog */}
      {!isCurrentUser && (
        <FollowingOptionsDialog
          isOpen={isFollowingOptionsOpen}
          onClose={() => setIsFollowingOptionsOpen(false)}
          profile={profile}
          onUnfollow={onUnfollow}
          onAddToCloseFriends={onAddToCloseFriends || (() => { })}
          onRemoveFromCloseFriends={onRemoveFromCloseFriends || (() => { })}
          onAddToFavorites={onAddToFavorites || (() => { })}
          onRestrict={onRestrict || (() => { })}
          onBlockUser={onBlock}
        />
      )}
    </div>
  );
};
