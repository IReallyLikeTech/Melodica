import React, { useEffect, useState } from 'react';
import { ChevronDown, MoreVertical, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Heart, Share2, ListMusic, Music } from 'lucide-react';
import { useMusicStore } from '../store';
import { cn, formatDuration } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const NowPlaying: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { activeSong, playbackState, togglePlay, nextSong, prevSong, repeatMode, setRepeatMode, isShuffle, toggleShuffle, toggleFavorite } = useMusicStore();
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (playbackState === 'playing') {
      interval = setInterval(() => {
        setCurrentTime(t => (t < (activeSong?.duration || 0) ? t + 1 : t));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playbackState, activeSong]);

  if (!activeSong) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 flex flex-col p-6 overflow-hidden safe-area-top"
          style={{ 
            backgroundColor: activeSong.dominantColor || '#FEF7FF',
            color: activeSong.dominantColor ? '#FFFFFF' : '#1D1B20' 
          }}
        >
          {/* Transparent Overlay for better text readability if color is bright */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                <ChevronDown size={28} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Playing from library</span>
                <span className="text-sm font-bold truncate max-w-[200px]">{activeSong.album}</span>
              </div>
              <button className="p-2 rounded-full hover:bg-white/10">
                <MoreVertical size={24} />
              </button>
            </div>

            {/* Album Art */}
            <div className="flex-1 flex flex-col items-center justify-center mb-8">
              <motion.div 
                layoutId="cover-art"
                className="aspect-square w-full max-w-[340px] rounded-[40px] overflow-hidden shadow-2xl bg-m3-surface-variant/20"
                style={{ 
                  boxShadow: `0 30px 60px rgba(0,0,0,0.4)`
                }}
              >
                {activeSong.coverUrl ? (
                  <img src={activeSong.coverUrl} alt={activeSong.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/10">
                    <Music size={100} className="opacity-20" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Info */}
            <div className="w-full mb-8 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 overflow-hidden">
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl font-bold truncate leading-tight tracking-tight"
                  >
                    {activeSong.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl opacity-80 truncate leading-tight"
                  >
                    {activeSong.artist}
                  </motion.p>
                </div>
                <button 
                  onClick={() => toggleFavorite(activeSong.id)}
                  className="p-3 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Heart 
                    size={32} 
                    fill={activeSong.isFavorite ? "currentColor" : "none"} 
                    className={cn(activeSong.isFavorite ? "text-white" : "opacity-80")}
                  />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full space-y-3 mb-8">
              <div className="relative h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer group">
                <motion.div 
                  className="h-full bg-white"
                  animate={{ width: `${(currentTime / activeSong.duration) * 100}%` }}
                />
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${(currentTime / activeSong.duration) * 100}% - 8px)` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold opacity-70 tracking-widest">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(activeSong.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-10">
              <button 
                onClick={toggleShuffle}
                className={cn("p-3 rounded-full transition-all", isShuffle ? "bg-white/20 shadow-inner" : "opacity-60 hover:opacity-100")}
              >
                <Shuffle size={24} />
              </button>
              
              <div className="flex items-center gap-4">
                <button onClick={prevSong} className="p-4 hover:bg-white/10 rounded-full transition-colors">
                  <SkipBack size={36} className="fill-current" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="h-24 w-24 rounded-[32px] bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {playbackState === 'playing' ? (
                    <Pause size={48} className="fill-current" />
                  ) : (
                    <Play size={48} className="fill-current ml-2" />
                  )}
                </button>
                
                <button onClick={nextSong} className="p-4 hover:bg-white/10 rounded-full transition-colors">
                  <SkipForward size={36} className="fill-current" />
                </button>
              </div>

              <button 
                onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                className={cn("p-3 rounded-full transition-all relative", repeatMode !== 'off' ? "bg-white/20 shadow-inner" : "opacity-60 hover:opacity-100")}
              >
                <Repeat size={24} />
                {repeatMode === 'one' && <span className="absolute top-1 right-1 text-[10px] font-black bg-white text-black h-4 w-4 rounded-full flex items-center justify-center">1</span>}
              </button>
            </div>

            {/* Footer controls */}
            <div className="flex items-center justify-around mb-2">
              <button className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <Share2 size={24} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Share</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <ListMusic size={24} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Queue</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
