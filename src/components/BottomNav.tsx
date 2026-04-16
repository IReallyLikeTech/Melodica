import React from 'react';
import { Home, Library, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'search', label: 'Search', icon: Search },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-m3-surface-variant/30 backdrop-blur-xl border-t border-m3-outline/10 flex items-center justify-around px-2 pb-2 safe-area-bottom z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-1 group relative py-2"
          >
            <div className={cn(
              "flex items-center justify-center h-8 w-16 rounded-full transition-all duration-300",
              isActive ? "bg-m3-secondary-container" : "group-hover:bg-m3-surface-variant/50"
            )}>
              <Icon 
                size={24} 
                className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-m3-on-secondary-container" : "text-m3-on-surface-variant"
                )} 
              />
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors duration-300",
              isActive ? "text-m3-on-surface font-semibold" : "text-m3-on-surface-variant"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
