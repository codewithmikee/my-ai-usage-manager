# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use **pnpm**. Never use npm.

## Commands

```bash
pnpm dev        # Dev server at http://localhost:3000
pnpm build      # Production build (Vite → dist/)
pnpm lint       # TypeScript type-check (tsc --noEmit)
pnpm preview    # Serve the dist/ build locally
```

No test suite is configured.

## Environment Variables

Copy `.env.local` (gitignored) with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

These are declared in `src/vite-env.d.ts` and accessed via `import.meta.env`.

## Architecture

**LimitTracker** is a single-page React 19 + Vite app for tracking AI tool usage limits across multiple accounts.

### Data model

`lib/store.ts` is the single source of truth. The Zustand store (persisted to localStorage under key `limit-tracker-storage`) holds:
- `products[]` — AI tools (e.g. "Claude", "Codex"), each with `accounts[]`
- Each `Account` has `availableAt: number | null` (Unix ms — `null` = currently available) and optional `nextResetAt` for a scheduled future reset
- `settings.showCountdown` — toggles countdown display style

### Auth + sync flow

`SupabaseSync` (rendered unconditionally in `App.tsx`) bootstraps the session on mount and subscribes to `onAuthStateChange`. It populates `lib/authStore.ts` (separate Zustand store, not persisted).

On login it fetches the user's row from the Supabase `user_data` table (JSONB `products` + `settings` columns). If a row exists it hydrates the local store (overwrite); otherwise it pushes the current localStorage state to Supabase.

After login, every store change triggers a debounced (1.5 s) upsert to Supabase via `useStore.subscribe()`. The `isSyncingRef` flag prevents the initial hydration from triggering a write-back loop.

`lib/syncStore.ts` holds `SyncStatus` ('idle' | 'syncing' | 'synced' | 'error') shown by `SyncIndicator` in the header.

### Path alias

`@/` resolves to the repo root (configured in `vite.config.ts`). All imports use this alias.

### Component conventions

- `components/ui/` — shadcn/ui primitives (Button, Input, Popover, Tooltip, Toaster)
- `components/EditableText.tsx` — inline double-click-to-edit text; `autoFocus` prop puts it directly into edit mode with all text selected (used for newly created tools)
- `components/AccountRow.tsx` — responsive row for one account; badge (limit timer) renders below the name on mobile, right-aligned on desktop
- `components/LimitTimerPopover.tsx` — date/time picker popover to set `availableAt` / `nextResetAt`
- `components/NotificationManager.tsx` — polls accounts and fires browser notifications when a limit expires

### Styling

Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.js`). Dark mode via `next-themes`. No component-level CSS files; all styles are inline Tailwind classes.

### Deployment

Hosted on Cloudflare Pages (static). `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set as environment variables in the Cloudflare Pages dashboard. Supabase redirect URLs must include the Pages domain.
