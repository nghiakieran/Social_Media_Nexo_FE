import { Grid3X3, Film, Bookmark, EyeOff } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface ProfileTabsProps {
  activeTab: 'posts' | 'reels' | 'saved' | 'hidden';
  onTabChange: (tab: 'posts' | 'reels' | 'saved' | 'hidden') => void;
  isCurrentUser: boolean;
}

export const ProfileTabs = ({ activeTab, onTabChange, isCurrentUser }: ProfileTabsProps) => {
  const baseTabs: Array<{
    id: 'posts' | 'reels';
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
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
        },
        {
          id: 'hidden' as const,
          label: 'ĐÃ ẨN',
          icon: EyeOff,
        }
      ]
    : baseTabs;

  return (
    <div className="border-t border-border bg-background">
      <div role="tablist" className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              role="tab"
              aria-selected={isActive}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-wider border-t-2 transition-colors",
                isActive 
                  ? "text-foreground border-foreground" 
                  : "text-muted-foreground border-transparent hover:text-foreground/80"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-foreground" : "text-muted-foreground")} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};