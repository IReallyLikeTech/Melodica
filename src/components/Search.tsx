import React, { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, X, Music, History, Play, Disc, User, Heart, Trash2, MoreVertical } from 'lucide-react';
import { useMusicStore } from '../store';
import { formatDuration, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const { songs, albums, artists, playSong, recentSearches, addRecentSearch, clearRecentSearches, toggleFavorite, removeSongs } = useMusicStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return { songs: [], albums: [], artists: [], topResult: null };
    const q = debouncedQuery.toLowerCase();
    
    const filteredSongs = songs.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.artist.toLowerCase().includes(q) || 
      s.album.toLowerCase().includes(q) ||
      s.genre?.toLowerCase().includes(q)
    );

    const filteredAlbums = albums.filter(a => 
      a.name.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );

    const filteredArtists = artists.filter(art => 
      art.name.toLowerCase().includes(q)
    );

    // Find top result (highest match priority: exact title > starts with title > artist)
    let topResult = null;
    if (filteredSongs.length > 0) {
      topResult = { type: 'song', data: filteredSongs[0] };
    } else if (filteredArtists.length > 0) {
      topResult = { type: 'artist', data: filteredArtists[0] };
    } else if (filteredAlbums.length > 0) {
      topResult = { type: 'album', data: filteredAlbums[0] };
    }

    return {
      songs: filteredSongs.slice(0, 5),
      albums: filteredAlbums.slice(0, 3),
      artists: filteredArtists.slice(0, 3),
      topResult
    };
  }, [debouncedQuery, songs, albums, artists]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) addRecentSearch(q);
  };

  return (
    <div className="flex flex-col h-full bg-m3-surface overflow-auto no-scrollbar">
      <div className="p-4 sticky top-0 z-20 bg-m3-surface">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-m3-on-surface-variant">
            <SearchIcon size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search songs, artists, albums..."
            className="w-full h-14 bg-m3-surface-variant/30 rounded-full pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-m3-primary/50 text-m3-on-surface font-medium placeholder:text-m3-on-surface-variant/50 transition-all shadow-sm"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-m3-on-surface-variant p-1 rounded-full hover:bg-m3-surface-variant"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pb-32">
        {!debouncedQuery && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {recentSearches.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface-variant px-2">Recent Searches</h2>
                  <button onClick={clearRecentSearches} className="text-xs font-bold text-m3-primary px-2 py-1 rounded-full hover:bg-m3-primary-container transition-colors">Clear All</button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((q) => (
                    <button 
                      key={q}
                      onClick={() => setQuery(q)}
                      className="flex items-center gap-4 w-full p-3 rounded-2xl hover:bg-m3-surface-variant/30 text-m3-on-surface transition-colors"
                    >
                      <History size={18} className="text-m3-on-surface-variant" />
                      <span className="font-medium">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center pt-20 text-m3-on-surface-variant space-y-4">
              <div className="h-24 w-24 rounded-4xl bg-m3-surface-variant/20 flex items-center justify-center">
                <Music size={40} className="opacity-30" />
              </div>
              <p className="font-semibold text-lg">Sound search</p>
              <p className="text-sm opacity-60">Find your favorite tracks</p>
            </div>
          </div>
        )}

        {debouncedQuery && results.songs.length === 0 && results.albums.length === 0 && results.artists.length === 0 && (
          <div className="text-center pt-20 text-m3-on-surface-variant">
            <p className="text-lg font-medium">No matches found</p>
            <p className="text-sm opacity-60">Try different keywords</p>
          </div>
        )}

        {debouncedQuery && (results.songs.length > 0 || results.albums.length > 0 || results.artists.length > 0) && (
          <div className="space-y-8 pt-4">
            {/* Top Result */}
            {results.topResult && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface-variant px-2">Top Result</h2>
                <div 
                  onClick={() => {
                    if (results.topResult?.type === 'song') playSong(results.topResult.data as any);
                  }}
                  className="bg-m3-secondary-container/40 p-4 rounded-3xl flex items-center gap-4 cursor-pointer hover:bg-m3-secondary-container/60 transition-all border border-m3-outline/5 shadow-sm"
                >
                  <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-md shrink-0 bg-m3-surface-variant">
                    {(results.topResult.data as any).coverUrl ? (
                      <img src={(results.topResult.data as any).coverUrl} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><SearchIcon size={32} /></div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-xl font-bold text-m3-on-surface truncate">
                      {results.topResult.type === 'song' ? (results.topResult.data as any).title : (results.topResult.data as any).name}
                    </h3>
                    <p className="text-m3-on-surface-variant font-medium">
                      {results.topResult.type === 'song' ? (results.topResult.data as any).artist : results.topResult.type.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Songs Section */}
            {results.songs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface-variant px-2">Songs</h2>
                <div className="space-y-1">
                  {results.songs.map((song) => (
                    <div 
                      key={song.id}
                      onClick={() => playSong(song, results.songs)}
                      className="flex items-center p-3 rounded-2xl hover:bg-m3-primary-container/30 transition-colors cursor-pointer group"
                    >
                      <div className="h-12 w-12 min-w-[48px] rounded-xl overflow-hidden bg-m3-surface-variant flex items-center justify-center shadow-sm">
                        {song.coverUrl ? (
                          <img src={song.coverUrl} className="h-full w-full object-cover" />
                        ) : (
                          <Music size={20} className="text-m3-on-surface-variant" />
                        )}
                        <Play size={16} className="absolute text-white opacity-0 group-hover:opacity-100 fill-white transition-opacity" />
                      </div>
                      <div className="ml-4 flex-1 overflow-hidden font-medium">
                        <h4 className="font-semibold text-m3-on-surface truncate leading-tight">{song.title}</h4>
                        <p className="text-sm text-m3-on-surface-variant truncate leading-tight">{song.artist}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song.id);
                          }}
                          className={cn(
                            "p-2 rounded-full hover:bg-m3-on-surface-variant/10 transition-colors",
                            song.isFavorite ? "text-m3-primary" : "text-m3-on-surface-variant"
                          )}
                        >
                          <Heart 
                            size={18} 
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
                            <MoreVertical size={18} />
                          </button>
                          
                          <AnimatePresence>
                            {selectedSongId === song.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: -10 }}
                                className="absolute right-full top-0 mr-2 bg-m3-surface border border-m3-outline/20 rounded-2xl shadow-xl z-30 min-w-[120px] overflow-hidden"
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
                                  <span className="text-xs font-bold">Remove from Library</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Albums Section */}
            {results.albums.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface-variant px-2">Albums</h2>
                <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
                  {results.albums.map((album) => (
                    <div key={album.name} className="flex-none w-36 space-y-2 group cursor-pointer">
                      <div className="aspect-square w-full rounded-2xl overflow-hidden bg-m3-surface-variant shadow-sm transition-transform group-active:scale-95">
                        {album.coverUrl ? (
                          <img src={album.coverUrl} className="h-full w-full object-cover" />
                        ) : (
                          <Disc size={32} className="m-auto text-m3-on-surface-variant" />
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-m3-on-surface truncate">{album.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artists Section */}
            {results.artists.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-m3-on-surface-variant px-2">Artists</h2>
                <div className="space-y-1">
                  {results.artists.map((artist) => (
                    <div key={artist.name} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-m3-surface-variant/30 cursor-pointer">
                      <div className="h-14 w-14 rounded-full overflow-hidden bg-m3-surface-variant shadow-sm">
                        {artist.coverUrl ? (
                          <img src={artist.coverUrl} className="h-full w-full object-cover" />
                        ) : (
                          <User size={24} className="m-auto text-m3-on-surface-variant" />
                        )}
                      </div>
                      <h4 className="font-bold text-m3-on-surface">{artist.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
