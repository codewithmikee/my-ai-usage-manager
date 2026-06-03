import React, { useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const { signIn, signUp } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [signedUpMsg, setSignedUpMsg] = useState<string | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignedUpMsg(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error);
      else setSignedUpMsg('Account created! Check your email to confirm, or sign in if confirmation is disabled.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
            <div className="w-3.5 h-0.5 bg-white dark:bg-black rounded-full" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-gray-900 dark:text-gray-100">
            LimitTracker
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
            {mode === 'signin' ? 'Access your limit tracker across devices.' : 'Set up your personal limit tracker.'}
          </p>

          <form onSubmit={handle} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-gray-400 dark:focus:border-white/30 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
                {error}
              </p>
            )}

            {signedUpMsg && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                {signedUpMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'h-9 rounded-lg text-sm font-semibold transition-colors mt-1',
                'bg-gray-900 dark:bg-white text-white dark:text-gray-900',
                'hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSignedUpMsg(null); }}
              className="text-gray-700 dark:text-gray-300 font-medium hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
