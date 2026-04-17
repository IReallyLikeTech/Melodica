import React, { useState, useMemo } from 'react';
import { useMusicStore } from '../store';
import { Music, Disc, User, Play, MoreVertical, Plus, FolderPlus, FilePlus, Heart, Trash2, Copy, X, SortAsc, Check } from 'lucide-react';
import { cn, formatDuration } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { pickMusic, scanFiles } from '../services/musicScanner';

export const LibraryView: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'songs' | 'albums' | 'artists'>('songs');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  
  const { songs, albums, artists, playSong, setSongs, removeSongs, toggleFavorite } = useMusicStore();

  const [songSort, setSongSort] = useState<'title' | 'artist' | 'album' | 'dateAdded'>('dateAdded');
  const [albumSort, setAlbumSort] = useState<'name' | 'artist' | 'year'>('name');
  const [artistSort, setArtistSort] = useState<'name' | 'songs'>('name');

  const segments = [
    { id: 'songs', label: 'Songs', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: User },
  ] as const;

  // Sorting logic
  const sortedSongs = useMemo(() => {
    return [...songs].sort((a, b) => {
      if (songSort === 'title') return a.title.localeCompare(b.title);
      if (songSort === 'artist') return a.artist.localeCompare(b.artist);
      if (songSort === 'album') return a.album.localeCompare(b.album);
      if (songSort === 'dateAdded') return b.dateAdded - a.dateAdded;
      return 0;
    });
  }, [songs, songSort]);

  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => {
      if (albumSort === 'name') return a.name.localeCompare(b.name);
      if (albumSort === 'artist') return a.artist.localeCompare(b.artist);
      if (albumSort === 'year') return (b.year || 0) - (a.year || 0);
      return 0;
    });
  }, [albums, albumSort]);

  const sortedArtists = useMemo(() => {
    return [...artists].sort((a, b) => {
      if (artistSort === 'name') return a.name.localeCompare(b.name);
      if (artistSort === 'songs') return b.songIds.length - a.songIds.length;
      return 0;
    });
  }, [artists, artistSort]);

  // Duplicate detection logic
  const duplicateGroups = useMemo(() => {
    const groups = new Map<string, typeof songs>();
    songs.forEach(s => {
      const key = `${s.title.toLowerCase()}-${s.artist.toLowerCase()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    });
    return Array.from(groups.values()).filter(g => g.length > 1);
  }, [songs]);

  const handleAddMusic = async (type: 'files' | 'folder') => {
    try {
      setShowAddMenu(false);
      const files = await pickMusic({ type });
      if (files.length === 0) return;

      setIsAdding(true);
      const newSongs = await scanFiles(files);
      setSongs([...songs, ...newSongs]);
    } catch (error) {
      console.error('Failed to add music:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-m3-surface relative">
      <div className="sticky top-0 z-20 bg-m3-surface/80 backdrop-blur-md px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-m3-on-surface">Your Library</h1>
          <div className="flex items-center gap-2">
            {duplicateGroups.length > 0 && (
              <button 
                onClick={() => setShowDuplicates(true)}
                className="p-3 bg-m3-surface-variant/30 text-m3-primary rounded-2xl flex items-center gap-2 transition-all active:scale-95"
              >
                <Copy size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">{duplicateGroups.length} Duplicates</span>
              </button>
            )}
            
            {/* Sort Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={cn(
                  "p-3 rounded-2xl transition-all active:scale-95",
                  showSortMenu ? "bg-m3-secondary-container text-m3-on-secondary-container" : "bg-m3-surface-variant/30 text-m3-on-surface-variant"
                )}
              >
                <SortAsc size={24} />
              </button>
              
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-14 w-56 bg-m3-surface border border-m3-outline/20 rounded-3xl shadow-xl z-50 overflow-hidden py-2"
                  >
                    <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-m3-on-surface-variant/60">Sort by</div>
                    
                    {activeSegment === 'songs' && [
                      { id: 'dateAdded', label: 'Date Added' },
                      { id: 'title', label: 'Title' },
                      { id: 'artist', label: 'Artist' },
                      { id: 'album', label: 'Album' },
                    ].map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => { setSongSort(opt.id as any); setShowSortMenu(false); }}
                        className="flex items-center justify-between w-full px-5 py-3 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                      >
                        <span className={cn("font-medium", songSort === opt.id && "text-m3-primary")}>{opt.label}</span>
                        {songSort === opt.id && <Check size={18} className="text-m3-primary" />}
                      </button>
                    ))}
                    
                    {activeSegment === 'albums' && [
                      { id: 'name', label: 'Name' },
                      { id: 'artist', label: 'Artist' },
                      { id: 'year', label: 'Year' },
                    ].map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => { setAlbumSort(opt.id as any); setShowSortMenu(false); }}
                        className="flex items-center justify-between w-full px-5 py-3 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                      >
                        <span className={cn("font-medium", albumSort === opt.id && "text-m3-primary")}>{opt.label}</span>
                        {albumSort === opt.id && <Check size={18} className="text-m3-primary" />}
                      </button>
                    ))}
                    
                    {activeSegment === 'artists' && [
                      { id: 'name', label: 'Name' },
                      { id: 'songs', label: 'Song Count' },
                    ].map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => { setArtistSort(opt.id as any); setShowSortMenu(false); }}
                        className="flex items-center justify-between w-full px-5 py-3 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                      >
                        <span className={cn("font-medium", artistSort === opt.id && "text-m3-primary")}>{opt.label}</span>
                        {artistSort === opt.id && <Check size={18} className="text-m3-primary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="p-3 bg-m3-primary-container text-m3-on-primary-container rounded-2xl hover:shadow-md transition-all active:scale-95"
              >
                <Plus size={24} />
              </button>
              
              <AnimatePresence>
                {showAddMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-14 w-48 bg-m3-surface border border-m3-outline/20 rounded-3xl shadow-xl z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => handleAddMusic('folder')}
                      className="flex items-center gap-3 w-full p-4 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                    >
                      <FolderPlus size={18} />
                      <span className="font-medium">Add Folder</span>
                    </button>
                    <button 
                      onClick={() => handleAddMusic('files')}
                      className="flex items-center gap-3 w-full p-4 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors border-t border-m3-outline/10"
                    >
                      <FilePlus size={18} />
                      <span className="font-medium">Add Songs</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
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
        {isAdding && (
          <div className="flex items-center justify-center p-8 text-m3-primary gap-3">
            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Importing music...</span>
          </div>
        )}
        {activeSegment === 'songs' && (
          <div className="space-y-1">
            {sortedSongs.map((song) => (
              <div 
                key={song.id}
                onClick={() => playSong(song, sortedSongs)}
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
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song.id);
                  }}
                  className={cn(
                    "ml-2 p-2 rounded-full hover:bg-m3-on-surface-variant/10 transition-colors",
                    song.isFavorite ? "text-m3-primary" : "text-m3-on-surface-variant"
                  )}
                >
                  <Heart 
                    size={20} 
                    fill={song.isFavorite ? "currentColor" : "none"} 
                  />
                </button>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSongId(selectedSongId === song.id ? null : song.id);
                    }}
                    className="p-2 rounded-full hover:bg-m3-on-surface-variant/10 text-m3-on-surface-variant transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  <AnimatePresence>
                    {selectedSongId === song.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                        className="absolute right-full top-0 mr-2 bg-m3-surface border border-m3-outline/20 rounded-2xl shadow-xl z-30 min-w-[140px] overflow-hidden"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSongs([song.id]);
                            setSelectedSongId(null);
                          }}
                          className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm font-medium">Remove from Library</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Duplicate Scanner Modal */}
        <AnimatePresence>
          {showDuplicates && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="w-full max-w-lg bg-m3-surface rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_-8px_32px_rgba(0,0,0,0.15)]"
              >
                <div className="p-6 border-b border-m3-outline/10 flex justify-between items-center bg-m3-secondary-container/10">
                  <div>
                    <h2 className="text-xl font-bold text-m3-on-surface">Duplicate Scanner</h2>
                    <p className="text-sm text-m3-on-surface-variant">{duplicateGroups.length} Potential duplicates found</p>
                  </div>
                  <button onClick={() => setShowDuplicates(false)} className="p-2 rounded-full hover:bg-m3-surface-variant/50"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-auto p-4 space-y-6">
                  {duplicateGroups.map((group, idx) => (
                    <div key={idx} className="bg-m3-surface-variant/10 rounded-3xl p-4 border border-m3-outline/5 space-y-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-1 bg-m3-primary/30 flex-1 rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-m3-primary opacity-60">Group {idx + 1}</span>
                        <div className="h-1 bg-m3-primary/30 flex-1 rounded-full" />
                      </div>
                      
                      {group.map(song => (
                        <div key={song.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-m3-surface-variant/20 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-m3-surface-variant flex items-center justify-center">
                              {song.coverUrl ? <img src={song.coverUrl} className="w-full h-full object-cover" /> : <Music size={18} />}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold truncate">{song.title}</p>
                              <p className="text-[10px] text-m3-on-surface-variant truncate uppercase tracking-tighter">{(song.size / (1024 * 1024)).toFixed(1)} MB • {song.format}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeSongs([song.id])}
                            className="p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-90 transition-all"
                            title="Remove from Library"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-m3-surface-variant/5">
                  <button 
                    onClick={() => setShowDuplicates(false)}
                    className="w-full py-4 bg-m3-primary text-m3-on-primary rounded-full font-bold shadow-lg active:scale-[0.98] transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeSegment === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sortedAlbums.map((album) => (
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
            {sortedArtists.map((artist) => (
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
