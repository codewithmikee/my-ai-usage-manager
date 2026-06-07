import { Product, Account } from './store';
import { Cycle } from './cycles';

export function migrateV1toV2(state: any): any {
  if (!state?.products) return state;

  state.products = state.products.map((p: any) => {
    // If product already has cycles, it's likely already migrated or new
    if (p.cycles && Array.isArray(p.cycles) && p.cycles.length > 0) return p;

    const cycles: Cycle[] = [];
    const hasLock = p.accounts.some((a: any) => a.availableAt != null);
    const hasCycle = p.accounts.some((a: any) => a.nextResetAt != null);

    // Create default cycles based on existing usage
    if (hasLock || p.accounts.length > 0) {
      cycles.push({ id: 'lock', name: 'Lock', durationMs: null, color: 'amber' });
    }
    if (hasCycle) {
      cycles.push({ id: 'cycle', name: 'Cycle', durationMs: null, color: 'violet' });
    }

    // If no accounts but it's a new product, we might want to wait for preset selection
    // but for migration we just ensure the structure exists.
    if (cycles.length === 0) {
       cycles.push({ id: 'lock', name: 'Lock', durationMs: null, color: 'amber' });
    }

    return {
      ...p,
      cycles,
      accounts: p.accounts.map((a: any) => {
        const limits: Record<string, any> = a.limits || {};
        
        if (a.availableAt != null && !limits.lock) {
          limits.lock = { 
            until: a.availableAt, 
            trippedAt: Date.now() - (a.availableAt - Date.now()), // approximation
            notified: !!a.notified 
          };
        }
        
        if (a.nextResetAt != null && !limits.cycle) {
          limits.cycle = { 
            until: a.nextResetAt, 
            trippedAt: Date.now(), 
            notified: !!a.nextResetNotified 
          };
        }

        return { ...a, limits };
      }),
    };
  });

  return state;
}
