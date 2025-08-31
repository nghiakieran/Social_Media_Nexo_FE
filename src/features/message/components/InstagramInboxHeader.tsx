import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Edit3,
  Settings,
  MessageSquare,
  Archive,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstagramInboxHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewMessage: () => void;
  className?: string;
}

export const InstagramInboxHeader: React.FC<InstagramInboxHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onNewMessage,
  className,
}) => {
  return (
    <div className={cn('p-4 border-b border-border bg-background', className)}>
      {/* Title and Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold">Messages</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <MessageSquare className="h-4 w-4 mr-2" />
                Primary
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                General
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewMessage}
            className="h-8 w-8"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted border-0 rounded-xl h-9"
        />
      </div>
    </div>
  );
};