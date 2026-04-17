import React, { useState } from 'react';
import { useMusicStore } from '../store';
import { Plus, X, ListMusic, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface PlaylistMenuProps {
  songId: string;
  onClose: () => void;
}

export const PlaylistMenu: React.FC<PlaylistMenuProps> = ({ songId, onClose }) => {
  const { playlists, createPlaylist, addSongToPlaylist } = useMusicStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreate(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-sm bg-m3-surface rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[70vh] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-m3-outline/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-m3-on-surface">Add to Playlist</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-m3-surface-variant/50"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {playlists.map(playlist => {
            const isAdded = playlist.songIds.includes(songId);
            return (
              <button 
                key={playlist.id}
                onClick={() => {
                  if (!isAdded) addSongToPlaylist(playlist.id, songId);
                  onClose();
                }}
                className={cn(
                  "flex items-center justify-between w-full p-4 rounded-2xl transition-all",
                  isAdded ? "bg-m3-primary/10 text-m3-primary" : "hover:bg-m3-surface-variant/30 text-m3-on-surface"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-m3-surface-variant/50 flex items-center justify-center">
                    <ListMusic size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{playlist.name}</p>
                    <p className="text-xs opacity-60 font-medium">{playlist.songIds.length} tracks</p>
                  </div>
                </div>
                {isAdded && <Check size={20} />}
              </button>
            );
          })}

          <AnimatePresence>
            {!showCreate ? (
              <button 
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-m3-primary/10 text-m3-primary transition-all border-2 border-dashed border-m3-primary/20 mt-2"
              >
                <div className="h-12 w-12 rounded-xl bg-m3-primary/10 flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <span className="font-bold">Create new playlist</span>
              </button>
            ) : (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-m3-surface-variant/20 rounded-2xl space-y-4 mt-2"
                onSubmit={handleCreate}
              >
                <input 
                  autoFocus
                  type="text"
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  className="w-full h-12 bg-m3-surface px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-m3-primary text-m3-on-surface font-bold"
                />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 bg-m3-surface text-m3-on-surface font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-m3-primary text-m3-on-primary font-bold rounded-xl"
                  >
                    Create
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
