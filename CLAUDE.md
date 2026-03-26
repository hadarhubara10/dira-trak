@AGENTS.md

# DiraTrak Project Rules

## Database Migrations

- Migration files are in `supabase/migrations/`
- Push to remote: `supabase db push` (prompts for DB password interactively)
- Requires `supabase login` + `supabase link --project-ref hdezjlkbemdlucuaorpq` first
- Preview changes: `supabase db push --dry-run`
- Never hardcode the DB password in commands — let the CLI prompt for it

## Code Conventions

1. One component per file. Hooks in `hooks/`. Queries in `lib/queries/`. Types in `lib/types.ts`. Constants in `lib/constants.ts`.
2. All user-facing text in Hebrew. Code comments in English.
3. No `any` type. All functions fully typed.
4. RTL first: use `ms-`, `me-`, `ps-`, `pe-` (never `ml-`, `mr-`, `pl-`, `pr-`). Use `start-`/`end-` instead of `left-`/`right-`.
5. Use Shadcn UI primitives: Sheet, Badge, Card, Button, Input, Dialog, Separator, Skeleton.
6. All data fetching on client via TanStack Query hooks. Server Components only prefetch.
7. Status changes ONLY via `supabase.rpc('change_apartment_status')`. Never update status column directly.
8. No API routes for CRUD. Supabase client called directly from hooks.
9. Every `useMutation` invalidates the relevant query keys on success.
10. React 19 types omit `value` from form elements — use `getEventValue()` from `lib/utils.ts` for onChange handlers.

## Supabase

- Browser client: `lib/supabase/client.ts`
- Server client (async): `lib/supabase/server.ts`
- Proxy (auth middleware): `src/proxy.ts` (Next.js 16 uses "proxy" not "middleware")
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Build & Dev

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build (`next build && serwist build`)
- Service worker: `src/sw.ts` (excluded from main tsconfig, compiled by Serwist)
