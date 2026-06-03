import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/authStore';
import { useStore } from '@/lib/store';

async function fetchUserData(userId: string) {
  const { data } = await supabase
    .from('user_data')
    .select('products, settings')
    .eq('user_id', userId)
    .single();
  return data;
}

async function saveUserData(userId: string, products: unknown, settings: unknown) {
  await supabase.from('user_data').upsert(
    { user_id: userId, products, settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
}

export function SupabaseSync() {
  const { setSession, user } = useAuthStore();
  const isSyncingRef = useRef(false);

  // Bootstrap auth state from existing session and listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // When user logs in, fetch their data from Supabase
  useEffect(() => {
    if (!user) return;

    isSyncingRef.current = true;
    fetchUserData(user.id).then((data) => {
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        // Supabase has data — hydrate the store
        useStore.getState().importData(data.products, true);
        if (data.settings) {
          useStore.getState().updateSettings(data.settings);
        }
      } else {
        // New user — push their current localStorage data to Supabase
        const state = useStore.getState();
        saveUserData(user.id, state.products, state.settings);
      }
      // Small delay so the state update above settles before we re-enable sync
      setTimeout(() => { isSyncingRef.current = false; }, 500);
    });
  }, [user?.id]);

  // Auto-sync every store change (debounced 1.5s)
  useEffect(() => {
    if (!user) return;

    let timeout: ReturnType<typeof setTimeout>;

    const unsub = useStore.subscribe((state) => {
      if (isSyncingRef.current) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveUserData(user.id, state.products, state.settings);
      }, 1500);
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, [user?.id]);

  return null;
}
