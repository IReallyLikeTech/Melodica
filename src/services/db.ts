import { openDB, IDBPDatabase } from 'idb';
import { Song } from '../types';

const DB_NAME = 'melodica-db';
const STORE_NAME = 'songs';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveSongs(songs: Song[]) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const song of songs) {
    // In modern browsers (including Android WebView), File/Blob can be stored directly
    await tx.store.put(song);
  }
  await tx.done;
}

export async function updateSong(song: Song) {
  const db = await initDB();
  return db.put(STORE_NAME, song);
}

export async function deleteSongFromDB(id: string) {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
}

export async function getAllSongs(): Promise<Partial<Song>[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
