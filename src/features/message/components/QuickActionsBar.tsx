import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickActionsBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  className?: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  activeFilter,
  onFilterChange,
  className,
}) => {
  return (
    <div className={cn('p-2 border-b border-border bg-background', className)}>
      <div className="flex space-x-1">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className="rounded-full h-8 px-4 text-xs"
        >
          All 5
        </Button>
        <Button
          variant={activeFilter === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('unread')}
          className="rounded-full h-8 px-4 text-xs"
        >
          Unread 3
        </Button>
        <Button
          variant={activeFilter === 'groups' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('groups')}
          className="rounded-full h-8 px-4 text-xs"
        >
          Groups 2
        </Button>
        <Button
          variant={activeFilter === 'archived' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('archived')}
          className="rounded-full h-8 px-4 text-xs"
        >
          Archived
        </Button>
      </div>
    </div>
  );
};