import { useState, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { ActionMenuDialog } from "./ActionMenuDialog";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle,
  MoreVertical,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Reel } from "../types";
import { openCommentsDrawer, deleteReelThunk } from "../reelSlice";
import { LikeButton } from "@/features/interaction/components/LikeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActionMenu } from "@/components/common/ActionMenu";
import { formatNumber } from "@/utils/constants";
import { HLSVideoPlayer } from "@/components/common/HLSVideoPlayer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReportPostDialog } from "@/features/post/components/ReportPostDialog";
import { reportReel } from "../api/reelApi";

interface ReelViewerProps {
  reel: Reel;
  isActive: boolean;
  onShare?: (reelId: string) => void;
  isDetail?: boolean;
  showEditButton?: boolean;
  onEdit?: (reelId: string) => void;
  onDelete?: (reelId: string) => void;
}

const ReelViewer = memo(
  ({
    reel,
    isActive,
    onShare,
    isDetail = false,
    showEditButton = false,
    onEdit,
    onDelete,
  }: ReelViewerProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [isMuted, setIsMuted] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState<
      "portrait" | "landscape"
    >("landscape"); // Default to landscape for safety
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [isLiked, setIsLiked] = useState(reel.isLiked);
    const [likesCount, setLikesCount] = useState(reel.likesCount);
    const [showReportDialog, setShowReportDialog] = useState(false);

    // Sync state when reel prop changes
    useEffect(() => {
      setIsLiked(reel.isLiked);
      setLikesCount(reel.likesCount);
    }, [reel.isLiked, reel.likesCount]);

    const handleLikeChange = (newIsLiked: boolean, newCount: number) => {
      setIsLiked(newIsLiked);
      setLikesCount(newCount);
    };

    const handleToggleComments = () => {
      dispatch(openCommentsDrawer(reel.id));
    };



    const handleMoreClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMore(!showMore);
    };

    const handleActionDialogAction = async (action: string) => {
      if (action === "delete") {
        try {
          onDelete?.(reel.id);
          await dispatch(deleteReelThunk(parseInt(reel.id))).unwrap();

          toast({
            variant: "success",
            title: "Thành công",
            description: "Reel đã được xóa thành công!",
          });

          navigate("/reels");
        } catch (error) {
          console.error("Error deleting reel:", error);
          toast({
            title: "Lỗi",
            description: "Có lỗi xảy ra khi xóa reel. Vui lòng thử lại.",
            variant: "destructive",
          });
        }
      } else if (action === "edit") {
        onEdit?.(reel.id);
      }
    };

    const handleReportSubmit = async (
      reelId: string,
      reason: string,
      details?: string
    ) => {
      try {
        await reportReel(reelId, reason, details);

        setShowReportDialog(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể gửi báo cáo. Vui lòng thử lại sau.",
        });
      }
    };

    const MAX_CAPTION_LENGTH = 80;
    const shouldTruncate = reel.caption.length > MAX_CAPTION_LENGTH;
    const truncatedCaption = shouldTruncate
      ? reel.caption.slice(0, MAX_CAPTION_LENGTH) + "..."
      : reel.caption;

    // Detect video aspect ratio
    useEffect(() => {
      const video = document.createElement("video");
      video.src = reel.mediaUrl;
      video.crossOrigin = "anonymous";
      video.onloadedmetadata = () => {
        const aspectRatio = video.videoWidth / video.videoHeight;
        const orientation = aspectRatio > 1 ? "landscape" : "portrait";
        setVideoAspectRatio(orientation);
      };
      video.onerror = () => {
        setVideoAspectRatio("portrait");
      };
    }, [reel.mediaUrl]);

    // Determine object-fit based on video orientation and page type
    const getObjectFit = () => {
      // Portrait videos use cover, landscape videos use contain
      return videoAspectRatio === "portrait"
        ? "object-cover"
        : "object-contain";
    };

    return (
      <div
        className="relative w-full transform-gpu"
        style={{
          height: isDetail ? "100%" : "100dvh",
          contain: "layout style paint",
        }}
      >
        {/* Video Player */}
        <div
          className={`absolute inset-0 transform-gpu ${
            !isDetail ? "py-2" : ""
          }`}
        >
          <HLSVideoPlayer
            src={reel.mediaUrl}
            autoPlay={isActive}
            loop
            muted={isMuted}
            playsInline
            hideControlsOnMobile={isMobile && isDetail}
            controls={!(isMobile && isDetail)}
            isReelsMode={!isDetail}
            className={`w-full h-full ${getObjectFit()}`}
            style={{
              objectFit: getObjectFit().replace("object-", "") as
                | "cover"
                | "contain",
            }}
          />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
          <div className="text-right">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div
          className={`absolute right-2 ${
            isMobile
              ? isDetail
                ? "bottom-36"
                : "bottom-[152px]"
              : "bottom-[152px]"
          } lg:bottom-20 flex flex-col gap-5 z-20`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <div
            className="flex flex-col items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <LikeButton
              targetId={parseInt(reel.id)}
              targetType="reel"
              isLiked={isLiked}
              likesCount={likesCount}
              size="md"
              showCount={false}
              onLikeChange={handleLikeChange}
              className={`h-14 w-14 p-0 bg-transparent hover:bg-transparent active:scale-90 transition-transform flex flex-col items-center gap-0.5 [&_svg]:w-7 [&_svg]:h-7 [&_svg]:drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${
                isLiked ? "text-red-500 hover:text-red-600" : "text-white hover:text-white"
              }`}
            >
              {likesCount > 0 && (
                <span className="text-white text-[11px] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {formatNumber(likesCount)}
                </span>
              )}
            </LikeButton>
          </div>

          {/* Comment */}
          <button
            onClick={handleToggleComments}
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
          >
            <MessageCircle className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            {reel.commentsCount > 0 && (
              <span className="text-white text-[11px] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {formatNumber(reel.commentsCount)}
              </span>
            )}
          </button>



          {/* More */}
          <button
            onClick={handleMoreClick}
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
          >
            <MoreVertical className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          </button>
        </div>

        {/* Bottom Info - Hide on detail pages for desktop, show on mobile */}
        {(!isDetail || isMobile) && (
          <div
            className={`absolute left-0 right-16 lg:right-auto lg:max-w-md transition-all duration-300 ${
              showFullCaption
                ? `${
                    isMobile
                      ? isDetail
                        ? "bottom-32"
                        : "bottom-32"
                      : "bottom-30"
                  } lg:bottom-16 max-h-[60vh] bg-black/95 rounded-tr-lg`
                : `${
                    isMobile
                      ? isDetail
                        ? "bottom-32"
                        : "bottom-32"
                      : "bottom-32"
                  } lg:bottom-16`
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`p-4 pb-4 lg:pb-6 ${
                showFullCaption
                  ? "overflow-y-auto max-h-[60vh] scrollbar-thin"
                  : ""
              }`}
            >
              {/* User Info */}
              <a
                href={`/${reel.userName}`}
                className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={reel.avatarUrl} alt={reel.userName} />
                  <AvatarFallback>
                    {reel.userName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-sm">
                  {reel.userName}
                </span>
              </a>

              {/* Caption */}
              {reel.caption && (
                <div className="mb-2">
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap min-w-80 lg:w-[390px]">
                    {showFullCaption ? reel.caption : truncatedCaption}
                    {shouldTruncate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullCaption(!showFullCaption);
                        }}
                        className="text-gray-300 ml-2 font-medium hover:text-white transition-colors"
                      >
                        {showFullCaption ? "thu gọn" : "xem thêm"}
                      </button>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Menu */}
        <ActionMenu
          isOpen={showMore}
          onClose={() => setShowMore(false)}
          items={[
            ...(showEditButton
              ? [
                  {
                    label: "Chỉnh sửa",
                    action: () => {
                      onEdit?.(reel.id);
                      setShowMore(false);
                    },
                  },
                  {
                    label: "Xóa",
                    action: () => {
                      setShowActionDialog(true);
                      setShowMore(false);
                    },
                    isDestructive: true,
                  },
                ]
              : []),
            ...(!isDetail
              ? [
                  {
                    label: "Đi đến bài viết",
                    action: () => {
                      navigate(`/reels/${reel.id}`);
                    },
                  },
                ]
              : []),
            {
              label: "Báo cáo",
              action: () => {
                setShowReportDialog(true);
                setShowMore(false);
              },
              isDestructive: true,
            },
            {
              label: "Sao chép liên kết",
              action: () => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/reels/${reel.id}`
                )
                  .then(() => {
                    toast({
                      variant: "success",
                      title: "Đã sao chép liên kết",
                      description: "Liên kết thước phim đã được sao chép vào bộ nhớ tạm.",
                    });
                  })
                  .catch(() => {
                    toast({
                      variant: "destructive",
                      title: "Lỗi",
                      description: "Không thể sao chép liên kết.",
                    });
                  });
                setShowMore(false);
              },
            },
          ]}
        />

        {/* Action Menu Dialog */}
        <ActionMenuDialog
          isOpen={showActionDialog}
          onClose={() => setShowActionDialog(false)}
          onAction={handleActionDialogAction}
          isOwnReel={showEditButton}
          isReelHidden={!reel.isActive}
        />

        {showReportDialog && (
          <ReportPostDialog
            isOpen={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            postId={reel.id}
            onReport={handleReportSubmit}
          />
        )}
      </div>
    );
  }
);

ReelViewer.displayName = "ReelViewer";

export default ReelViewer;
