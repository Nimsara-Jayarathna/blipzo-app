export type SyncState = {
  isSyncing: boolean;
  message?: string;
  progress?: {
    current: number;
    total: number;
  };
};

type SyncListener = (state: SyncState) => void;

let syncState: SyncState = { isSyncing: false };
const listeners = new Set<SyncListener>();

export const setSyncState = (next: Partial<SyncState>) => {
  syncState = { ...syncState, ...next };
  listeners.forEach(listener => listener(syncState));
};

export const subscribeSync = (listener: SyncListener) => {
  listeners.add(listener);
  listener(syncState);
  return () => {
    listeners.delete(listener);
  };
};

export const getSyncState = () => syncState;
