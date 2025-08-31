import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Plus, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  isFollowingYou?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline';
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  className?: string;
}

export const FollowButton = ({
  userId,
  isFollowing,
  isFollowingYou,
  size = 'default',
  variant = 'default',
  onFollow,
  onUnfollow,
  className,
}: FollowButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        await onUnfollow?.(userId);
        toast({
          description: 'Đã bỏ theo dõi',
        });
      } else {
        await onFollow?.(userId);
        toast({
          description: 'Đã theo dõi',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Có lỗi xảy ra. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="hidden sm:inline">Đang xử lý...</span>
        </>
      );
    }

    if (isFollowing) {
      if (isHovered) {
        return (
          <>
            <UserMinus className="w-4 h-4" />
            <span className="hidden sm:inline">Bỏ theo dõi</span>
          </>
        );
      }
      return (
        <>
          <Check className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isFollowingYou ? 'Bạn bè' : 'Đang theo dõi'}
          </span>
        </>
      );
    }

    return (
      <>
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">
          {isFollowingYou ? 'Theo dõi lại' : 'Theo dõi'}
        </span>
      </>
    );
  };

  const getButtonVariant = () => {
    if (isFollowing) {
      return isHovered ? 'destructive' : 'outline';
    }
    return variant === 'outline' ? 'outline' : 'instagram';
  };

  return (
    <Button
      size={size}
      variant={getButtonVariant()}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={cn(
        'transition-all duration-200 min-w-[100px] sm:min-w-[120px]',
        isFollowing && 'hover:border-destructive hover:text-destructive',
        className
      )}
    >
      {getButtonContent()}
    </Button>
  );
};