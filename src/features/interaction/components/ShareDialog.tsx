import { useState } from "react";
import {
  Share,
  Copy,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postUrl: string;
  onShare: (type: "feed" | "story" | "message" | "link") => void;
}

export const ShareDialog = ({
  isOpen,
  onClose,
  postId,
  postUrl,
  onShare,
}: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: "Đã sao chép!",
        description: "Link bài viết đã được sao chép vào clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể sao chép link. Vui lòng thử lại.",
      });
    }
  };

  const handleShare = (type: "feed" | "story" | "message" | "link") => {
    onShare(type);

    const messages = {
      feed: "Đã chia sẻ lên feed!",
      story: "Đã chia sẻ lên story!",
      message: "Đã gửi tin nhắn!",
      link: "Đã sao chép link!",
    };

    toast({
      title: messages[type],
      duration: 2000,
    });

    onClose();
  };

  const shareOptions = [
    {
      id: "feed",
      label: "Chia sẻ lên Feed",
      description: "Đăng lại bài viết này lên trang cá nhân",
      icon: Instagram,
      color: "text-primary",
    },
    {
      id: "story",
      label: "Chia sẻ lên Story",
      description: "Thêm vào story của bạn",
      icon: MessageCircle,
      color: "text-purple-500",
    },
    {
      id: "message",
      label: "Gửi tin nhắn",
      description: "Chia sẻ qua tin nhắn riêng tư",
      icon: MessageCircle,
      color: "text-blue-500",
    },
  ];

  const externalPlatforms = [
    {
      id: "facebook",
      label: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`,
    },
    {
      id: "twitter",
      label: "Twitter",
      icon: Twitter,
      color: "text-sky-500",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        postUrl
      )}`,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Chia sẻ bài viết
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Internal Sharing Options */}
          <div>
            <h4 className="font-medium text-sm mb-3">Chia sẻ trên ứng dụng</h4>
            <div className="space-y-2">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => handleShare(option.id as any)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className={`p-2 rounded-full bg-muted ${option.color}`}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <h4 className="font-medium text-sm mb-3">Sao chép link</h4>
            <div className="flex gap-2">
              <Input value={postUrl} readOnly className="flex-1 text-sm" />
              <Button
                onClick={handleCopyLink}
                variant={copied ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Đã sao chép" : "Sao chép"}
              </Button>
            </div>
          </div>

          {/* External Platforms */}
          <div>
            <h4 className="font-medium text-sm mb-3">Chia sẻ ngoài ứng dụng</h4>
            <div className="flex gap-2">
              {externalPlatforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    window.open(platform.url, "_blank", "width=600,height=400");
                    handleShare("link");
                  }}
                >
                  <platform.icon className={`w-4 h-4 ${platform.color}`} />
                  {platform.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
