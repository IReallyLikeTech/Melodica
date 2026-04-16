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
    // We don't store the actual File object in IDB easily for persists
    // But we store the metadata. On relaunch, if the handle is gone, we might need a rescan
    // Or we store the File handle if using File System Access API
    await tx.store.put({
      ...song,
      file: null // Files can't be stored directly in many IDB implementations without hurdles
    });
  }
  await tx.done;
}

export async function getAllSongs(): Promise<Partial<Song>[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
