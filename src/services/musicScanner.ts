import { Song } from '../types';
import { extractMetadata } from './metadata';

export async function scanFiles(files: File[], onProgress?: (count: number) => void): Promise<Song[]> {
  const songs: Song[] = [];
  let count = 0;

  const audioFiles = files.filter(file => 
    file.type.startsWith('audio/') || 
    /\.(mp3|flac|wav|ogg|aac|m4a|wma)$/i.test(file.name)
  );

  for (const file of audioFiles) {
    try {
      const metadata = await extractMetadata(file);
      
      // Skip files < 30s as requested by app logic
      if (metadata.duration && metadata.duration < 30) continue;

      songs.push({
        id: crypto.randomUUID(),
        file,
        path: (file as any).webkitRelativePath || file.name,
        ...metadata as any
      });
      
      count++;
      onProgress?.(count);
    } catch (err) {
      console.error('Error processing file:', file.name, err);
    }
  }

  return songs;
}

export async function pickMusic(options: { type: 'files' | 'folder' }): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    if (options.type === 'folder') {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (!isMobile) {
        input.webkitdirectory = true;
      }
    }

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      resolve(files);
    };

    // Handle cancel
    input.oncancel = () => resolve([]);
    
    input.click();
  });
}
