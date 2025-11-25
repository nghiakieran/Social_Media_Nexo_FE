import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  Image,
  Camera,
  ShieldBan,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MessageDTO } from "../types";

interface MessageComposerProps {
  onSendMessage: (
    content: string,
    type: "text" | "image" | "file" | "voice"
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

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

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), "text");
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        onSendMessage("Voice message", "voice");
      }, 2000);
    }
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
      <div className="p-2 md:p-4">
        <div className="flex items-end space-x-1 md:space-x-2">
          {}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 md:h-10 md:w-10">
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
                    onClick={() => handleFileUpload("image")}
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
          </div>

          {}
          {message.trim() ? (
            <Button
              onClick={handleSend}
              size="icon"
              className="shrink-0 h-8 w-8 md:h-10 md:w-10 bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={toggleRecording}
              size="icon"
              variant={isRecording ? "destructive" : "ghost"}
              className={cn("shrink-0 h-8 w-8 md:h-10 md:w-10", isRecording && "animate-pulse")}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
