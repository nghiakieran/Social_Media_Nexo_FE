import { useState } from "react";
import { Heart, UserPlus, Shield, Eye, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile } from "../types";
import { useToast } from "@/hooks/use-toast";

interface FollowingOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUnfollow: () => void;
  onAddToCloseFriends: () => void;
  onRemoveFromCloseFriends: () => void;
  onAddToFavorites: () => void;
  onRestrict: () => void;
  onBlockUser: () => void;
}

export const FollowingOptionsDialog = ({
  isOpen,
  onClose,
  profile,
  onUnfollow,
  onAddToCloseFriends,
  onRemoveFromCloseFriends,
  onAddToFavorites,
  onRestrict,
  onBlockUser,
}: FollowingOptionsDialogProps) => {
  const { toast } = useToast();
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleToggleCloseFriends = () => {
    onAddToCloseFriends();
    const isNowCloseFriend = !profile.isCloseFriend;
    toast({
      title: isNowCloseFriend
        ? "Đã thêm vào danh sách bạn thân"
        : "Đã xóa khỏi danh sách bạn thân",
      description: `${profile.name} ${
        isNowCloseFriend ? "đã được thêm vào" : "đã được xóa khỏi"
      } danh sách bạn thân`,
    });
    onClose();
  };

  const handleAddToCloseFriends = handleToggleCloseFriends;
  const handleRemoveFromCloseFriends = handleToggleCloseFriends;


  const handleBlockUser = () => {
    onBlockUser();
    onClose();
  };

  const handleUnfollow = () => {
    onUnfollow();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90vw] max-w-[560px] mx-auto bg-background p-0 overflow-hidden">
          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-col justify-center items-center gap-1">
              <Avatar className="w-14 h-14">
                <AvatarImage src={profile.avatar} alt={profile.username} />
                <AvatarFallback className="text-lg font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-base">
                  {profile.username}
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="py-">
            {/* Thêm vào danh sách bạn thân / Xóa khỏi danh sách bạn thân */}
            {profile.isCloseFriend ? (
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-4 text-left hover:bg-muted hover:text-inherit"
                onClick={handleRemoveFromCloseFriends}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-normal">
                    Xóa khỏi danh sách bạn thân
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-4 text-left hover:bg-muted hover:text-inherit"
                onClick={handleAddToCloseFriends}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-normal">
                    Thêm vào danh sách bạn thân
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}

            {/* Cấm đăng */}
            <Button
              variant="ghost"
              className="w-full justify-between px-4 py-4 text-left hover:bg-muted hover:text-inherit"
              onClick={handleBlockUser}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="font-normal">Chặn</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>

            {/* Bỏ theo dõi */}
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-4 text-left hover:bg-muted text-red-600 hover:text-red-700"
              onClick={() => setShowUnfollowConfirm(true)}
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5" />
                <span className="font-normal">Bỏ theo dõi</span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unfollow Confirmation Dialog */}
      <AlertDialog
        open={showUnfollowConfirm}
        onOpenChange={setShowUnfollowConfirm}
      >
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar} alt={profile.username} />
                <AvatarFallback className="text-2xl font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <AlertDialogTitle className="text-lg font-semibold mb-2">
                  Bỏ theo dõi @{profile.username}?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Họ sẽ không còn thấy bài đăng của bạn trong bảng tin và bạn sẽ
                  không thấy bài đăng của họ.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2">
            <AlertDialogAction
              onClick={() => {
                handleUnfollow();
                setShowUnfollowConfirm(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Bỏ theo dõi
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => setShowUnfollowConfirm(false)}
              className="w-full"
            >
              Hủy
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
