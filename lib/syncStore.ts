import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface SyncState {
  status: SyncStatus;
  setStatus: (status: SyncStatus) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),
}));
