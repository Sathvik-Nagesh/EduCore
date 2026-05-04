import { openDB } from 'idb';

const DB_NAME = 'educore-offline-db';
const STORE_NAME = 'attendance-queue';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function addToQueue(classId: string, absentIds: string[]) {
  const db = await initDB();
  await db.add(STORE_NAME, {
    classId,
    absentIds,
    timestamp: Date.now(),
  });
}

export async function getQueue() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function clearQueueItem(id: number) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}
