import { Grid3X3, Film, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileTabsProps {
  activeTab: 'posts' | 'reels' | 'saved';
  onTabChange: (tab: 'posts' | 'reels' | 'saved') => void;
  isCurrentUser: boolean;
}

export const ProfileTabs = ({ activeTab, onTabChange, isCurrentUser }: ProfileTabsProps) => {
  const baseTabs: Array<{
    id: 'posts' | 'reels';
    label: string;
    icon: any;
  }> = [
    {
      id: 'posts',
      label: 'BÀI VIẾT',
      icon: Grid3X3,
    },
    {
      id: 'reels',
      label: 'REELS',
      icon: Film,
    },
  ];

  const tabs = isCurrentUser 
    ? [
        ...baseTabs,
        {
          id: 'saved' as const,
          label: 'ĐÃ LƯU',
          icon: Bookmark,
        }
      ]
    : baseTabs;

  return (
    <div className="border-t border-border bg-background">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-wider border-t-2 transition-all duration-200",
                isActive 
                  ? "text-foreground border-foreground" 
                  : "text-muted-foreground border-transparent hover:text-foreground/70"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};