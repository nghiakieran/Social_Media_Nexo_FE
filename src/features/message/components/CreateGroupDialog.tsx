import React, { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserDTO, ConversationResponseDTO } from "../types";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: ConversationResponseDTO[];
  currentUserId?: number;
  onCreate: (groupName: string, memberIds: number[]) => Promise<void>;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onOpenChange,
  conversations,
  currentUserId,
  onCreate,
}) => {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserDTO[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Deduplicate users from existing conversations
  const availableUsers = useMemo(() => {
    const map = new Map<number, UserDTO>();
    conversations.forEach((conv) => {
      conv.participants.forEach((p) => {
        if (p.id !== currentUserId && !map.has(p.id)) {
          map.set(p.id, p);
        }
      });
    });
    return Array.from(map.values());
  }, [conversations, currentUserId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return availableUsers;
    const q = search.toLowerCase();
    return availableUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
    );
  }, [availableUsers, search]);

  const isSelected = (id: number) => selected.some((u) => u.id === id);

  const toggleUser = (user: UserDTO) => {
    setSelected((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selected.length < 2) return;
    setIsCreating(true);
    try {
      await onCreate(
        groupName.trim(),
        selected.map((u) => u.id)
      );
      setGroupName("");
      setSelected([]);
      setSearch("");
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setGroupName("");
      setSelected([]);
      setSearch("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tạo nhóm chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Group name */}
          <div>
            <Input
              placeholder="Tên nhóm..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-10"
              autoFocus
            />
          </div>

          {/* Selected members chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <Badge
                  key={u.id}
                  variant="outline"
                  className="flex items-center gap-1 pl-1 pr-1.5 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={u.avatarUrl} />
                    <AvatarFallback className="text-[10px]">
                      {u.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs max-w-[80px] truncate">
                    {u.fullName}
                  </span>
                  <button
                    onClick={() => toggleUser(u)}
                    className="ml-0.5 rounded-full hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Tìm bạn bè..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* User list */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Không tìm thấy người dùng
              </p>
            ) : (
              filtered.map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    isSelected(user.id)
                      ? "bg-primary/10"
                      : "hover:bg-muted/60"
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                  {isSelected(user.id) && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isCreating}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!groupName.trim() || selected.length < 2 || isCreating}
          >
            {isCreating ? "Đang tạo..." : `Tạo nhóm (${selected.length + 1})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
