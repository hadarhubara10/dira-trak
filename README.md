# DiraTrak - מעקב דירות

Mobile-first PWA for tracking apartment rental listings. Hebrew RTL, real-time sync between two users.

## Tech Stack

Next.js 16.2 | React 19.2 | TypeScript | Tailwind + Shadcn UI | TanStack Query v5 | Supabase | Serwist PWA

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy env template and fill in your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```

3. Push the database migration:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   It will prompt for your database password (found in Supabase Dashboard > Settings > Database).

4. Run the dev server:
   ```bash
   npm run dev
   ```

## Database Migrations

Migration files live in `supabase/migrations/`. To push migrations to your remote Supabase database:

```bash
# First time: login and link
supabase login
supabase link --project-ref <your-project-ref>

# Push migrations (prompts for DB password)
supabase db push

# Preview changes without applying
supabase db push --dry-run
```

The CLI tracks which migrations have been applied and skips already-applied ones.

## Build

```bash
npm run build   # runs: next build && serwist build
```

## Deploy

Deploy to Vercel. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as environment variables.
