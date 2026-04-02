import { useState, useRef, useEffect } from "react";
import { Send, Smile, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { searchUsers } from "@/features/explore/api/exploreApi";
import type { SearchUserData } from "@/features/explore/types";

const commonEmojis = [
  "😀",
  "😂",
  "🥰",
  "😍",
  "🤔",
  "😮",
  "😢",
  "😡",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "💯",
  "🎉",
  "👏",
  "🙌",
  "😎",
  "🤝",
  "💪",
  "🚀",
  "⭐",
  "✨",
  "🎯",
  "💡",
];

interface CommentComposerProps {
  postId: string;
  placeholder?: string;
  onSubmit: (content: string, mentionUserIds?: number[]) => void;
  isLoading?: boolean;
}

export const CommentComposer = ({
  postId,
  placeholder = "Thêm bình luận...",
  onSubmit,
  isLoading = false,
}: CommentComposerProps) => {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionCandidates, setMentionCandidates] = useState<SearchUserData[]>(
    [],
  );
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<SearchUserData[]>([]);

  const mentionDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null); // Ref mới cho lớp phủ phía sau
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (mentionDebounceTimer.current)
        clearTimeout(mentionDebounceTimer.current);
    };
  }, []);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Nội dung trống",
        description: "Vui lòng nhập nội dung bình luận.",
      });
      return;
    }

    // Lọc lại những user thực sự tồn tại trong nội dung bình luận
    const validMentionIds = mentionedUsers
      .filter((u) => content.includes(`@${u.username}`))
      .map((u) => u.id);

    onSubmit(content.trim(), validMentionIds);

    setContent("");
    setMentionedUsers([]);
    setMentionQuery("");
    setMentionCandidates([]);
    setShowMentionMenu(false);

    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent((prev) => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const extractMentionQuery = (text: string, cursor: number) => {
    const beforeCursor = text.slice(0, cursor);
    const atIndex = beforeCursor.lastIndexOf("@");
    if (atIndex === -1) return null;
    if (atIndex > 0 && !/\s/.test(beforeCursor.charAt(atIndex - 1)))
      return null;

    const query = beforeCursor.slice(atIndex + 1);
    if (query.includes(" ") || query.includes("\n")) return null;

    return query;
  };

  const fetchMentionCandidates = async (query: string) => {
    try {
      const data = await searchUsers({ query, limit: 5, offset: 0 });
      setMentionCandidates(data.users || []);
      setShowMentionMenu(Boolean(data.users?.length));
    } catch {
      setMentionCandidates([]);
      setShowMentionMenu(false);
    }
  };

  const updateContentWithMention = (nextValue: string, cursor: number) => {
    setContent(nextValue);
    setShowMentionMenu(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.selectionStart = cursor;
      textareaRef.current.selectionEnd = cursor;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (showMentionMenu && mentionCandidates.length > 0) {
        e.preventDefault();
        return; // Đang chọn menu thì không submit
      }
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = e.target.value;
    const nextCursor = e.target.selectionStart;

    setContent(nextText);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    const query = extractMentionQuery(nextText, nextCursor);
    if (query !== null) {
      setMentionQuery(query);
      if (mentionDebounceTimer.current)
        clearTimeout(mentionDebounceTimer.current);
      mentionDebounceTimer.current = setTimeout(() => {
        fetchMentionCandidates(query);
      }, 250);
    } else {
      setMentionQuery("");
      setMentionCandidates([]);
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (user: SearchUserData) => {
    if (!textareaRef.current) return;

    const currentText = content;
    const cursor = textareaRef.current.selectionStart;
    const beforeCursor = currentText.slice(0, cursor);
    const atIndex = beforeCursor.lastIndexOf("@");
    if (atIndex === -1) return;

    const afterCursor = currentText.slice(cursor);
    const nextText = `${beforeCursor.slice(0, atIndex)}@${user.username} ${afterCursor}`;
    const nextCursor = atIndex + user.username.length + 2;

    setMentionedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });

    updateContentWithMention(nextText, nextCursor);
    setMentionQuery("");
    setMentionCandidates([]);
    setShowMentionMenu(false);
  };

  const handleRemoveMention = (userId: number) => {
    setMentionedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  // HÀM MỚI: Định dạng bôi đậm @username
  const renderFormattedText = (text: string) => {
    if (!text)
      return <span className="text-muted-foreground">{placeholder}</span>;

    // Dùng Regex chia nhỏ chuỗi để tìm các chữ bắt đầu bằng @
    const regex = /(@[a-zA-Z0-9_.]+)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.match(regex)) {
        return (
          <span key={index} className="font-bold text-primary">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Đồng bộ Scroll giữa Textarea và Lớp Phủ Backdrop
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-md p-4">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage
            src="https://picsum.photos/32/32?random=999"
            alt="Your avatar"
          />
          <AvatarFallback>B</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          {/* VÙNG CHỨA TEXTAREA + LỚP PHỦ */}
          <div className="relative">
            {/* 1. LỚP PHỦ BÊN DƯỚI (Backdrop) */}
            <div
              ref={backdropRef}
              className="absolute inset-0 z-0 h-full w-full overflow-hidden whitespace-pre-wrap break-words rounded-md border border-transparent px-3 py-2 text-sm pr-12 pointer-events-none"
              aria-hidden="true"
            >
              {renderFormattedText(content)}
              {/* Thêm khoảng trống nếu gõ Enter ở cuối để cân bằng chiều cao */}
              {content.endsWith("\n") ? <br /> : null}
            </div>

            {/* 2. TEXTAREA BÊN TRÊN (Trong suốt chữ) */}
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyPress={handleKeyPress}
              onScroll={handleScroll}
              spellCheck={false} // Bắt buộc tắt spellcheck để không bị gạch chân đỏ lộ ra
              // Class quan trọng: text-transparent, bg-transparent, caret-foreground
              className="relative z-10 min-h-[40px] max-h-[120px] resize-none bg-transparent text-transparent caret-foreground pr-12 placeholder:text-transparent"
              disabled={isLoading}
            />

            {/* POPUP MENU MENTION */}
            {showMentionMenu && mentionCandidates.length > 0 && (
              <div className="absolute z-50 bottom-full mb-1 w-full max-h-52 overflow-auto rounded border bg-background p-1 shadow-lg">
                {mentionCandidates.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectMention(user)}
                    className="w-full px-2 py-2 text-left text-sm hover:bg-muted rounded flex items-center gap-3"
                  >
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        @{user.username}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {user.fullName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* CÁC NÚT ICON GÓC PHẢI */}
            <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <div className="grid grid-cols-8 gap-1">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => insertEmoji("@")}
              >
                <AtSign className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* MENTIONED USERS DISPLAY */}
          {mentionedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mentionedUsers.map((user) => (
                <div
                  key={user.id}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm border border-blue-200 dark:border-blue-800"
                >
                  <Avatar className="w-4 h-4 flex-shrink-0">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-xs">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    @{user.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMention(user.id)}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              size="sm"
              className="gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isLoading ? "Đang gửi..." : "Gửi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
