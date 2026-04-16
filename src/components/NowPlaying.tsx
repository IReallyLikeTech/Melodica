import React, { useEffect, useState } from 'react';
import { ChevronDown, MoreVertical, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Heart, Share2, ListMusic } from 'lucide-react';
import { useMusicStore } from '../store';
import { cn, formatDuration } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const NowPlaying: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { activeSong, playbackState, togglePlay, nextSong, prevSong, repeatMode, setRepeatMode, isShuffle, toggleShuffle } = useMusicStore();
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
          className="fixed inset-0 z-50 bg-m3-surface flex flex-col p-6 overflow-hidden safe-area-top"
          style={{ 
            backgroundColor: activeSong.dominantColor ? `${activeSong.dominantColor}33` : undefined,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
              <ChevronDown size={28} className="text-m3-on-surface" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-m3-on-surface-variant">Playing from library</span>
              <span className="text-sm font-semibold text-m3-on-surface truncate max-w-[200px]">{activeSong.album}</span>
            </div>
            <button className="p-2 rounded-full hover:bg-black/5">
              <MoreVertical size={24} className="text-m3-on-surface" />
            </button>
          </div>

          {/* Album Art */}
          <div className="flex-1 flex flex-col items-center justify-center mb-8">
            <motion.div 
              layoutId="cover-art"
              className="aspect-square w-full max-w-[320px] rounded-4xl overflow-hidden shadow-2xl bg-m3-surface-variant"
            >
              {activeSong.coverUrl ? (
                <img src={activeSong.coverUrl} alt={activeSong.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-m3-primary/10 flex items-center justify-center">
                    <div className="h-16 w-16 bg-m3-primary rounded-full flex items-center justify-center text-white">
                      1
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Info */}
          <div className="w-full mb-8 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 overflow-hidden">
                <h1 className="text-2xl font-bold text-m3-on-surface truncate leading-tight">{activeSong.title}</h1>
                <p className="text-lg text-m3-on-surface-variant truncate leading-tight">{activeSong.artist}</p>
              </div>
              <button className="p-2 text-m3-on-surface-variant hover:text-m3-primary transition-colors">
                <Heart size={28} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full space-y-2 mb-8">
            <div className="relative h-1 w-full bg-m3-on-surface/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-m3-on-surface"
                animate={{ width: `${(currentTime / activeSong.duration) * 100}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-m3-on-surface rounded-full shadow-md"
                style={{ left: `calc(${(currentTime / activeSong.duration) * 100}% - 6px)` }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-m3-on-surface-variant tracking-wider">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(activeSong.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={toggleShuffle}
              className={cn("p-2 rounded-full transition-colors", isShuffle ? "text-m3-primary" : "text-m3-on-surface-variant")}
            >
              <Shuffle size={24} />
            </button>
            
            <div className="flex items-center gap-6">
              <button onClick={prevSong} className="p-2 text-m3-on-surface hover:bg-black/5 rounded-full">
                <SkipBack size={32} className="fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="h-20 w-20 rounded-full bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                {playbackState === 'playing' ? (
                  <Pause size={40} className="fill-current" />
                ) : (
                  <Play size={40} className="fill-current ml-1" />
                )}
              </button>
              
              <button onClick={nextSong} className="p-2 text-m3-on-surface hover:bg-black/5 rounded-full">
                <SkipForward size={32} className="fill-current" />
              </button>
            </div>

            <button 
              onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
              className={cn("p-2 rounded-full transition-colors relative", repeatMode !== 'off' ? "text-m3-primary" : "text-m3-on-surface-variant")}
            >
              <Repeat size={24} />
              {repeatMode === 'one' && <span className="absolute bottom-1 right-1 text-[8px] font-bold">1</span>}
            </button>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-around mb-4">
            <button className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
              <Share2 size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Share</span>
            </button>
            <button className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
              <ListMusic size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Queue</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
