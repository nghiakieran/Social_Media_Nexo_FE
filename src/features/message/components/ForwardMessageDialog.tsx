import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageContent: string;
  onForward: (userIds: string[]) => void;
}

export const ForwardMessageDialog: React.FC<ForwardMessageDialogProps> = ({
  open,
  onOpenChange,
  messageContent,
  onForward,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredUsers = []; // Placeholder for filtered users logic

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleForward = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Chọn người nhận",
        description: "Vui lòng chọn ít nhất một người để chuyển tiếp tin nhắn.",
        variant: "destructive",
      });
      return;
    }

    onForward(selectedUsers);
    toast({
      title: "Đã chuyển tiếp tin nhắn",
      description: `Tin nhắn đã được gửi đến ${selectedUsers.length} ${
        selectedUsers.length === 1 ? "người" : "người"
      }.`,
    });

    setSelectedUsers([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chuyển tiếp tin nhắn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Đang chuyển tiếp:</p>
            <p className="mt-1 line-clamp-2">{messageContent}</p>
          </div>

          {}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {}
          {selectedUsers.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Đã chọn {selectedUsers.length} người
            </div>
          )}

          {}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedUsers.includes(user.id) && "bg-muted"
                  )}
                  onClick={() => handleUserToggle(user.id)}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleForward}
            disabled={selectedUsers.length === 0}
            className="min-w-[100px]"
          >
            <Send className="h-4 w-4 mr-2" />
            Gửi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
