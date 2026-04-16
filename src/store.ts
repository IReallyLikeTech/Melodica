import { create } from 'zustand';
import { Song, Album, Artist, PlaybackState, RepeatMode } from './types';

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
  
  // Actions
  setSongs: (songs: Song[]) => void;
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

  setSongs: (songs) => {
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
    set((state) => ({
      recentSearches: [query, ...state.recentSearches.filter(q => q !== query)].slice(0, 5)
    }));
  },
  
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
