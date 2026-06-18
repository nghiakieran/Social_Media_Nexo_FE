import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  isDebouncing?: boolean;
  autoFocus?: boolean;
}

export const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = "Tìm kiếm...",
  className,
  isDebouncing = false,
  autoFocus = false,
}: SearchInputProps) => {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full min-w-0 pl-10 pr-10 text-sm focus-visible:ring-primary/30 md:text-base"
          autoFocus={autoFocus}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isDebouncing && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          {value && !isDebouncing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 hover:bg-primary/10"
            >
              <X className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
