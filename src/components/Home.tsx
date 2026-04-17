import React from 'react';
import { useMusicStore } from '../store';
import { Clock, PlayCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const HomeView: React.FC = () => {
  const { songs, albums, playSong, navigateTo } = useMusicStore();
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  const recentlyPlayed = songs.slice(0, 6); // Mocked for now
  const quickPicks = songs.slice(6, 12);

  return (
    <div className="flex flex-col h-full bg-m3-surface overflow-auto no-scrollbar pb-32">
      <div className="px-6 py-12 space-y-2">
        <h1 className="text-4xl font-bold text-m3-on-surface tracking-tight">{greeting}</h1>
        <p className="text-m3-on-surface-variant font-medium">
          {songs.length} songs • {albums.length} albums available
        </p>
      </div>

      <section className="px-6 space-y-4 mb-10">
        <div className="flex items-center gap-2 text-m3-on-surface">
          <Clock size={20} className="text-m3-primary" />
          <h2 className="text-xl font-bold tracking-tight">Recently Played</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recentlyPlayed.map((song) => (
            <motion.div 
              key={song.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => playSong(song, recentlyPlayed)}
              className="flex items-center gap-3 bg-m3-surface-variant/20 p-2 rounded-2xl hover:bg-m3-surface-variant/40 transition-colors cursor-pointer"
            >
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-m3-surface-variant shrink-0">
                {song.coverUrl && <img src={song.coverUrl} className="h-full w-full object-cover" />}
              </div>
              <span className="text-xs font-bold text-m3-on-surface truncate pr-2">{song.title}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4 mb-10">
        <div className="px-6 flex items-center gap-2 text-m3-on-surface">
          <PlayCircle size={20} className="text-m3-primary" />
          <h2 className="text-xl font-bold tracking-tight">Quick Picks</h2>
        </div>
        <div className="flex overflow-x-auto gap-6 px-6 no-scrollbar pb-6">
          {quickPicks.map((song) => (
            <motion.div 
              key={song.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo({ type: 'album', albumId: `${song.album}-${song.artist}` })}
              className="flex-none w-48 space-y-3 cursor-pointer group"
            >
              <div className="aspect-square w-full rounded-[40px] overflow-hidden bg-m3-surface-variant shadow-lg group-hover:shadow-2xl transition-all duration-300">
                {song.coverUrl ? (
                  <img src={song.coverUrl} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-m3-surface-variant/50">
                    <Disc size={48} className="text-m3-on-surface-variant/20" />
                  </div>
                )}
              </div>
              <div className="px-1">
                <h4 className="text-sm font-bold text-m3-on-surface truncate line-clamp-1">{song.album}</h4>
                <p className="text-xs text-m3-on-surface-variant truncate font-medium opacity-60">{song.artist}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 space-y-4">
        <div className="flex items-center gap-2 text-m3-on-surface">
          <TrendingUp size={20} className="text-m3-primary" />
          <h2 className="text-xl font-bold tracking-tight">Library Stats</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-m3-secondary-container p-4 rounded-3xl text-m3-on-secondary-container">
            <div className="text-2xl font-bold">{songs.length}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Songs</div>
          </div>
          <div className="bg-m3-primary-container p-4 rounded-3xl text-m3-on-primary-container">
            <div className="text-2xl font-bold">{albums.length}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Albums</div>
          </div>
          <div className="bg-m3-surface-variant p-4 rounded-3xl text-m3-on-surface-variant">
            <div className="text-2xl font-bold">{albums.length > 0 ? albums.length - 1 : 0}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Artists</div>
          </div>
        </div>
      </section>
    </div>
  );
};
