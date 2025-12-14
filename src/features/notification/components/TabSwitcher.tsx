import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabSwitcherProps {
  activeTab: 'all' | 'following' | 'you';
  onTabChange: (tab: 'all' | 'following' | 'you') => void;
  unreadCount: number;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ 
  activeTab, 
  onTabChange, 
  unreadCount 
}) => {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="px-4 py-3">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="all" 
              className="relative transition-all duration-200 hover:scale-[1.02]"
            >
              Tất cả
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-destructive rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="transition-all duration-200 hover:scale-[1.02]"
            >
              Đang theo dõi
            </TabsTrigger>
            <TabsTrigger 
              value="you" 
              className="transition-all duration-200 hover:scale-[1.02]"
            >
              Bạn
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default TabSwitcher;