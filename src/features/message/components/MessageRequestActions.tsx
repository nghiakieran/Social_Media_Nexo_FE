import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, UserCircle } from "lucide-react";
import { ConversationResponseDTO } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageRequestActionsProps {
  conversation: ConversationResponseDTO;
  currentUserId?: number;
  onAccept: (conversationId: number) => void;
  onDecline: (conversationId: number) => void;
}

export const MessageRequestActions: React.FC<MessageRequestActionsProps> = ({
  conversation,
  currentUserId,
  onAccept,
  onDecline,
}) => {
  const otherUser = conversation.participants.find(
    (p) => p.id !== currentUserId
  );

  if (!otherUser) return null;

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Message Request Info */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12 shrink-0">
            <AvatarImage src={otherUser.avatarUrl} alt={otherUser.fullName} />
            <AvatarFallback>
              <UserCircle className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              <strong>{otherUser.fullName}</strong> muốn gửi tin nhắn cho bạn
            </p>
            <p className="text-xs text-muted-foreground">
              Họ sẽ không biết bạn đã xem yêu cầu cho đến khi bạn chấp nhận
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onDecline(conversation.id)}
            className="flex-1 gap-2"
          >
            <X className="w-4 h-4" />
            Xóa
          </Button>
          <Button
            variant="default"
            onClick={() => onAccept(conversation.id)}
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4" />
            Chấp nhận
          </Button>
        </div>
      </div>
    </div>
  );
};
