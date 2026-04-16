import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, X, Music } from 'lucide-react';
import { useMusicStore } from '../store';
import { formatDuration } from '../lib/utils';

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const { songs, playSong } = useMusicStore();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return songs.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.artist.toLowerCase().includes(q) || 
      s.album.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query, songs]);

  return (
    <div className="flex flex-col h-full bg-m3-surface">
      <div className="p-4 sticky top-0 z-20 bg-m3-surface">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-m3-on-surface-variant">
            <SearchIcon size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full h-14 bg-m3-surface-variant/30 rounded-full pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-m3-primary/50 text-m3-on-surface font-medium placeholder:text-m3-on-surface-variant/50 transition-all"
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

      <div className="flex-1 overflow-auto px-4 pb-32">
        {!query && (
          <div className="flex flex-col items-center justify-center pt-20 text-m3-on-surface-variant space-y-4">
            <div className="h-20 w-20 rounded-full bg-m3-surface-variant/30 flex items-center justify-center">
              <SearchIcon size={32} className="opacity-40" />
            </div>
            <p className="font-medium">Discover your collection</p>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center pt-20 text-m3-on-surface-variant">
            No results found for "{query}"
          </div>
        )}

        <div className="space-y-1 pt-2">
          {results.map((song) => (
            <div 
              key={song.id}
              onClick={() => playSong(song, results)}
              className="flex items-center p-3 rounded-2xl hover:bg-m3-primary-container/30 active:bg-m3-primary-container/50 transition-colors cursor-pointer"
            >
              <div className="h-12 w-12 min-w-[48px] rounded-xl overflow-hidden bg-m3-surface-variant flex items-center justify-center">
                {song.coverUrl ? (
                  <img src={song.coverUrl} className="h-full w-full object-cover" />
                ) : (
                  <Music className="text-m3-on-surface-variant" size={24} />
                )}
              </div>
              <div className="ml-4 flex-1 overflow-hidden">
                <h4 className="font-semibold text-m3-on-surface truncate line-clamp-1">{song.title}</h4>
                <p className="text-sm text-m3-on-surface-variant truncate">{song.artist}</p>
              </div>
              <div className="ml-4 text-xs text-m3-on-surface-variant font-medium">
                {formatDuration(song.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
