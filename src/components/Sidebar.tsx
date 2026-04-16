import React from 'react';
import { Home, Library, PlaySquare, Folder, Settings, Music } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMusicStore } from '../store';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { songs } = useMusicStore();
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'playlists', label: 'Playlists', icon: PlaySquare },
    { id: 'folders', label: 'Folders', icon: Folder },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-m3-surface-variant/30 m-4 rounded-3xl p-6 flex flex-col gap-8 border border-m3-outline/5 shadow-sm">
      <div className="flex items-center gap-3 px-2">
        <div className="h-8 w-8 bg-m3-primary rounded-lg flex items-center justify-center text-m3-on-primary">
          <Music size={18} />
        </div>
        <span className="text-xl font-bold text-m3-primary tracking-tight">Melodica</span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-full font-medium transition-all duration-200",
                isActive 
                  ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-sm" 
                  : "text-m3-on-surface-variant hover:bg-m3-surface-variant/50"
              )}
            >
              <Icon size={20} className={isActive ? "text-m3-on-secondary-container" : "text-m3-on-surface-variant/70"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-m3-outline/10 px-2 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-m3-on-surface-variant uppercase tracking-widest">
            <span>Storage</span>
            <span>84%</span>
          </div>
          <div className="h-1 w-full bg-m3-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-m3-primary w-[84%] rounded-full" />
          </div>
        </div>
        
        <p className="text-[10px] text-m3-on-surface-variant/60 font-medium">
          {songs.length} tracks indexed locally
        </p>
      </div>
    </aside>
  );
};
