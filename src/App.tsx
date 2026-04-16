/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { BottomNav } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlaying } from './components/NowPlaying';
import { HomeView } from './components/Home';
import { LibraryView } from './components/Library';
import { SearchView } from './components/Search';
import { AudioPlayer } from './components/AudioPlayer';
import { useMusicStore } from './store';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { songs, activeSong } = useMusicStore();

  useEffect(() => {
    // If we have songs, hide onboarding
    if (songs.length > 0) {
      setShowOnboarding(false);
    }
  }, [songs]);

  return (
    <div className="h-screen w-screen bg-m3-surface overflow-hidden flex flex-col font-sans select-none">
      <AudioPlayer />
      
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute inset-0"
            >
              <HomeView />
            </motion.div>
          )}
          {activeTab === 'library' && (
            <motion.div 
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0"
            >
              <LibraryView />
            </motion.div>
          )}
          {activeTab === 'search' && (
            <motion.div 
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <SearchView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {activeSong && <MiniPlayer onClick={() => setIsNowPlayingOpen(true)} />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <NowPlaying 
        isOpen={isNowPlayingOpen} 
        onClose={() => setIsNowPlayingOpen(false)} 
      />
    </div>
  );
}
