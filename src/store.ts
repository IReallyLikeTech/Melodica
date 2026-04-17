import { create } from 'zustand';
import { Song, Album, Artist, Playlist, PlaybackState, RepeatMode, PlayerTheme, ViewState } from './types';
import { saveSongs, getAllSongs, deleteSongFromDB, updateSong, savePlaylist, deletePlaylistFromDB, getAllPlaylists } from './services/db';
import { generateThemeFromColor } from './lib/colorUtils';

interface MusicStore {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  queue: Song[];
  history: Song[];
  currentIndex: number;
  playbackState: PlaybackState;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  activeSong: Song | null;
  playerTheme: PlayerTheme;
  volume: number;
  recentSearches: string[];
  isLoading: boolean;
  
  // Navigation
  currentView: ViewState;
  viewHistory: ViewState[];
  navigateTo: (view: ViewState) => void;
  goBack: () => void;
  
  // Actions
  loadSongs: () => Promise<void>;
  setSongs: (songs: Song[], persist?: boolean) => void;
  removeSongs: (ids: string[]) => void;
  toggleFavorite: (songId: string) => void;
  
  // Playlist Actions
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  renamePlaylist: (id: string, name: string) => void;

  playSong: (song: Song, fromList?: Song[]) => void;
  playAlbum: (album: Album) => void;
  playArtist: (artist: Artist) => void;
  playPlaylist: (playlist: Playlist) => void;
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
  playlists: [],
  queue: [],
  history: [],
  currentIndex: -1,
  playbackState: 'idle',
  repeatMode: 'off',
  isShuffle: false,
  activeSong: null,
  playerTheme: {
    primary: '#6750A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
    secondary: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
  },
  volume: 0.7,
  recentSearches: [],
  isLoading: true,
  
  currentView: { type: 'home' },
  viewHistory: [],

  navigateTo: (view) => {
    const { currentView, viewHistory } = get();
    // Don't push same view twice
    if (JSON.stringify(currentView) === JSON.stringify(view)) return;
    
    set({ 
      currentView: view,
      viewHistory: [...viewHistory, currentView]
    });
  },

  goBack: () => {
    const { viewHistory } = get();
    if (viewHistory.length === 0) return;
    
    const newHistory = [...viewHistory];
    const prevView = newHistory.pop()!;
    
    set({ 
      currentView: prevView,
      viewHistory: newHistory
    });
  },

  loadSongs: async () => {
    set({ isLoading: true });
    try {
      const persistedSongs = await getAllSongs() as Song[];
      if (persistedSongs && persistedSongs.length > 0) {
        // Ensure all songs have dateAdded (migration)
        const initializedSongs = persistedSongs.map(s => {
          if (s.dateAdded === undefined) {
            return { ...s, dateAdded: 0 } as Song;
          }
          return s as Song;
        });

        // First batch set songs so UI is populated with metadata immediately
        get().setSongs(initializedSongs, false);

        // Then, in the background, regenerate cover URLs as they are session-bound
        // We do this in smaller chunks to avoid blocking the main thread
        const { extractCover, getDominantColor } = await import('./services/metadata');
        
        const updatedSongs = [...initializedSongs];
        let hasChanges = false;

        for (let i = 0; i < updatedSongs.length; i++) {
          const song = updatedSongs[i];
          if (song.file) {
            const newCoverUrl = await extractCover(song.file);
            if (newCoverUrl) {
              updatedSongs[i] = { ...song, coverUrl: newCoverUrl };
              // Also extract dominant color if missing
              if (!song.dominantColor) {
                const color = await getDominantColor(newCoverUrl);
                updatedSongs[i].dominantColor = color;
              }
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
      // Load Playlists
      const persistedPlaylists = await getAllPlaylists();
      set({ playlists: persistedPlaylists || [], isLoading: false });
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

    createPlaylist: (name) => {
      const newPlaylist: Playlist = {
        id: crypto.randomUUID(),
        name,
        songIds: [],
        createdAt: Date.now()
      };
      const updatedPlaylists = [...get().playlists, newPlaylist];
      set({ playlists: updatedPlaylists });
      savePlaylist(newPlaylist).catch(err => console.error('Failed to save playlist:', err));
    },

    deletePlaylist: (id) => {
      const updatedPlaylists = get().playlists.filter(p => p.id !== id);
      set({ playlists: updatedPlaylists });
      deletePlaylistFromDB(id).catch(err => console.error('Failed to delete playlist:', err));
    },

    addSongToPlaylist: (playlistId, songId) => {
      const playlists = get().playlists;
      const index = playlists.findIndex(p => p.id === playlistId);
      if (index === -1) return;

      const playlist = playlists[index];
      if (playlist.songIds.includes(songId)) return;

      const updatedPlaylist = { ...playlist, songIds: [...playlist.songIds, songId] };
      const updatedPlaylists = [...playlists];
      updatedPlaylists[index] = updatedPlaylist;

      set({ playlists: updatedPlaylists });
      savePlaylist(updatedPlaylist).catch(err => console.error('Failed to update playlist:', err));
    },

    removeSongFromPlaylist: (playlistId, songId) => {
      const playlists = get().playlists;
      const index = playlists.findIndex(p => p.id === playlistId);
      if (index === -1) return;

      const playlist = playlists[index];
      const updatedPlaylist = { ...playlist, songIds: playlist.songIds.filter(id => id !== songId) };
      const updatedPlaylists = [...playlists];
      updatedPlaylists[index] = updatedPlaylist;

      set({ playlists: updatedPlaylists });
      savePlaylist(updatedPlaylist).catch(err => console.error('Failed to update playlist:', err));
    },

    renamePlaylist: (id, name) => {
      const playlists = get().playlists;
      const index = playlists.findIndex(p => p.id === id);
      if (index === -1) return;

      const updatedPlaylist = { ...playlists[index], name };
      const updatedPlaylists = [...playlists];
      updatedPlaylists[index] = updatedPlaylist;

      set({ playlists: updatedPlaylists });
      savePlaylist(updatedPlaylist).catch(err => console.error('Failed to rename playlist:', err));
    },

    playSong: (song, fromList) => {
    const list = fromList || get().songs;
    const index = list.findIndex(s => s.id === song.id);
    
    // Update theme
    const theme = song.dominantColor ? generateThemeFromColor(song.dominantColor) : get().playerTheme;

    set({
      activeSong: song,
      playerTheme: theme,
      queue: list,
      currentIndex: index,
      playbackState: 'playing'
    });
  },

  playAlbum: (album) => {
    const albumSongs = get().songs.filter(s => album.songIds.includes(s.id));
    if (albumSongs.length > 0) {
      get().playSong(albumSongs[0], albumSongs);
    }
  },

  playArtist: (artist) => {
    const artistSongs = get().songs.filter(s => artist.songIds.includes(s.id));
    if (artistSongs.length > 0) {
      get().playSong(artistSongs[0], artistSongs);
    }
  },

  playPlaylist: (playlist) => {
    const playlistSongs = get().songs.filter(s => playlist.songIds.includes(s.id));
    if (playlistSongs.length > 0) {
      get().playSong(playlistSongs[0], playlistSongs);
    }
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

    const nextSong = queue[nextIndex];
    const theme = nextSong.dominantColor ? generateThemeFromColor(nextSong.dominantColor) : get().playerTheme;

    set({
      currentIndex: nextIndex,
      activeSong: nextSong,
      playerTheme: theme,
      playbackState: 'playing'
    });
  },

  prevSong: () => {
    const { currentIndex, queue } = get();
    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;

    const prevSong = queue[prevIndex];
    const theme = prevSong.dominantColor ? generateThemeFromColor(prevSong.dominantColor) : get().playerTheme;

    set({
      currentIndex: prevIndex,
      activeSong: prevSong,
      playerTheme: theme,
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
