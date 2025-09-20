import { useState } from 'react';
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
  BadgeCheck
} from 'lucide-react';
import { NotesDialog } from './NotesDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserProfile } from '../profileSlice';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  profile: UserProfile;
  isCurrentUser: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onMessage: () => void;
  onEdit: () => void;
  onBlock: () => void;
  onReport: () => void;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  onAvatarClick?: () => void;
}

export const ProfileHeader = ({
  profile,
  isCurrentUser,
  onFollow,
  onUnfollow,
  onMessage,
  onEdit,
  onBlock,
  onReport,
  onShowFollowers,
  onShowFollowing,
  onAvatarClick,
}: ProfileHeaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  const handleWebsiteClick = () => {
    if (profile.website) {
      window.open(profile.website, '_blank');
    }
  };

  const handleNotesClick = () => {
    setIsNotesDialogOpen(true);
  };

  const handlePublishNote = (content: string) => {
    // TODO: Implement note publishing logic
    console.log('Publishing note:', content);
    toast({
      title: "Ghi chú đã được chia sẻ",
      description: "Ghi chú của bạn đã được đăng thành công.",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
      toast({
        title: 'Đã sao chép liên kết',
        description: 'Liên kết hồ sơ đã được sao chép vào clipboard',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép liên kết',
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="px-14 py-6 border-b border-border bg-background">
      <div className="flex items-start gap-16">
        {/* Avatar Container */}
        <div className="relative">
          {/* Avatar Button */}
          <button
            onClick={isCurrentUser ? onAvatarClick : undefined}
            className={isCurrentUser ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}
            disabled={!isCurrentUser}
            title={isCurrentUser ? "Thay đổi ảnh đại diện" : "Ảnh đại diện"}
          >
            <Avatar className="w-20 h-20 md:w-44 md:h-44 ring-2 ring-primary/20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-xl font-semibold">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
          
          {/* Notes Overlay - Separate clickable area */}
          {isCurrentUser && (
            <div className="absolute -bottom-2 -right-2">
              <button
                onClick={handleNotesClick}
                className="bg-black/80 hover:bg-black/90 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105"
              >
                Ghi chú...
              </button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          {/* Username and Actions */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-light">{profile.username}</h1>
              {profile.isVerified && (
                <BadgeCheck className="w-5 h-5 text-primary fill-current" />
              )}
            </div>

            {isCurrentUser ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEdit}
                  className="gap-1 bg-gray-200"
                >
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa trang cá nhân
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/account/settings')}
                  className='bg-gray-200'
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
                    onClick={onUnfollow}
                    className="gap-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    Đang theo dõi
                  </Button>
                ) : (
                  <Button 
                    variant="instagram" 
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
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Sao chép liên kết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onBlock}>
                      <UserX className="w-4 h-4 mr-2" />
                      Chặn
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onReport} className="text-destructive">
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
            <div className="text-center">
              <div className="font-semibold">{profile.postsCount}</div>
              <div className="text-sm text-muted-foreground">bài viết</div>
            </div>
            <button 
              onClick={onShowFollowers}
              className="text-center hover:opacity-70 transition-opacity"
            >
              <div className="font-semibold">{profile.followersCount}</div>
              <div className="text-sm text-muted-foreground">người theo dõi</div>
            </button>
            <button 
              onClick={onShowFollowing}
              className="text-center hover:opacity-70 transition-opacity"
            >
              <div className="font-semibold">{profile.followingCount}</div>
              <div className="text-sm text-muted-foreground">đang theo dõi</div>
            </button>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <div className="font-semibold">{profile.name}</div>
            {profile.bio && (
              <div className="text-sm whitespace-pre-line">{profile.bio}</div>
            )}
            {profile.website && (
              <button
                onClick={handleWebsiteClick}
                className="text-sm text-primary hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes Dialog - Only render when open */}
      {isNotesDialogOpen && (
        <NotesDialog
          isOpen={isNotesDialogOpen}
          onClose={() => setIsNotesDialogOpen(false)}
          onPublish={handlePublishNote}
          userAvatar={profile.avatar}
          userName={profile.name}
        />
      )}
    </div>
  );
};