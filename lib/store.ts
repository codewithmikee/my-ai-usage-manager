import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Account {
  id: string;
  name: string;
  availableAt: number | null; // Timestamp, null means currently available
  notified?: boolean;
  nextResetAt?: number | null; // Optional: scheduled limit reset time
  nextResetNotified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  accounts: Account[];
}

interface StoreState {
  products: Product[];
  addProduct: () => void;
  updateProduct: (id: string, name: string) => void;
  removeProduct: (id: string) => void;
  addAccount: (productId: string, name?: string) => void;
  updateAccount: (productId: string, accountId: string, name: string) => void;
  setAvailableAt: (productId: string, accountId: string, timestamp: number | null) => void;
  setNextResetAt: (productId: string, accountId: string, timestamp: number | null) => void;
  removeAccount: (productId: string, accountId: string) => void;
  markNotified: (productId: string, accountId: string) => void;
  markNextResetNotified: (productId: string, accountId: string) => void;
  settings: {
    showCountdown: boolean;
  };
  updateSettings: (settings: Partial<StoreState['settings']>) => void;
  importData: (importedProducts: any, overwrite: boolean) => { success: boolean; count: number };
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: [
        {
          id: generateId(),
          name: 'Claude 3.5 Sonnet',
          accounts: [
            { id: generateId(), name: 'Work Account', availableAt: null },
            { id: generateId(), name: 'Personal', availableAt: Date.now() + 1000 * 60 * 60 * 2 },
          ],
        },
        {
          id: generateId(),
          name: 'Gemini Advanced',
          accounts: [
            { id: generateId(), name: 'Main Account', availableAt: null },
          ],
        },
      ],
      settings: {
        showCountdown: false,
      },
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      addProduct: () =>
        set((state) => ({
          products: [
            ...state.products,
            { id: generateId(), name: 'New Product', accounts: [] },
          ],
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
                    { id: generateId(), name: name || 'New Account', availableAt: null },
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
      markNotified: (productId, accountId) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  accounts: p.accounts.map((a) =>
                    a.id === accountId ? { ...a, notified: true } : a
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
          const validProducts: Product[] = [];
          if (Array.isArray(importedProducts)) {
            importedProducts.forEach((p: any) => {
              if (p && typeof p === 'object' && typeof p.name === 'string') {
                const accountsArray: Account[] = [];
                if (Array.isArray(p.accounts)) {
                  p.accounts.forEach((a: any) => {
                    if (a && typeof a === 'object' && typeof a.name === 'string') {
                      let availableAtVal: number | null = null;
                      if (typeof a.availableAt === 'number') {
                        availableAtVal = a.availableAt;
                      } else if (typeof a.availableAt === 'string') {
                        const parsed = Date.parse(a.availableAt);
                        if (!isNaN(parsed)) {
                          availableAtVal = parsed;
                        }
                      }

                      let nextResetAtVal: number | null = null;
                      if (typeof a.nextResetAt === 'number') {
                        nextResetAtVal = a.nextResetAt;
                      } else if (typeof a.nextResetAt === 'string') {
                        const parsed = Date.parse(a.nextResetAt);
                        if (!isNaN(parsed)) {
                          nextResetAtVal = parsed;
                        }
                      }

                      accountsArray.push({
                        id: a.id && typeof a.id === 'string' ? a.id : generateId(),
                        name: a.name,
                        availableAt: availableAtVal,
                        notified: !!a.notified,
                        nextResetAt: nextResetAtVal,
                        nextResetNotified: !!a.nextResetNotified,
                      });
                    }
                  });
                }
                validProducts.push({
                  id: p.id && typeof p.id === 'string' ? p.id : generateId(),
                  name: p.name,
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
    }),
    {
      name: 'limit-tracker-storage',
    }
  )
);
