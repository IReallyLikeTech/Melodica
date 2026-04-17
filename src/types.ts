import { IAudioMetadata } from 'music-metadata-browser';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
  discNumber?: number;
  duration: number;
  bitrate?: number;
  sampleRate?: number;
  format: string;
  path: string;
  size: number;
  file: File;
  coverUrl?: string;
  dominantColor?: string;
  isFavorite?: boolean;
  dateAdded: number;
}

export interface Album {
  name: string;
  artist: string;
  year?: number;
  coverUrl?: string;
  songIds: string[];
  dominantColor?: string;
}

export interface Artist {
  name: string;
  songIds: string[];
  albums: string[];
  coverUrl?: string;
}

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'buffering';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerTheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
}

declare global {
  interface Window {
    median?: {
      datastore?: {
        set: (data: { [key: string]: any }) => void;
        get: (data: { key: string }) => void;
      };
      filePicker?: {
        show: (options: any) => void;
      };
    };
  }
}
