import type { BackupData, Settings, TreeNode } from '@/types';

const DB_NAME = 'sulm-alsuud-db';
const DB_VERSION = 2;
const STORE_NODES = 'nodes';
const STORE_SETTINGS = 'settings';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // Clean up old v1 stores if present
      if (db.objectStoreNames.contains('courses')) db.deleteObjectStore('courses');
      if (db.objectStoreNames.contains('sections')) db.deleteObjectStore('sections');
      if (db.objectStoreNames.contains('lessons')) db.deleteObjectStore('lessons');
      if (!db.objectStoreNames.contains(STORE_NODES)) {
        db.createObjectStore(STORE_NODES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

function all<T>(store: string): Promise<T[]> {
  return tx<T[]>(store, 'readonly', (s) => s.getAll());
}
function get<T>(store: string, id: string): Promise<T | undefined> {
  return tx<T | undefined>(store, 'readonly', (s) => s.get(id));
}
function put<T>(store: string, value: T): Promise<void> {
  return tx<void>(store, 'readwrite', (s) => s.put(value as unknown as object));
}
function del(store: string, id: string): Promise<void> {
  return tx<void>(store, 'readwrite', (s) => s.delete(id));
}
function clearStore(store: string): Promise<void> {
  return tx<void>(store, 'readwrite', (s) => s.clear());
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const nodesRepo = {
  all: () => all<TreeNode>(STORE_NODES),
  put: (n: TreeNode) => put(STORE_NODES, n),
  remove: (id: string) => del(STORE_NODES, id),
  clear: () => clearStore(STORE_NODES),
};

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  default_sort: 'importance',
  reminder_enabled: true,
  reminder_days: 7,
  dark_mode: 'auto',
};

export const settingsRepo = {
  get: async (): Promise<Settings> =>
    (await get<Settings>(STORE_SETTINGS, 'app')) ?? DEFAULT_SETTINGS,
  put: (s: Settings) => put(STORE_SETTINGS, s),
};

export async function deleteNodeCascade(
  nodeId: string,
  allNodes: TreeNode[],
): Promise<void> {
  const toDelete: string[] = [nodeId];
  const collect = (pid: string) => {
    for (const n of allNodes) {
      if (n.parent_id === pid) {
        toDelete.push(n.id);
        collect(n.id);
      }
    }
  };
  collect(nodeId);
  await Promise.all(toDelete.map((id) => nodesRepo.remove(id)));
}

export async function exportBackup(): Promise<BackupData> {
  const [nodes, settings] = await Promise.all([
    nodesRepo.all(),
    settingsRepo.get(),
  ]);
  return {
    version: DB_VERSION,
    exported_at: new Date().toISOString(),
    nodes,
    settings,
  };
}

export async function importBackup(data: BackupData): Promise<void> {
  if (!data || typeof data !== 'object') throw new Error('ملف غير صالح');
  if (!Array.isArray(data.nodes)) throw new Error('ملف النسخة الاحتياطية غير صالح');
  await clearStore(STORE_NODES);
  await Promise.all(data.nodes.map((n) => nodesRepo.put(n)));
  if (data.settings) await settingsRepo.put(data.settings);
}

export async function deleteAllData(): Promise<void> {
  await clearStore(STORE_NODES);
}
