import * as mm from 'music-metadata-browser';
import { Song } from '../types';

export async function extractMetadata(file: File): Promise<Partial<Song>> {
  try {
    const metadata = await mm.parseBlob(file);
    const { common, format } = metadata;

    let coverUrl: string | undefined;
    const cover = mm.selectCover(common.picture);
    if (cover) {
      const blob = new Blob([cover.data], { type: cover.format });
      coverUrl = URL.createObjectURL(blob);
    }

    return {
      title: common.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      albumArtist: common.albumartist,
      genre: common.genre?.[0],
      year: common.year,
      trackNumber: common.track.no || undefined,
      discNumber: common.disk.no || undefined,
      duration: format.duration || 0,
      bitrate: format.bitrate,
      sampleRate: format.sampleRate,
      format: format.container || file.type.split('/')[1] || 'unknown',
      size: file.size,
      coverUrl,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: file.name,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0,
      format: 'unknown',
      size: file.size,
    };
  }
}

export async function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('#6750A4');
        
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        resolve('#6750A4'); // Default M3 primary
      }
    };
    img.onerror = () => resolve('#6750A4');
  });
}
