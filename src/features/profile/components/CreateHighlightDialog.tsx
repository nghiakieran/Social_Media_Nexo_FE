import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MediaItem {
  id: string;
  thumbnail: string;
}

interface CreateHighlightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  posts: MediaItem[];
  onCreate: (params: { name: string; selectedIds: string[] }) => void;
}

export const CreateHighlightDialog = ({ isOpen, onClose, posts, onCreate }: CreateHighlightDialogProps) => {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    const next: Record<string, boolean> = {};
    for (const p of posts) next[p.id] = false;
    setSelected(next);
  }, [isOpen, posts]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
  const canCreate = name.trim().length > 0 && selectedIds.length > 0;

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({ name: name.trim(), selectedIds });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[560px] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center">Tin nổi bật mới</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <Input
            placeholder="Tên tin nổi bật"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="h-[340px] overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {posts.map((p) => {
                const isActive = !!selected[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={`relative w-full pb-[100%] rounded-md overflow-hidden ring-1 ring-border ${isActive ? 'outline outline-2 outline-primary' : ''}`}
                    aria-pressed={isActive}
                  >
                    <img
                      src={p.thumbnail}
                      alt="story"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-black/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Hủy</Button>
            <Button disabled={!canCreate} onClick={handleCreate}>Tiếp</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHighlightDialog;


