/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { BottomNav } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlaying } from './components/NowPlaying';
import { HomeView } from './components/Home';
import { LibraryView } from './components/Library';
import { SearchView } from './components/Search';
import { Sidebar } from './components/Sidebar';
import { AudioPlayer } from './components/AudioPlayer';
import { useMusicStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';
import { Music, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Heart } from 'lucide-react';
import { formatDuration } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { songs, activeSong, playbackState, togglePlay, nextSong, prevSong } = useMusicStore();

  useEffect(() => {
    if (songs.length > 0) setShowOnboarding(false);
  }, [songs]);

  return (
    <div className="h-screen w-screen bg-m3-surface overflow-hidden flex font-sans select-none text-m3-on-surface">
      <AudioPlayer />
      
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                <HomeView />
              </motion.div>
            )}
            {activeTab === 'library' && (
              <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                <LibraryView />
              </motion.div>
            )}
            {activeTab === 'search' && (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                <SearchView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Mini Player */}
        <div className="lg:hidden">
          {activeSong && <MiniPlayer onClick={() => setIsNowPlayingOpen(true)} />}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Desktop Bottom Player Bar */}
        <div className="hidden lg:flex h-24 bg-m3-surface-variant/30 border-t border-m3-outline/10 px-6 items-center justify-between gap-8 z-30">
          <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
            {activeSong ? (
              <>
                <div className="h-14 w-14 rounded-xl overflow-hidden shadow-sm bg-m3-surface-variant flex items-center justify-center shrink-0">
                  {activeSong.coverUrl ? (
                    <img src={activeSong.coverUrl} className="h-full w-full object-cover" />
                  ) : <Music className="text-m3-on-surface-variant" />}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-m3-on-surface truncate leading-tight">{activeSong.title}</h4>
                  <p className="text-sm text-m3-on-surface-variant truncate leading-tight">{activeSong.artist}</p>
                </div>
              </>
            ) : (
              <div className="text-sm text-m3-on-surface-variant font-medium italic">No song playing</div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center max-w-2xl">
            <div className="flex items-center gap-6 mb-2">
              <button className="text-m3-on-surface-variant hover:text-m3-primary transition-colors"><Shuffle size={18} /></button>
              <button onClick={prevSong} className="text-m3-on-surface hover:text-m3-primary transition-colors"><SkipBack size={20} className="fill-current" /></button>
              <button 
                onClick={togglePlay}
                className="h-12 w-12 rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-md active:scale-95 transition-all"
              >
                {playbackState === 'playing' ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-0.5" />}
              </button>
              <button onClick={nextSong} className="text-m3-on-surface hover:text-m3-primary transition-colors"><SkipForward size={20} className="fill-current" /></button>
              <button className="text-m3-on-surface-variant hover:text-m3-primary transition-colors"><Repeat size={18} /></button>
            </div>
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] font-bold text-m3-on-surface-variant w-8 text-right">0:00</span>
              <div className="flex-1 h-1 bg-m3-surface-variant rounded-full overflow-hidden relative">
                <div className="h-full bg-m3-primary w-[30%]" />
              </div>
              <span className="text-[10px] font-bold text-m3-on-surface-variant w-8">
                {activeSong ? formatDuration(activeSong.duration) : '0:00'}
              </span>
            </div>
          </div>

          <div className="w-1/4 flex justify-end items-center gap-4">
            <button className="text-m3-on-surface-variant hover:text-m3-primary transition-colors"><Heart size={20} /></button>
            <div className="w-32 h-1 bg-m3-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-m3-primary w-2/3" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Now Playing Panel */}
      <div className="hidden xl:flex w-80 bg-m3-primary-container/20 m-4 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-m3-outline/5 transition-all">
        {activeSong ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center">
            <div 
              className="w-full aspect-square rounded-[32px] overflow-hidden shadow-2xl mb-8 bg-m3-surface-variant transition-transform hover:scale-105 duration-700"
              style={{ boxShadow: activeSong.dominantColor ? `0 20px 40px ${activeSong.dominantColor}33` : undefined }}
            >
              {activeSong.coverUrl ? (
                <img src={activeSong.coverUrl} className="h-full w-full object-cover" />
              ) : <div className="h-full w-full flex items-center justify-center bg-m3-primary/10"><Music size={64} className="text-m3-primary/20" /></div>}
            </div>
            <h2 className="text-2xl font-bold text-m3-on-surface mb-2 line-clamp-2">{activeSong.title}</h2>
            <p className="text-m3-on-surface-variant font-medium mb-12">{activeSong.artist}</p>
            
            <div className="w-full flex gap-3 justify-center">
              <div className="px-4 py-2 rounded-full bg-m3-primary/10 text-m3-primary text-xs font-bold uppercase tracking-wider">Next Track</div>
            </div>
          </div>
        ) : (
          <div className="text-m3-on-surface-variant/40 space-y-4">
            <div className="h-16 w-16 bg-m3-surface-variant/30 rounded-full flex items-center justify-center mx-auto">
              <Music size={32} />
            </div>
            <p className="font-semibold italic">Your musical journey starts here</p>
          </div>
        )}
      </div>

      <NowPlaying isOpen={isNowPlayingOpen} onClose={() => setIsNowPlayingOpen(false)} />
    </div>
  );
}
