import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateReelThunk, getReelDetailThunk } from "../reelSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SimpleVideoPreview } from "@/components/common/SimpleVideoPreview";
import { MediaViewer } from "@/features/post/components/MediaViewer";
import { useToast } from "@/hooks/use-toast";

const ReelEditPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { reelId } = useParams();
  const { toast } = useToast();
  const { reels, currentReel, isLoading, error } = useAppSelector(
    (state) => state.reel
  );
  const user = useAppSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    caption: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingReel, setIsLoadingReel] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "video";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reelId) {
      dispatch(getReelDetailThunk({ reelId: parseInt(reelId) }));
    }
  }, [dispatch, reelId]);

  // Update form data when reel data is loaded
  useEffect(() => {
    if (currentReel) {
      setFormData({
        caption: currentReel.caption,
        visibility: currentReel.visibility,
      });
      setMediaUrls([currentReel.mediaUrl]);
      setIsLoadingReel(false);
    }
  }, [currentReel]);

  // Update loading state based on Redux
  useEffect(() => {
    setIsLoadingReel(isLoading);
  }, [isLoading]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    if (videoFiles.length === 0) {
      setErrors((prev) => ({ ...prev, media: "Vui lòng chọn file video" }));
      return;
    }

    // For reel, only allow 1 video - replace existing
    const newVideo = videoFiles[0];
    setMediaFiles([newVideo]);
    setMediaUrls([]); // Clear existing URLs when uploading new video
    setErrors((prev) => ({ ...prev, media: "" }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.caption.trim()) {
      newErrors.caption = "Vui lòng nhập caption";
    }

    // For reel, need either existing video or new video
    if (mediaFiles.length === 0 && mediaUrls.length === 0) {
      newErrors.media = "Vui lòng chọn video";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !reelId) return;

    // Validate reelId
    const reelIdNumber = parseInt(reelId);
    if (isNaN(reelIdNumber)) {
      toast({
        title: "Lỗi",
        description: "ID reel không hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reelData = {
        postId: reelIdNumber, // Use validated reel ID for update
        userId: user?.id || 0,
        caption: formData.caption,
        visibility: formData.visibility,
        mediaUrl: mediaUrls, // Use existing URLs if no new files
      };

      await dispatch(updateReelThunk({ files: mediaFiles, reelData })).unwrap();

      toast({
        variant: "success",
        title: "Thành công",
        description: "Reel đã được cập nhật thành công!",
      });

      navigate(`/reels/${reelId}`);
    } catch (error) {
      console.error("Error updating reel:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật reel. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingReel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-lg font-medium mb-2">Đang tạo reel... Vui lòng chờ</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vui lòng không tắt trang này
          </p>
        </div>
      </div>
    );
  }

  if (!currentReel && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || "Không tìm thấy reel"}</p>
          <Button onClick={() => navigate("/reels")}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Chỉnh sửa Reel</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa Reel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Media */}
              {mediaUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>Video hiện tại</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <div
                          className="w-full h-48 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            setSelectedMedia({ url, type: "video" })
                          }
                        >
                          <SimpleVideoPreview
                            videoUrl={url}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Upload */}
              <div className="space-y-2">
                <Label htmlFor="media">Thay thế video</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/10 dark:bg-primary/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    id="media"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nhấp để chọn video mới hoặc kéo thả vào đây
                    </p>
                  </label>
                </div>
                {errors.media && (
                  <p className="text-sm text-red-500">{errors.media}</p>
                )}

                {/* Selected Files */}
                {mediaFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Video mới đã chọn:</p>
                    {mediaFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-16 h-16 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() =>
                              setSelectedMedia({
                                url: URL.createObjectURL(file),
                                type: "video",
                              })
                            }
                          >
                            <SimpleVideoPreview
                              videoUrl={URL.createObjectURL(file)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedia(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption *</Label>
                <Textarea
                  id="caption"
                  placeholder="Viết caption cho reel của bạn..."
                  value={formData.caption}
                  onChange={(e) => handleInputChange("caption", e.target.value)}
                  className="min-h-[100px]"
                />
                {errors.caption && (
                  <p className="text-sm text-red-500">{errors.caption}</p>
                )}
              </div>

              {/* Tag */}

              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility">Quyền riêng tư</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) =>
                    handleInputChange("visibility", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Công khai</SelectItem>
                    <SelectItem value="PRIVATE">Riêng tư</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật Reel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Media Viewer */}
      {selectedMedia && (
        <MediaViewer
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          media={{
            id: selectedMedia.url,
            type: selectedMedia.type,
            url: selectedMedia.url,
          }}
        />
      )}
    </div>
  );
};

export default ReelEditPage;
