import React, { useState, useMemo } from 'react';
import { useMusicStore } from '../store';
import { Song } from '../types';
import { Music, Disc, User, Play, MoreVertical, Plus, FolderPlus, FilePlus, Heart, Trash2, Copy, X, SortAsc, Check, ListMusic, PlusCircle, Edit2 } from 'lucide-react';
import { cn, formatDuration } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { pickMusic, scanFiles } from '../services/musicScanner';
import { PlaylistMenu } from './PlaylistMenu';

export const LibraryView: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'songs' | 'albums' | 'artists' | 'playlists'>('songs');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [playlistToAddTo, setPlaylistToAddTo] = useState<string | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const { songs, albums, artists, playlists, playSong, setSongs, removeSongs, toggleFavorite, createPlaylist, deletePlaylist, renamePlaylist, removeSongFromPlaylist, navigateTo } = useMusicStore();

  const [songSort, setSongSort] = useState<'title' | 'artist' | 'album' | 'dateAdded'>('dateAdded');
  const [albumSort, setAlbumSort] = useState<'name' | 'artist' | 'year'>('name');
  const [artistSort, setArtistSort] = useState<'name' | 'songs'>('name');

  const segments = [
    { id: 'songs', label: 'Songs', icon: Music },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: User },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
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

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
    }
  };

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
    <div className="flex flex-col h-full bg-m3-surface relative overflow-hidden">
      <div className="sticky top-0 z-20 bg-m3-surface/80 backdrop-blur-md px-6 py-8 space-y-6">
        {playlistToAddTo && (
          <PlaylistMenu 
            songId={playlistToAddTo} 
            onClose={() => setPlaylistToAddTo(null)} 
          />
        )}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-m3-on-surface tracking-tight">Library</h1>
          <div className="flex items-center gap-3">
            {duplicateGroups.length > 0 && (
              <button 
                onClick={() => setShowDuplicates(true)}
                className="p-3 bg-m3-primary/10 text-m3-primary rounded-2xl flex items-center gap-2 transition-all active:scale-95"
              >
                <Copy size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">{duplicateGroups.length} Duplicates</span>
              </button>
            )}
            
            {/* Sort Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={cn(
                  "p-4 rounded-[24px] transition-all active:scale-95",
                  showSortMenu ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-md" : "bg-m3-surface-variant/40 text-m3-on-surface-variant"
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
                    className="absolute right-0 top-16 w-64 bg-m3-surface border border-m3-outline/20 rounded-[32px] shadow-2xl z-50 overflow-hidden py-3"
                  >
                    <div className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-m3-on-surface-variant/60">Sort by</div>
                    
                    {activeSegment === 'songs' && [
                      { id: 'dateAdded', label: 'Recently Added' },
                      { id: 'title', label: 'Title' },
                      { id: 'artist', label: 'Artist' },
                      { id: 'album', label: 'Album' },
                    ].map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => { setSongSort(opt.id as any); setShowSortMenu(false); }}
                        className="flex items-center justify-between w-full px-6 py-4 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                      >
                        <span className={cn("font-bold text-sm", songSort === opt.id ? "text-m3-primary" : "text-m3-on-surface")}>{opt.label}</span>
                        {songSort === opt.id && <Check size={18} className="text-m3-primary" />}
                      </button>
                    ))}

                    {activeSegment === 'albums' && [
                      { id: 'name', label: 'Album Title' },
                      { id: 'artist', label: 'Artist Name' },
                      { id: 'year', label: 'Release Year' },
                    ].map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => { setAlbumSort(opt.id as any); setShowSortMenu(false); }}
                        className="flex items-center justify-between w-full px-6 py-4 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                      >
                        <span className={cn("font-bold text-sm", albumSort === opt.id ? "text-m3-primary" : "text-m3-on-surface")}>{opt.label}</span>
                        {albumSort === opt.id && <Check size={18} className="text-m3-primary" />}
                      </button>
                    ))}

                    {activeSegment === 'artists' && [
                      { id: 'name', label: 'Artist Name' },
                      { id: 'songs', label: 'Track Count' },
                    ].map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => { setArtistSort(opt.id as any); setShowSortMenu(false); }}
                        className="flex items-center justify-between w-full px-6 py-4 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                      >
                        <span className={cn("font-bold text-sm", artistSort === opt.id ? "text-m3-primary" : "text-m3-on-surface")}>{opt.label}</span>
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
                className="p-4 bg-m3-primary text-m3-on-primary rounded-[24px] shadow-lg active:scale-95 transition-all"
              >
                <Plus size={24} />
              </button>
              
              <AnimatePresence>
                {showAddMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-16 w-64 bg-m3-surface border border-m3-outline/20 rounded-[32px] shadow-2xl z-50 overflow-hidden py-3"
                  >
                    <button 
                      onClick={() => handleAddMusic('folder')}
                      className="flex items-center gap-4 w-full p-4 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                    >
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><FolderPlus size={20} /></div>
                      <span className="font-bold text-sm">Add Folder</span>
                    </button>
                    <button 
                      onClick={() => handleAddMusic('files')}
                      className="flex items-center gap-4 w-full p-4 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors border-t border-m3-outline/10"
                    >
                      <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><FilePlus size={20} /></div>
                      <span className="font-bold text-sm">Add Songs</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="flex p-1.5 bg-m3-surface-variant/20 rounded-[28px] w-full max-w-lg">
          {segments.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSegment(s.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-black transition-all duration-300",
                activeSegment === s.id 
                  ? "bg-m3-secondary-container text-m3-on-secondary-container shadow-md" 
                  : "text-m3-on-surface-variant hover:bg-m3-surface-variant/50"
              )}
            >
              <s.icon size={20} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-32 pt-4 scroll-smooth no-scrollbar">
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
                        className="absolute right-full top-0 mr-2 bg-m3-surface border border-m3-outline/20 rounded-2xl shadow-xl z-30 min-w-[180px] overflow-hidden"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlaylistToAddTo(song.id);
                            setSelectedSongId(null);
                          }}
                          className="flex items-center gap-3 w-full p-3 hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                        >
                          <ListMusic size={16} />
                          <span className="text-sm font-medium">Add to Playlist</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSongs([song.id]);
                            setSelectedSongId(null);
                          }}
                          className="flex items-center gap-3 w-full p-3 hover:bg-red-500/10 text-red-500 transition-colors border-t border-m3-outline/10"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-12 pb-12">
            {sortedAlbums.map((album) => (
              <motion.div 
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                key={`${album.name}-${album.artist}`}
                onClick={() => navigateTo({ type: 'album', albumId: `${album.name}-${album.artist}` })}
                className="group space-y-4 cursor-pointer"
              >
                <div className="aspect-square w-full rounded-[48px] overflow-hidden bg-m3-surface-variant shadow-lg group-hover:shadow-2xl transition-all duration-500 relative">
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.name} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Disc className="text-m3-on-surface-variant opacity-20" size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
                    <div className="bg-m3-primary text-m3-on-primary p-5 rounded-full shadow-2xl">
                      <Play size={28} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="px-1 text-center">
                  <h4 className="font-bold text-m3-on-surface truncate leading-tight text-lg">{album.name}</h4>
                  <p className="text-sm text-m3-on-surface-variant truncate font-medium opacity-80">{album.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeSegment === 'artists' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-12 pb-12">
            {sortedArtists.map((artist) => (
              <motion.div 
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                key={artist.name}
                onClick={() => navigateTo({ type: 'artist', artistName: artist.name })}
                className="group flex flex-col items-center text-center space-y-4 cursor-pointer"
              >
                <div className="aspect-square w-full rounded-full overflow-hidden bg-m3-surface-variant shadow-lg border-8 border-m3-surface group-hover:shadow-2xl transition-all duration-500 relative">
                  {artist.coverUrl ? (
                    <img src={artist.coverUrl} alt={artist.name} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User className="text-m3-on-surface-variant opacity-20" size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
                    <div className="bg-m3-primary text-m3-on-primary p-5 rounded-full shadow-2xl">
                      <Play size={28} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-m3-on-surface truncate leading-tight text-lg">{artist.name}</h4>
                  <p className="text-xs text-m3-on-surface-variant uppercase tracking-[0.2em] font-black opacity-60">
                    {artist.songIds.length} Tracks
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeSegment === 'playlists' && (
          <div className="space-y-10 pb-12">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreatingPlaylist(true)}
              className="flex items-center justify-center gap-4 w-full p-10 rounded-[48px] bg-m3-primary/5 text-m3-primary border-4 border-dashed border-m3-primary/20 hover:bg-m3-primary/10 transition-all font-black text-xl group"
            >
              <div className="p-4 bg-m3-primary/10 rounded-full group-hover:bg-m3-primary group-hover:text-m3-on-primary transition-all">
                <Plus size={32} />
              </div>
              New Playlist
            </motion.button>

            <AnimatePresence>
              {isCreatingPlaylist && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleCreatePlaylist} className="p-10 bg-m3-surface-variant/20 rounded-[48px] border border-m3-outline/10 space-y-8">
                    <h3 className="text-2xl font-bold tracking-tight">Create Playlist</h3>
                    <input 
                      autoFocus
                      type="text"
                      placeholder="What should we call it?"
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                      className="w-full h-20 bg-m3-surface px-8 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-m3-primary/20 text-m3-on-surface font-bold text-2xl border border-m3-outline/10"
                    />
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setIsCreatingPlaylist(false)}
                        className="flex-1 py-5 bg-m3-surface text-m3-on-surface font-bold rounded-[28px] hover:bg-m3-surface-variant/30 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-5 bg-m3-primary text-m3-on-primary font-bold rounded-[28px] shadow-xl active:scale-95 transition-all"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {playlists.map((playlist) => (
                <motion.div 
                  key={playlist.id}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo({ type: 'playlist', playlistId: playlist.id })}
                  className="bg-m3-surface-variant/15 p-8 rounded-[56px] border border-m3-outline/5 hover:border-m3-outline/20 hover:shadow-2xl transition-all group relative cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-[32px] bg-m3-secondary-container flex items-center justify-center text-m3-on-secondary-container shadow-inner group-hover:rotate-3 transition-transform">
                      <ListMusic size={48} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-2xl truncate tracking-tight">{playlist.name}</h4>
                      <p className="text-sm opacity-60 font-black uppercase tracking-[0.2em]">{playlist.songIds.length} tracks</p>
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlaylistId(selectedPlaylistId === playlist.id ? null : playlist.id);
                        }}
                        className="p-4 rounded-full hover:bg-m3-surface-variant/50 text-m3-on-surface-variant transition-colors"
                      >
                        <MoreVertical size={28} />
                      </button>
                      
                      <AnimatePresence>
                        {selectedPlaylistId === playlist.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: -10 }}
                            className="absolute right-full top-0 mr-4 bg-m3-surface border border-m3-outline/20 rounded-[32px] shadow-[0_16px_48px_rgba(0,0,0,0.2)] z-30 min-w-[200px] overflow-hidden p-3"
                          >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newName = prompt('Enter new name', playlist.name);
                                if (newName) renamePlaylist(playlist.id, newName);
                                setSelectedPlaylistId(null);
                              }}
                              className="flex items-center gap-4 w-full p-4 hover:bg-m3-surface-variant/30 text-m3-on-surface rounded-2xl transition-colors"
                            >
                              <Edit2 size={20} />
                              <span className="text-base font-bold text-m3-on-surface">Rename</span>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this playlist?')) deletePlaylist(playlist.id);
                                setSelectedPlaylistId(null);
                              }}
                              className="flex items-center gap-4 w-full p-4 hover:bg-red-500/10 text-red-500 rounded-2xl transition-colors"
                            >
                                <Trash2 size={20} />
                                <span className="text-base font-bold">Delete</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-m3-outline/10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        playPlaylist(playlist);
                      }}
                      className="w-full py-5 bg-m3-primary text-m3-on-primary rounded-[32px] font-black flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                      <Play size={24} fill="currentColor" />
                      Listen Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
