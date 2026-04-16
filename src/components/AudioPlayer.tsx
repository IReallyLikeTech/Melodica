import React, { useEffect, useRef } from 'react';
import { useMusicStore } from '../store';

export const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { activeSong, playbackState, volume, nextSong, togglePlay } = useMusicStore();

  useEffect(() => {
    if (!audioRef.current || !activeSong) return;

    const audio = audioRef.current;
    
    // Create blob URL for the file to play
    const url = URL.createObjectURL(activeSong.file);
    audio.src = url;
    
    if (playbackState === 'playing') {
      audio.play().catch(console.error);
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [activeSong]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playbackState === 'playing') {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [playbackState]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  const handleEnded = () => {
    nextSong();
  };

  return (
    <audio 
      ref={audioRef} 
      onEnded={handleEnded}
      hidden
    />
  );
};
