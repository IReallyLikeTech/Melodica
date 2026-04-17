import React from 'react';
import { useMusicStore } from '../store';
import { ChevronLeft, Play, Music, MoreVertical, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDuration } from '../lib/utils';

interface DetailsViewProps {
  type: 'album' | 'artist' | 'playlist';
  id: string;
}

export const DetailsView: React.FC<DetailsViewProps> = ({ type, id }) => {
  const { songs, albums, artists, playlists, goBack, playSong, playAlbum, playArtist, playPlaylist } = useMusicStore();

  const data = React.useMemo(() => {
    if (type === 'album') {
      const album = albums.find(a => `${a.name}-${a.artist}` === id);
      if (!album) return null;
      return {
        title: album.name,
        subtitle: album.artist,
        coverUrl: album.coverUrl,
        songs: songs.filter(s => album.songIds.includes(s.id)),
        onPlayAll: () => playAlbum(album)
      };
    } else if (type === 'artist') {
      const artist = artists.find(a => a.name === id);
      if (!artist) return null;
      return {
        title: artist.name,
        subtitle: `${artist.songIds.length} Songs • ${artist.albums.length} Albums`,
        coverUrl: artist.coverUrl,
        songs: songs.filter(s => artist.songIds.includes(s.id)),
        onPlayAll: () => playArtist(artist)
      };
    } else {
      const playlist = playlists.find(p => p.id === id);
      if (!playlist) return null;
      return {
        title: playlist.name,
        subtitle: `Playlist • ${playlist.songIds.length} tracks`,
        coverUrl: undefined,
        songs: songs.filter(s => playlist.songIds.includes(s.id)),
        onPlayAll: () => playPlaylist(playlist)
      };
    }
  }, [type, id, albums, artists, playlists, songs]);

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-m3-surface overflow-auto no-scrollbar pb-32">
      {/* Header Sticky */}
      <div className="sticky top-0 z-40 bg-m3-surface/80 backdrop-blur-xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={goBack}
            className="p-3 bg-m3-surface-variant/30 text-m3-on-surface-variant rounded-full hover:bg-m3-surface-variant/50 transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold truncate tracking-tight text-m3-on-surface"
          >
            {data.title}
          </motion.h2>
        </div>
        
        <button 
          onClick={data.onPlayAll}
          className="h-12 w-12 bg-m3-primary text-m3-on-primary rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Play size={20} fill="currentColor" />
        </button>
      </div>

      <div className="px-6 py-4 flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "h-64 w-64 md:h-80 md:w-80 shadow-[0_24px_48px_rgba(0,0,0,0.2)] bg-m3-surface-variant flex items-center justify-center overflow-hidden shrink-0",
            type === 'artist' ? "rounded-full" : "rounded-[64px]"
          )}
        >
          {data.coverUrl ? (
            <img src={data.coverUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            type === 'artist' ? <Music size={80} className="opacity-10" /> : <Disc size={80} className="opacity-10" />
          )}
        </motion.div>
        
        <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
          <div className="inline-block px-3 py-1 rounded-full bg-m3-primary/10 text-m3-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
            {type}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-m3-on-surface leading-[0.9]">{data.title}</h1>
          <p className="text-base md:text-xl text-m3-on-surface-variant font-bold opacity-70 tracking-tight">{data.subtitle}</p>
        </div>
      </div>

      <div className="px-6 space-y-2">
        <div className="flex items-center px-4 py-2 border-b border-m3-outline/10 mb-4 text-[10px] font-black uppercase tracking-widest text-m3-on-surface-variant opacity-40">
          <span className="w-10">#</span>
          <span className="flex-1">Title</span>
          <span>Time</span>
          <span className="w-12 ml-4"></span>
        </div>
        
        {data.songs.map((song, idx) => (
          <motion.div 
            key={song.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => playSong(song, data.songs)}
            className="flex items-center p-4 rounded-[24px] hover:bg-m3-primary-container/40 active:bg-m3-primary-container/60 transition-all cursor-pointer group"
          >
            <div className="w-10 text-sm font-black opacity-30 tracking-tighter">{idx + 1}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate text-m3-on-surface tracking-tight">{song.title}</h4>
              <p className="text-xs font-bold opacity-60 truncate tracking-tight text-m3-on-surface-variant">{song.artist}</p>
            </div>
            <div className="text-xs font-black opacity-40 font-mono tracking-tighter">{formatDuration(song.duration)}</div>
            <button className="ml-4 p-2 opacity-0 group-hover:opacity-100 transition-all text-m3-on-surface-variant hover:bg-m3-surface-variant rounded-full">
              <MoreVertical size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
