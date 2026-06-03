import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/authStore';
import { useStore } from '@/lib/store';
import { useSyncStore } from '@/lib/syncStore';

async function fetchUserData(userId: string) {
  const { data } = await supabase
    .from('user_data')
    .select('products, settings')
    .eq('user_id', userId)
    .single();
  return data;
}

async function saveUserData(userId: string, products: unknown, settings: unknown) {
  const { error } = await supabase.from('user_data').upsert(
    { user_id: userId, products, settings, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

export function SupabaseSync() {
  const { setSession, user } = useAuthStore();
  const setStatus = useSyncStore((s) => s.setStatus);
  const isSyncingRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const markSynced = () => {
    setStatus('synced');
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setStatus('idle'), 2500);
  };

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
    setStatus('syncing');

    fetchUserData(user.id).then((data) => {
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        useStore.getState().importData(data.products, true);
        if (data.settings) {
          useStore.getState().updateSettings(data.settings);
        }
        markSynced();
      } else {
        const state = useStore.getState();
        saveUserData(user.id, state.products, state.settings)
          .then(markSynced)
          .catch(() => setStatus('error'));
      }
      setTimeout(() => { isSyncingRef.current = false; }, 500);
    }).catch(() => {
      setStatus('error');
      isSyncingRef.current = false;
    });
  }, [user?.id]);

  // Auto-sync every store change (debounced 1.5s)
  useEffect(() => {
    if (!user) return;

    let timeout: ReturnType<typeof setTimeout>;

    const unsub = useStore.subscribe((state) => {
      if (isSyncingRef.current) return;
      clearTimeout(timeout);
      setStatus('syncing');
      timeout = setTimeout(() => {
        saveUserData(user.id, state.products, state.settings)
          .then(markSynced)
          .catch(() => setStatus('error'));
      }, 1500);
    });

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, [user?.id]);

  return null;
}
