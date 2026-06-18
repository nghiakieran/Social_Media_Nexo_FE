import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  MicOff,
  Image,
  Camera,
  ShieldBan,
  X,
  Square,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MessageDTO } from "../types";
import { api } from "@/lib/axios";

interface MessageComposerProps {
  onSendMessage: (
    content: string,
    type: "text" | "image" | "file" | "voice",
    mediaUrls?: string[]
  ) => void;
  onTyping: (isTyping: boolean) => void;
  onUnblock?: () => void;
  className?: string;
  placeholder?: string;
  isBlockedByMe?: boolean;
  isBlockedByThem?: boolean;
  fullname?: string;
  replyingTo?: MessageDTO | null;
  onCancelReply?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onTyping,
  onUnblock,
  className,
  placeholder = "Tin nhắn...",
  isBlockedByMe = false,
  isBlockedByThem = false,
  fullname = "người dùng này",
  replyingTo,
  onCancelReply,
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup image preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  const emojis = [
    "😀",
    "😂",
    "❤️",
    "👍",
    "👎",
    "😍",
    "😘",
    "😭",
    "😊",
    "🔥",
    "💯",
    "🎉",
  ];

  const handleSend = async () => {
    if (message.trim() || selectedFiles.length > 0) {
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        try {
          const formData = new FormData();
          selectedFiles.forEach((file) => {
            formData.append("files", file);
          });

          const uploadResponse = await api.post("/files/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload progress: ${percentCompleted}%`);
            },
          });

          const mediaUrls = uploadResponse.data.data;
          const urls = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];

          onSendMessage(message.trim(), "image", urls);
        } catch (error) {
          console.error("Upload failed:", error);
          onSendMessage(message.trim(), "image");
        } finally {
          setIsUploading(false);
        }
      } else {
        onSendMessage(message.trim(), "text");
      }

      imagePreviews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
      setImagePreviews([]);
      setSelectedFiles([]);
      setMessage("");
      onTyping(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }

    const isTyping = value.length > 0;
    if (onTyping) {
      onTyping(isTyping);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileUpload = (type: "image" | "file") => {
    onSendMessage(`Uploaded ${type}`, type);
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if maximum limit reached
      if (selectedFiles.length >= 6) {
        return; // Don't add more files
      }

      // Check if file is already selected (prevent duplicates)
      const isDuplicate = selectedFiles.some(
        (selectedFile) =>
          selectedFile.name === file.name &&
          selectedFile.size === file.size &&
          selectedFile.lastModified === file.lastModified
      );

      if (!isDuplicate) {
        setSelectedFiles((prev) => [...prev, file]);
        const previewUrl = URL.createObjectURL(file);
        setImagePreviews((prev) => [...prev, previewUrl]);
      }
    }
    e.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    const previewUrl = imagePreviews[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size === 0) return;

        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("files", audioBlob, `voice_${Date.now()}.webm`);
          const uploadRes = await api.post("/files/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 30000,
          });
          const mediaUrls = uploadRes.data.data;
          const urls = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];
          onSendMessage("", "voice", urls);
        } catch {
          // silently fail
        } finally {
          setIsUploading(false);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(
        () => setRecordingSeconds((s) => s + 1),
        1000
      );
    } catch {
      // microphone permission denied
    }
  }, [onSendMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Nếu mình block người ta
  if (isBlockedByMe) {
    return (
      <div
        className={cn("p-4 border-t border-border bg-background", className)}
      >
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldBan className="h-5 w-5" />
            <p className="text-sm">Bạn đã chặn {fullname}</p>
          </div>
          <Button
            onClick={onUnblock}
            variant="outline"
            size="sm"
            className="w-full max-w-xs"
          >
            Bỏ chặn để nhắn tin
          </Button>
        </div>
      </div>
    );
  }

  // Nếu người ta block mình (status = BLOCKED và blockedByMe = false)
  if (isBlockedByThem) {
    return (
      <div
        className={cn("p-4 border-t border-border bg-background", className)}
      >
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <ShieldBan className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Bạn không thể gửi tin nhắn cho {fullname}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border-t border-border bg-background", className)}>
      {replyingTo && (
        <div className="px-4 py-2 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="text-sm text-muted-foreground">Trả lời</div>
              <div className="text-sm font-medium truncate">
                {replyingTo.sender.fullName}
              </div>
              <div className="text-sm text-muted-foreground truncate flex-1">
                {replyingTo.content}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onCancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-start gap-3">
            {/* Clickable placeholder to add more images - only show if under limit */}
            {selectedFiles.length < 6 && (
              <div
                className="relative shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={handleImageSelect}
              >
                <Image className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            {/* Render multiple image previews */}
            <div className="flex gap-2 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative shrink-0">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSelectedFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              {/* File name removed as requested */}
            </div>
          </div>
        </div>
      )}
      <div className="p-2 md:p-4">
        <div className="flex items-end space-x-1 md:space-x-2">
          {}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 md:h-10 md:w-10"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              <div className="grid grid-cols-6 gap-1">
                {emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {}
          <div className="flex-1 relative">
            {isRecording ? (
              <div className="flex items-center gap-2 min-h-[36px] md:min-h-[40px] px-3 py-2 rounded-md border bg-muted/30">
                <span className="inline-block h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm text-muted-foreground">Đang ghi âm...</span>
              </div>
            ) : (
              <>
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="min-h-[36px] md:min-h-[40px] max-h-[120px] resize-none pr-10 md:pr-12 py-2 text-sm md:text-base"
                  rows={1}
                />
                {}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={handleImageSelect}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Ảnh
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleFileUpload("image")}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Camera
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleFileUpload("file")}
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Tệp tin
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>

          {isRecording ? (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs font-mono text-destructive w-10 text-center">
                {formatRecordingTime(recordingSeconds)}
              </span>
              <Button
                onClick={cancelRecording}
                size="icon"
                variant="ghost"
                className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground"
                title="Hủy"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={stopRecording}
                size="icon"
                variant="destructive"
                className="h-8 w-8 md:h-10 md:w-10 animate-pulse"
                title="Dừng và gửi"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          ) : message.trim() || selectedFiles.length > 0 ? (
            <Button
              onClick={handleSend}
              disabled={isUploading}
              size="icon"
              className="shrink-0 h-8 w-8 md:h-10 md:w-10 bg-primary hover:bg-primary/90"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              size="icon"
              variant="ghost"
              className="shrink-0 h-8 w-8 md:h-10 md:w-10"
              title="Ghi âm"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        title="Chọn ảnh"
        aria-label="Chọn ảnh"
      />
    </div>
  );
};
