import React from 'react';
import { Play, Pause, SkipForward, Music } from 'lucide-react';
import { useMusicStore } from '../store';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const MiniPlayer: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { activeSong, playbackState, togglePlay, nextSong } = useMusicStore();

  if (!activeSong) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-[80px] left-2 right-2 h-16 bg-m3-secondary-container rounded-2xl shadow-lg border border-m3-outline/10 overflow-hidden flex items-center px-3 z-30 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-10 w-10 min-w-[40px] rounded-lg overflow-hidden bg-m3-surface-variant flex items-center justify-center">
        {activeSong.coverUrl ? (
          <img 
            src={activeSong.coverUrl} 
            alt={activeSong.title} 
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <Music size={20} className="text-m3-on-surface-variant" />
        )}
      </div>

      <div className="ml-3 flex-1 overflow-hidden">
        <div className="text-sm font-semibold truncate leading-tight text-m3-on-secondary-container">
          {activeSong.title}
        </div>
        <div className="text-xs truncate text-m3-on-secondary-container/70 leading-tight">
          {activeSong.artist}
        </div>
      </div>

      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={togglePlay}
          className="p-2 rounded-full hover:bg-m3-on-secondary-container/10 transition-colors"
        >
          {playbackState === 'playing' ? (
            <Pause size={20} className="fill-m3-on-secondary-container text-m3-on-secondary-container" />
          ) : (
            <Play size={20} className="fill-m3-on-secondary-container text-m3-on-secondary-container ml-0.5" />
          )}
        </button>
        <button 
          onClick={nextSong}
          className="p-2 rounded-full hover:bg-m3-on-secondary-container/10 transition-colors"
        >
          <SkipForward size={20} className="fill-m3-on-secondary-container text-m3-on-secondary-container" />
        </button>
      </div>
      
      {/* Progress bar line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-m3-on-secondary-container/10">
        <motion.div 
          className="h-full bg-m3-on-secondary-container"
          style={{ width: '30%' }} // This would be dynamic based on current time
        />
      </div>
    </motion.div>
  );
};
