import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Crown,
  MoreVertical,
  UserPlus,
  LogOut,
  Pencil,
  Check,
  X,
  Users,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conversationApi } from "../services/messageApi";
import type { ConversationResponseDTO, UserDTO } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store";
import { AddMemberDialog } from "./AddMemberDialog";

interface GroupInfoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: ConversationResponseDTO;
  currentUserId?: number;
  onUpdated: () => void;
  onLeft: () => void;
}

export const GroupInfoPanel: React.FC<GroupInfoPanelProps> = ({
  open,
  onOpenChange,
  conversation,
  currentUserId,
  onUpdated,
  onLeft,
}) => {
  const { toast } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [groupName, setGroupName] = useState(conversation.groupName ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<UserDTO | null>(null);

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [changeAvatarDialogOpen, setChangeAvatarDialogOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const conversations = useAppSelector((state) => state.message.conversations);

  const isAdmin = conversation.isGroupAdmin ?? false;
  const isCreator = conversation.createdByUserId === currentUserId;

  const handleSaveName = async () => {
    if (!groupName.trim()) return;
    setIsSaving(true);
    try {
      await conversationApi.updateGroup(conversation.id, {
        groupName: groupName.trim(),
      });
      toast({ title: "Đã đổi tên nhóm" });
      onUpdated();
      setEditingName(false);
    } catch {
      toast({ title: "Lỗi", description: "Không thể đổi tên nhóm", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeave = async () => {
    try {
      await conversationApi.leaveGroup(conversation.id);
      setLeaveDialogOpen(false);
      onOpenChange(false);
      onLeft();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Không thể rời nhóm";
      toast({ title: "Lỗi", description: msg, variant: "destructive" });
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await conversationApi.removeMember(conversation.id, userId);
      setRemoveTarget(null);
      toast({ title: "Đã xóa thành viên" });
      onUpdated();
    } catch {
      toast({ title: "Lỗi", description: "Không thể xóa thành viên", variant: "destructive" });
    }
  };

  const handlePromote = async (userId: number) => {
    try {
      await conversationApi.promoteAdmin(conversation.id, userId);
      toast({ title: "Đã thăng cấp admin" });
      onUpdated();
    } catch {
      toast({ title: "Lỗi", description: "Không thể thăng cấp", variant: "destructive" });
    }
  };

  const handleDemote = async (userId: number) => {
    try {
      await conversationApi.demoteAdmin(conversation.id, userId);
      toast({ title: "Đã hạ cấp thành viên" });
      onUpdated();
    } catch {
      toast({ title: "Lỗi", description: "Không thể hạ cấp", variant: "destructive" });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Thông tin nhóm
            </SheetTitle>
          </SheetHeader>

          {/* Group avatar + name */}
          <div className="flex flex-col items-center py-6 gap-3">
            <div 
              className={cn("relative group", isAdmin && "cursor-pointer")} 
              onClick={() => isAdmin && setChangeAvatarDialogOpen(true)}
            >
              <Avatar className="h-20 w-20">
                <AvatarImage src={conversation.groupAvatarUrl ?? ""} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {(conversation.groupName ?? "N").charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isAdmin && (
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {editingName ? (
              <div className="flex items-center gap-2 w-full max-w-[220px]">
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") { setEditingName(false); setGroupName(conversation.groupName ?? ""); }
                  }}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveName} disabled={isSaving}>
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingName(false); setGroupName(conversation.groupName ?? ""); }}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <p className="font-semibold text-base">{conversation.groupName}</p>
                {isAdmin && (
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingName(true)}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {conversation.participants.length} thành viên
            </p>
          </div>

          {/* Members list */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 mb-2">
              Thành viên
            </p>
            {conversation.participants.map((member) => {
              const isMemberCreator = member.id === conversation.createdByUserId;
              const isSelf = member.id === currentUserId;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{member.fullName}</p>
                      {isMemberCreator && (
                        <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">@{member.username}</p>
                  </div>

                  {/* Admin badge */}
                  {isMemberCreator && (
                    <Badge variant="outline" className="text-[10px] shrink-0">Admin</Badge>
                  )}

                  {/* Actions — only for admins and not self/creator */}
                  {isAdmin && !isSelf && !isMemberCreator && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePromote(member.id)}>
                          <Crown className="h-4 w-4 mr-2" />
                          Thăng admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setRemoveTarget(member)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Xóa khỏi nhóm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Admin can demote themselves (not creator) */}
                  {isAdmin && isSelf && !isCreator && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDemote(member.id)}>
                          Từ bỏ quyền admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add members button */}
          {isAdmin && (
            <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => setAddMemberDialogOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Thêm thành viên
            </Button>
          )}

          {/* Leave group */}
          {!isCreator && (
            <Button
              variant="ghost"
              className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
              onClick={() => setLeaveDialogOpen(true)}
            >
              <LogOut className="h-4 w-4" />
              Rời nhóm
            </Button>
          )}
        </SheetContent>
      </Sheet>

      {/* Remove member confirm */}
      <Dialog open={!!removeTarget} onOpenChange={(o) => { if (!o) setRemoveTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa thành viên?</DialogTitle>
            <DialogDescription>
              Bạn muốn xóa <strong>{removeTarget?.fullName}</strong> khỏi nhóm?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={() => removeTarget && handleRemoveMember(removeTarget.id)}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave group confirm */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rời nhóm?</DialogTitle>
            <DialogDescription>
              Bạn sẽ không còn nhận được tin nhắn từ nhóm này nữa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleLeave}>Rời nhóm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Avatar Dialog */}
      <Dialog open={changeAvatarDialogOpen} onOpenChange={setChangeAvatarDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Đổi ảnh đại diện nhóm</DialogTitle>
            <DialogDescription>
              Nhập đường dẫn (URL) của hình ảnh mới.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="https://example.com/avatar.jpg"
              value={newAvatarUrl}
              onChange={(e) => setNewAvatarUrl(e.target.value)}
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  if (!newAvatarUrl.trim()) return;
                  setIsSaving(true);
                  try {
                    await conversationApi.updateGroup(conversation.id, { groupAvatarUrl: newAvatarUrl.trim() });
                    onUpdated();
                    setChangeAvatarDialogOpen(false);
                    setNewAvatarUrl("");
                  } catch {
                    toast({ title: "Lỗi", description: "Không thể cập nhật ảnh đại diện", variant: "destructive" });
                  } finally {
                    setIsSaving(false);
                  }
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setChangeAvatarDialogOpen(false)} disabled={isSaving}>Hủy</Button>
            <Button 
              disabled={isSaving || !newAvatarUrl.trim()}
              onClick={async () => {
                setIsSaving(true);
                try {
                  await conversationApi.updateGroup(conversation.id, { groupAvatarUrl: newAvatarUrl.trim() });
                  onUpdated();
                  setChangeAvatarDialogOpen(false);
                  setNewAvatarUrl("");
                } catch {
                  toast({ title: "Lỗi", description: "Không thể cập nhật ảnh đại diện", variant: "destructive" });
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        conversations={conversations}
        existingParticipants={conversation.participants}
        currentUserId={currentUserId}
        onAdd={async (userIds) => {
          await conversationApi.addMembers(conversation.id, { userIds });
          toast({ title: "Đã thêm thành viên mới" });
          onUpdated();
        }}
      />
    </>
  );
};
