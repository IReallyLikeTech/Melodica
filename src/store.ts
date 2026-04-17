import { create } from 'zustand';
import { Song, Album, Artist, PlaybackState, RepeatMode } from './types';
import { saveSongs, getAllSongs, deleteSongFromDB, updateSong } from './services/db';

interface MusicStore {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  queue: Song[];
  history: Song[];
  currentIndex: number;
  playbackState: PlaybackState;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  activeSong: Song | null;
  volume: number;
  recentSearches: string[];
  isLoading: boolean;
  
  // Actions
  loadSongs: () => Promise<void>;
  setSongs: (songs: Song[], persist?: boolean) => void;
  removeSongs: (ids: string[]) => void;
  toggleFavorite: (songId: string) => void;
  playSong: (song: Song, fromList?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  songs: [],
  albums: [],
  artists: [],
  queue: [],
  history: [],
  currentIndex: -1,
  playbackState: 'idle',
  repeatMode: 'off',
  isShuffle: false,
  activeSong: null,
  volume: 0.7,
  recentSearches: [],
  isLoading: true,

  loadSongs: async () => {
    set({ isLoading: true });
    try {
      const persistedSongs = await getAllSongs() as Song[];
      if (persistedSongs && persistedSongs.length > 0) {
        // First batch set songs so UI is populated with metadata immediately
        get().setSongs(persistedSongs, false);

        // Then, in the background, regenerate cover URLs as they are session-bound
        // We do this in smaller chunks to avoid blocking the main thread
        const { extractCover } = await import('./services/metadata');
        
        const updatedSongs = [...persistedSongs];
        let hasChanges = false;

        for (let i = 0; i < updatedSongs.length; i++) {
          const song = updatedSongs[i];
          if (song.file) {
            const newCoverUrl = await extractCover(song.file);
            if (newCoverUrl) {
              updatedSongs[i] = { ...song, coverUrl: newCoverUrl };
              hasChanges = true;
            }
          }
          
          // Periodically update the store so covers appear as they are processed
          if (i % 20 === 0 && hasChanges) {
            get().setSongs([...updatedSongs], false);
          }
        }

        if (hasChanges) {
          get().setSongs(updatedSongs, false);
        }
      }
    } catch (error) {
      console.error('Failed to load songs from DB:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSongs: (songs, persist = true) => {
    if (persist) {
      saveSongs(songs).catch(err => console.error('Failed to save songs to DB:', err));
    }
    
    // Generate Albums and Artists
    const albumMap = new Map<string, Album>();
    const artistMap = new Map<string, Artist>();

    songs.forEach(song => {
      // Album grouping
      const albumKey = `${song.album}-${song.artist}`;
      if (!albumMap.has(albumKey)) {
        albumMap.set(albumKey, {
          name: song.album,
          artist: song.artist,
          year: song.year,
          coverUrl: song.coverUrl,
          songIds: [song.id],
          dominantColor: song.dominantColor
        });
      } else {
        albumMap.get(albumKey)!.songIds.push(song.id);
      }

      // Artist grouping
      if (!artistMap.has(song.artist)) {
        artistMap.set(song.artist, {
          name: song.artist,
          songIds: [song.id],
          albums: [song.album],
          coverUrl: song.coverUrl
        });
      } else {
        const artist = artistMap.get(song.artist)!;
        artist.songIds.push(song.id);
        if (!artist.albums.includes(song.album)) artist.albums.push(song.album);
      }
    });

      set({ 
        songs, 
        albums: Array.from(albumMap.values()), 
        artists: Array.from(artistMap.values()) 
      });
    },

    removeSongs: async (ids) => {
      const { songs, activeSong } = get();
      const updatedSongs = songs.filter(s => !ids.includes(s.id));
      
      // Remove from DB
      await Promise.all(ids.map(id => deleteSongFromDB(id)));
      
      // Update UI
      get().setSongs(updatedSongs, false);

      // If active song is deleted, stop playback
      if (activeSong && ids.includes(activeSong.id)) {
        set({ activeSong: null, playbackState: 'idle' });
      }
    },

    toggleFavorite: async (songId) => {
      const { songs, activeSong, queue } = get();
      const songIndex = songs.findIndex(s => s.id === songId);
      if (songIndex === -1) return;

      const updatedSong = { ...songs[songIndex], isFavorite: !songs[songIndex].isFavorite };
      const updatedSongs = [...songs];
      updatedSongs[songIndex] = updatedSong;

      // Update DB
      await updateSong(updatedSong);

      // Update Queue if song is in it
      const updatedQueue = queue.map(s => s.id === songId ? updatedSong : s);
      
      // Update Active Song if it matches
      const updatedActiveSong = activeSong?.id === songId ? updatedSong : activeSong;

      // Update UI (force refresh)
      set({ 
        songs: updatedSongs,
        queue: updatedQueue,
        activeSong: updatedActiveSong
      });

      // Recalculate albums/artists
      get().setSongs(updatedSongs, false);
    },

    playSong: (song, fromList) => {
    const list = fromList || get().songs;
    const index = list.findIndex(s => s.id === song.id);
    set({
      activeSong: song,
      queue: list,
      currentIndex: index,
      playbackState: 'playing'
    });
  },

  togglePlay: () => {
    const { playbackState, activeSong } = get();
    if (!activeSong) return;
    set({ playbackState: playbackState === 'playing' ? 'paused' : 'playing' });
  },

  nextSong: () => {
    const { currentIndex, queue, repeatMode, isShuffle } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') nextIndex = 0;
      else return set({ playbackState: 'idle' });
    }

    set({
      currentIndex: nextIndex,
      activeSong: queue[nextIndex],
      playbackState: 'playing'
    });
  },

  prevSong: () => {
    const { currentIndex, queue } = get();
    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;

    set({
      currentIndex: prevIndex,
      activeSong: queue[prevIndex],
      playbackState: 'playing'
    });
  },

  setRepeatMode: (mode) => set({ repeatMode: mode }),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  setVolume: (volume) => set({ volume }),
  
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  clearQueue: () => set({ queue: [], currentIndex: -1, activeSong: null, playbackState: 'idle' }),
  
  addRecentSearch: (query) => {
    if (!query.trim()) return;
    const newSearches = [query, ...get().recentSearches.filter(q => q !== query)].slice(0, 5);
    set({ recentSearches: newSearches });
    
    // Sync with Median Datastore if available
    if (window.median?.datastore) {
      window.median.datastore.set({ recent_searches: newSearches });
    }
  },
  
  clearRecentSearches: () => {
    set({ recentSearches: [] });
    if (window.median?.datastore) {
      window.median.datastore.set({ recent_searches: [] });
    }
  },
}));
