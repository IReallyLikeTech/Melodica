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
  // Try to request permissions if running on Median.co
  if (window.median) {
    try {
      // Common Median.co permission request for storage
      // This helps ensure the system picker has access to the device's music folder
      (window as any).median?.permissions?.request({ 
        permissions: ['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.READ_MEDIA_AUDIO'] 
      });
    } catch (e) {
      console.warn('Median permission request failed', e);
    }
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    // Critical for Android: narrow down the picker to audio files only.
    // This prevents the system from offering 'Camera' as an option.
    input.accept = 'audio/*,.mp3,.flac,.wav,.ogg,.aac,.m4a,.wma';
    
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
