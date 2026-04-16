import React, { useState } from 'react';
import { useMusicStore } from '../store';
import { Music, Disc, User, Play, MoreVertical } from 'lucide-react';
import { cn, formatDuration } from '../lib/utils';
import { motion } from 'framer-motion';

export const LibraryView: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'songs' | 'albums' | 'artists'>('songs');
  const { songs, albums, artists, playSong } = useMusicStore();

  const segments = [
    { id: 'songs', label: 'Songs', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: User },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-m3-surface">
      <div className="sticky top-0 z-20 bg-m3-surface/80 backdrop-blur-md px-4 py-4 space-y-4">
        <h1 className="text-3xl font-bold text-m3-on-surface">Your Library</h1>
        
        <div className="flex p-1 bg-m3-surface-variant/30 rounded-full w-full max-w-md">
          {segments.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSegment(s.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeSegment === s.id 
                  ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-sm" 
                  : "text-m3-on-surface-variant hover:bg-m3-surface-variant/50"
              )}
            >
              <s.icon size={18} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-32 pt-2 scroll-smooth no-scrollbar">
        {activeSegment === 'songs' && (
          <div className="space-y-1">
            {songs.map((song) => (
              <div 
                key={song.id}
                onClick={() => playSong(song, songs)}
                className="group flex items-center p-3 rounded-2xl hover:bg-m3-primary-container/30 active:bg-m3-primary-container/50 transition-colors cursor-pointer"
              >
                <div className="relative h-12 w-12 min-w-[48px] rounded-xl overflow-hidden bg-m3-surface-variant flex items-center justify-center shadow-sm">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Music className="text-m3-on-surface-variant" size={24} />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="text-white fill-white" size={20} />
                  </div>
                </div>
                
                <div className="ml-4 flex-1 overflow-hidden">
                  <h4 className="font-semibold text-m3-on-surface truncate line-clamp-1">{song.title}</h4>
                  <p className="text-sm text-m3-on-surface-variant truncate">{song.artist} • {song.album}</p>
                </div>

                <div className="ml-4 text-xs text-m3-on-surface-variant font-medium">
                  {formatDuration(song.duration)}
                </div>
                
                <button className="ml-2 p-2 rounded-full hover:bg-m3-on-surface-variant/10 text-m3-on-surface-variant transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSegment === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {albums.map((album) => (
              <motion.div 
                whileHover={{ y: -4 }}
                key={`${album.name}-${album.artist}`}
                className="group space-y-3 cursor-pointer"
              >
                <div className="aspect-square w-full rounded-3xl overflow-hidden bg-m3-surface-variant shadow-md">
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Disc className="text-m3-on-surface-variant" size={48} />
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-m3-on-surface truncate leading-tight">{album.name}</h4>
                  <p className="text-sm text-m3-on-surface-variant truncate">{album.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeSegment === 'artists' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {artists.map((artist) => (
              <motion.div 
                whileHover={{ y: -4 }}
                key={artist.name}
                className="group flex flex-col items-center text-center space-y-3 cursor-pointer"
              >
                <div className="aspect-square w-full rounded-full overflow-hidden bg-m3-surface-variant shadow-md border-4 border-m3-surface">
                  {artist.coverUrl ? (
                    <img src={artist.coverUrl} alt={artist.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User className="text-m3-on-surface-variant" size={48} />
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-m3-on-surface truncate leading-tight">{artist.name}</h4>
                  <p className="text-xs text-m3-on-surface-variant uppercase tracking-wider font-bold">
                    {artist.songIds.length} Songs
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
