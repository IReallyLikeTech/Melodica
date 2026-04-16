import React, { useState } from 'react';
import { FolderOpen, Music, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { extractMetadata } from '../services/metadata';
import { useMusicStore } from '../store';
import { Song } from '../types';

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [count, setCount] = useState(0);
  const { setSongs } = useMusicStore();

  const handleFolderSelect = async () => {
    try {
      // Create a hidden input
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      
      // webkitdirectory is for desktop folder selection. 
      // On mobile/Android, it often degrades to single file selection or fails.
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (!isMobile) {
        input.webkitdirectory = true;
      }

      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        
        // Sync with Median Native Datastore if available
        if (window.median?.datastore) {
          window.median.datastore.set({ library_initialized: true, song_count: files.length });
        }

        const audioFiles = files.filter(file => 
          file.type.startsWith('audio/') || 
          /\.(mp3|flac|wav|ogg|aac|m4a|wma)$/i.test(file.name)
        );

        if (audioFiles.length === 0) {
          // Alert user if no music files found
          return;
        }

        setScanning(true);
        const songs: Song[] = [];

        for (const file of audioFiles) {
          try {
            const metadata = await extractMetadata(file);
            
            // Skip files < 30s as requested
            if (metadata.duration && metadata.duration < 30) continue;

            songs.push({
              id: crypto.randomUUID(),
              file,
              path: (file as any).webkitRelativePath || file.name,
              ...metadata as any
            });
            setCount(prev => prev + 1);
          } catch (err) {
            console.error('Error processing file:', file.name, err);
          }
        }

        setSongs(songs);
        onComplete();
      };

      input.click();
    } catch (error) {
      console.error('Scanning failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-m3-surface z-50 flex flex-col items-center justify-center p-6 pb-20 overflow-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-4xl bg-m3-primary-container flex items-center justify-center text-m3-on-primary-container">
            <Music size={48} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-m3-on-surface">Melodica</h1>
          <p className="text-m3-on-surface-variant text-lg">
            Your music, your way. Beautifully organized and always ready.
          </p>
        </div>

        {!scanning ? (
          <div className="space-y-6">
            <div className="bg-m3-surface-variant/30 p-6 rounded-3xl space-y-4 text-left">
              <div className="flex gap-4">
                <ShieldCheck className="text-m3-primary shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-m3-on-surface">Local First</h3>
                  <p className="text-sm text-m3-on-surface-variant">We only scan folders you select. Your data never leaves your device.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <FolderOpen className="text-m3-primary shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-m3-on-surface">Music Discovery</h3>
                  <p className="text-sm text-m3-on-surface-variant">Supports MP3, FLAC, WAV, AAC, and more metadata-rich formats.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleFolderSelect}
              className="w-full h-14 bg-m3-primary text-m3-on-primary rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              Select Music Folder
              <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-2 w-full bg-m3-surface-variant rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-m3-primary"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>
              <p className="text-m3-on-surface-variant font-medium">Scanning your library...</p>
            </div>
            <div className="text-5xl font-bold text-m3-primary">
              {count}
            </div>
            <p className="text-m3-on-surface-variant uppercase tracking-widest text-xs font-bold">Songs Found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
