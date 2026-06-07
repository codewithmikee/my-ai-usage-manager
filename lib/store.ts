import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cycle, ZoneId } from './cycles';
import { migrateV1toV2 } from './migration';

export interface AccountLimit {
  until: number | null;
  trippedAt: number;
  notified: boolean;
}

export interface Account {
  id: string;
  name: string;
  limits: Record<string, AccountLimit>;
  // New session-based fields
  sessions?: Record<string, SessionItem>;
  // Legacy fields preserved for migration/interop
  availableAt: number | null;
  notified?: boolean;
  nextResetAt?: number | null;
  nextResetNotified?: boolean;
}

export interface SessionItem {
  cycleId: string;
  state: 'available' | 'reached';
  reachedAt: number | null;
  availableAt: number | null;
}

export interface Product {
  id: string;
  name: string;
  cycles: Cycle[];
  accounts: Account[];
}

interface StoreState {
  products: Product[];
  addProduct: (name?: string, cycles?: Cycle[]) => string;
  setProductCycles: (productId: string, cycles: Cycle[]) => void;
  updateProduct: (id: string, name: string) => void;
  removeProduct: (id: string) => void;
  addAccount: (productId: string, name?: string) => void;
  updateAccount: (productId: string, accountId: string, name: string) => void;
  setLimit: (productId: string, accountId: string, cycleId: string, until: number | null) => void;
  clearLimit: (productId: string, accountId: string, cycleId: string) => void;
  clearExpiredLimits: () => void;
  // New session-based methods
  addCycle: (productId: string, cycle: Cycle) => string;
  removeCycle: (productId: string, cycleId: string) => void;
  updateCycle: (productId: string, cycleId: string, cycle: Partial<Cycle>) => void;
  addSession: (productId: string, accountId: string, cycleId: string) => void;
  removeSession: (productId: string, accountId: string, cycleId: string) => void;
  toggleSessionState: (productId: string, accountId: string, cycleId: string) => void;
  setSessionAvailableAt: (productId: string, accountId: string, cycleId: string, timestamp: number | null) => void;
  // Deprecated legacy setters
  setAvailableAt: (productId: string, accountId: string, timestamp: number | null) => void;
  setNextResetAt: (productId: string, accountId: string, timestamp: number | null) => void;
  removeAccount: (productId: string, accountId: string) => void;
  markNotified: (productId: string, accountId: string, cycleId?: string) => void;
  markNextResetNotified: (productId: string, accountId: string) => void;
  settings: {
    showCountdown: boolean;
    timezoneMode: 'system' | 'manual';
    timezone: ZoneId;
  };
  updateSettings: (settings: Partial<StoreState['settings']>) => void;
  importData: (importedProducts: any, overwrite: boolean) => { success: boolean; count: number };
  cleanupLegacyFields: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: [],
      settings: {
        showCountdown: false,
        timezoneMode: 'system',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      addProduct: (name, cycles) => {
        const newId = generateId();
        set((state) => ({
          products: [
            ...state.products,
            { id: newId, name: name || 'New Product', cycles: cycles || [{ id: 'lock', name: 'Lock', durationMs: null, color: 'amber' }], accounts: [] },
          ],
        }));
        return newId;
      },
      setProductCycles: (productId, cycles) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, cycles } : p
          ),
        })),
      updateProduct: (id, name) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      addAccount: (productId, name) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: [
                    ...p.accounts,
                    { id: generateId(), name: name || 'New Account', availableAt: null, limits: {}, sessions: {} },
                  ],
                }
              : p
          ),
        })),
      updateAccount: (productId, accountId, name) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId ? { ...a, name } : a
                  ),
                }
              : p
          ),
        })),
      setLimit: (productId, accountId, cycleId, until) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId
                      ? {
                          ...a,
                          limits: {
                            ...a.limits,
                            [cycleId]: { until, trippedAt: Date.now(), notified: false },
                          },
                          // Mirror to legacy availableAt if it's the primary 'lock' or '5h'
                          availableAt: (cycleId === 'lock' || cycleId === '5h') ? until : a.availableAt,
                        }
                      : a
                  ),
                }
              : p
          ),
        })),
      clearLimit: (productId, accountId, cycleId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId
                      ? {
                          ...a,
                          limits: {
                            ...a.limits,
                            [cycleId]: { until: null, trippedAt: Date.now(), notified: false },
                          },
                          availableAt: (cycleId === 'lock' || cycleId === '5h') ? null : a.availableAt,
                        }
                      : a
                  ),
                }
              : p
          ),
        })),
      clearExpiredLimits: () =>
        set((state) => {
          const now = Date.now();
          const newProducts = state.products.map((p) => {
            const newAccounts = p.accounts.map((a) => {
              let accountChanged = false;
              const newLimits = { ...a.limits };
              Object.entries(newLimits).forEach(([cid, lim]) => {
                if (lim.until !== null && lim.until <= now) {
                  newLimits[cid] = { ...lim, until: null };
                  accountChanged = true;
                }
              });
              if (accountChanged) {
                return { 
                  ...a, 
                  limits: newLimits, 
                  availableAt: (newLimits['lock']?.until === null || newLimits['5h']?.until === null) ? null : a.availableAt 
                };
              }
              return a;
            });
            return { ...p, accounts: newAccounts };
          });
          return { products: newProducts };
        }),
      setAvailableAt: (productId, accountId, timestamp) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId ? { ...a, availableAt: timestamp, notified: false } : a
                  ),
                }
              : p
          ),
        })),
      setNextResetAt: (productId, accountId, timestamp) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId ? { ...a, nextResetAt: timestamp, nextResetNotified: false } : a
                  ),
                }
              : p
          ),
        })),
      removeAccount: (productId, accountId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.filter((a) => a.id !== accountId),
                }
              : p
          ),
        })),
      addCycle: (productId, cycle) => {
        const newId = cycle.id || generateId();
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? { ...p, cycles: [...p.cycles, { ...cycle, id: newId }] }
              : p
          ),
        }));
        return newId;
      },
      removeCycle: (productId, cycleId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  cycles: p.cycles.filter((c) => c.id !== cycleId),
                  accounts: p.accounts.map((a) => {
                    const newSessions = { ...a.sessions };
                    delete newSessions[cycleId];
                    return { ...a, sessions: newSessions };
                  }),
                }
              : p
          ),
        })),
      updateCycle: (productId, cycleId, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  cycles: p.cycles.map((c) =>
                    c.id === cycleId ? { ...c, ...updates } : c
                  ),
                }
              : p
          ),
        })),
      addSession: (productId, accountId, cycleId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId
                      ? {
                          ...a,
                          sessions: {
                            ...a.sessions,
                            [cycleId]: {
                              cycleId,
                              state: 'available',
                              reachedAt: null,
                              availableAt: null,
                            },
                          },
                        }
                      : a
                  ),
                }
              : p
          ),
        })),
      removeSession: (productId, accountId, cycleId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId
                      ? {
                          ...a,
                          sessions: Object.fromEntries(
                            Object.entries(a.sessions || {}).filter(
                              ([cid]) => cid !== cycleId
                            )
                          ),
                        }
                      : a
                  ),
                }
              : p
          ),
        })),
      toggleSessionState: (productId, accountId, cycleId) =>
        set((state) => {
          return {
            products: state.products.map((p) =>
              p.id === productId
                ? {
                    ...p,
                    accounts: p.accounts.map((a) => {
                      if (a.id === accountId) {
                        const session = a.sessions?.[cycleId];
                        if (!session) return a;
                        
                        const newState = session.state === 'available' ? 'reached' : 'available';
                        const cycle = p.cycles.find(c => c.id === cycleId);
                        let availableAt = null;
                        
                        if (newState === 'reached' && cycle?.durationMs) {
                          availableAt = Date.now() + cycle.durationMs;
                        }
                        
                        return {
                          ...a,
                          sessions: {
                            ...a.sessions,
                            [cycleId]: {
                              ...session,
                              state: newState,
                              reachedAt: newState === 'reached' ? Date.now() : null,
                              availableAt,
                            },
                          },
                        };
                      }
                      return a;
                    }),
                  }
                : p
            ),
          };
        }),
      setSessionAvailableAt: (productId, accountId, cycleId, timestamp) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId
                      ? {
                          ...a,
                          sessions: {
                            ...a.sessions,
                            [cycleId]: {
                              ...(a.sessions?.[cycleId] || {
                                cycleId,
                                state: 'available',
                                reachedAt: null,
                              }),
                              availableAt: timestamp,
                            },
                          },
                        }
                      : a
                  ),
                }
              : p
          ),
        })),
      markNotified: (productId, accountId, cycleId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId 
                      ? { 
                          ...a, 
                          notified: cycleId === 'lock' || cycleId === '5h' ? true : a.notified,
                          limits: cycleId ? {
                            ...a.limits,
                            [cycleId]: { ...a.limits[cycleId], notified: true }
                          } : a.limits
                        } 
                      : a
                  ),
                }
              : p
          ),
        })),
      markNextResetNotified: (productId, accountId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId ? { ...a, nextResetNotified: true } : a
                  ),
                }
              : p
          ),
        })),
      importData: (importedProducts, overwrite) => {
        let count = 0;
        let success = false;
        
        set((state) => {
          let validProducts: Product[] = [];
          if (Array.isArray(importedProducts)) {
            // Apply migration logic to imported data if it's in the old format
            const migratedState = migrateV1toV2({ products: importedProducts });
            const products = migratedState.products;

            products.forEach((p: any) => {
              if (p && typeof p === 'object' && typeof p.name === 'string') {
                const accountsArray: Account[] = [];
                if (Array.isArray(p.accounts)) {
                  p.accounts.forEach((a: any) => {
                    if (a && typeof a === 'object' && typeof a.name === 'string') {
                      accountsArray.push({
                        id: a.id && typeof a.id === 'string' ? a.id : generateId(),
                        name: a.name,
                        limits: a.limits || {},
                        sessions: a.sessions || {},
                        availableAt: a.availableAt ?? null,
                        notified: !!a.notified,
                        nextResetAt: a.nextResetAt ?? null,
                        nextResetNotified: !!a.nextResetNotified,
                      });
                    }
                  });
                }
                validProducts.push({
                  id: p.id && typeof p.id === 'string' ? p.id : generateId(),
                  name: p.name,
                  cycles: p.cycles || [{ id: 'lock', name: 'Lock', durationMs: null, color: 'amber' }],
                  accounts: accountsArray,
                });
              }
            });
          }

          if (validProducts.length === 0) {
            return {};
          }

          count = validProducts.length;
          success = true;

          if (overwrite) {
            return { products: validProducts };
          } else {
            const existingIds = new Set(state.products.map((p) => p.id));
            const existingAccountIds = new Set(state.products.flatMap((p) => p.accounts.map((a) => a.id)));

            const sanitizedMerged = validProducts.map((p) => {
              const needNewProductId = existingIds.has(p.id);
              const newProductId = needNewProductId ? generateId() : p.id;
              if (!needNewProductId) {
                existingIds.add(p.id);
              }
              
              const sanitizedAccounts = p.accounts.map((a) => {
                const needNewAccountId = existingAccountIds.has(a.id);
                const newAccountId = needNewAccountId ? generateId() : a.id;
                if (!needNewAccountId) {
                  existingAccountIds.add(a.id);
                }
                return {
                  ...a,
                  id: newAccountId,
                };
              });

              return {
                ...p,
                id: newProductId,
                accounts: sanitizedAccounts,
              };
            });

            return {
              products: [...state.products, ...sanitizedMerged]
            };
          }
        });

        return { success, count };
      },
      cleanupLegacyFields: () =>
        set((state) => ({
          products: state.products.map((p) => ({
            ...p,
            accounts: p.accounts.map((a) => {
              const { availableAt, notified, nextResetAt, nextResetNotified, ...rest } = a;
              return rest as Account;
            }),
          })),
        })),
    }),
    {
      name: 'limit-tracker-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          return migrateV1toV2(persistedState);
        }
        return persistedState;
      },
    }
  )
);
