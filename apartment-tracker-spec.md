# DiraTrak - Apartment Hunting Tracker

## Overview

A personal web app for tracking apartment rental listings during an active apartment search. Replaces the current workflow of managing listings via WhatsApp messages. The app provides a clear pipeline view of all apartments being tracked, their status, and communication history.

**Target users:** Myself and my wife (2 users, shared data, real-time sync)
**Platform:** PWA (installable on home screen, standalone mode, push notifications)
**Language:** Hebrew (RTL), UI labels in Hebrew

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.2+ |
| React | React | 19.2+ |
| Styling | Tailwind CSS + Shadcn UI | Latest |
| Server State | TanStack Query (React Query) | v5.95+ |
| Database | Supabase (Postgres) | Latest |
| Auth | Supabase Auth (Magic Link / Google OAuth) | via `@supabase/ssr` |
| Realtime | Supabase Realtime (Postgres Changes) | Built-in |
| PWA / Service Worker | Serwist (`@serwist/next`) | Latest |
| Deployment | Vercel | - |
| Language | TypeScript (strict mode) | 5.x |

### Why This Stack

- **Next.js 16.2 App Router**: Server Components by default, React 19.2 features (View Transitions, Activity), Turbopack for fast dev.
- **TanStack Query v5**: Client-side cache, optimistic updates, background refetching. Handles all data fetching from Supabase on the client. Server Components fetch initial data, TanStack Query hydrates and manages it client-side.
- **Supabase**: Hosted Postgres, built-in Auth (both users share a project, each has their own login), Realtime subscriptions (wife sees updates instantly), Row Level Security for data safety. No need to write or maintain API routes for CRUD.
- **@supabase/ssr**: Proper cookie-based auth for Next.js App Router (server + client Supabase clients, middleware for token refresh).
- **Serwist**: Modern service worker library, successor to `next-pwa`. Works with Turbopack (Next.js 16 default). Handles precaching, runtime caching, and push notifications. Manifest handled natively by Next.js `app/manifest.ts`.

---

## Supabase Schema

### Tables

#### `apartments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default `gen_random_uuid()` | Primary key |
| title | text | NOT NULL | Short description (e.g., "3 חדרים רחוב הרצל") |
| source | text | NOT NULL, CHECK IN ('YAD2', 'FACEBOOK', 'OTHER') | Listing source |
| source_url | text | nullable | Link to the original listing |
| status | text | NOT NULL, DEFAULT 'NEW', CHECK IN (status enum values) | Current pipeline status |
| price | integer | nullable | Monthly rent in NIS |
| rooms | real | nullable | Number of rooms (e.g., 3, 3.5) |
| neighborhood | text | nullable | Neighborhood or area |
| address | text | nullable | Full address if known |
| contact_name | text | nullable | Landlord / agent name |
| contact_phone | text | nullable | Phone number |
| floor | integer | nullable | Floor number |
| size | integer | nullable | Size in sqm |
| notes | text | nullable | Free-text notes |
| viewing_date | timestamptz | nullable | Scheduled viewing date/time |
| rating | smallint | nullable, CHECK 1-5 | Rating after viewing |
| created_by | uuid | FK to `auth.users` | Who added this listing |
| created_at | timestamptz | DEFAULT `now()` | When the listing was added |
| updated_at | timestamptz | DEFAULT `now()` | Last update (trigger-updated) |

#### `status_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default `gen_random_uuid()` | Primary key |
| apartment_id | uuid | FK to `apartments`, ON DELETE CASCADE | Related apartment |
| from_status | text | nullable | Previous status (null for initial) |
| to_status | text | NOT NULL | New status |
| note | text | nullable | Optional note about this change |
| changed_by | uuid | FK to `auth.users` | Who changed the status |
| created_at | timestamptz | DEFAULT `now()` | When status changed |

#### `profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK to `auth.users` | User ID |
| display_name | text | nullable | Display name |
| avatar_url | text | nullable | Avatar URL |
| created_at | timestamptz | DEFAULT `now()` | - |

### Row Level Security (RLS)

Both users share all data. RLS ensures only authenticated users can access:

```sql
-- apartments: any authenticated user can CRUD
CREATE POLICY "Authenticated users can do everything"
  ON apartments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- status_logs: same policy
CREATE POLICY "Authenticated users can do everything"
  ON status_logs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Database Functions

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apartments_updated_at
  BEFORE UPDATE ON apartments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to change status + create log in one transaction
CREATE OR REPLACE FUNCTION change_apartment_status(
  p_apartment_id uuid,
  p_new_status text,
  p_note text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_old_status text;
BEGIN
  SELECT status INTO v_old_status FROM apartments WHERE id = p_apartment_id;

  UPDATE apartments SET status = p_new_status WHERE id = p_apartment_id;

  INSERT INTO status_logs (apartment_id, from_status, to_status, note, changed_by)
  VALUES (p_apartment_id, v_old_status, p_new_status, p_note, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Supabase Realtime

Enable Realtime on `apartments` table so both users see changes instantly:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE apartments;
```

---

## Status Pipeline

Each apartment progresses through these statuses:

```
NEW → CONTACTED → RESPONDED → VIEWING_SCHEDULED → VIEWED → INTERESTED / REJECTED / RENTED
```

| Status | Hebrew Label | Color | Description |
|--------|-------------|-------|-------------|
| NEW | חדש | blue | Just saved the listing, haven't reached out yet |
| CONTACTED | יצרתי קשר | yellow | Sent a message / called the landlord |
| RESPONDED | קיבלתי תשובה | orange | Got a response back |
| VIEWING_SCHEDULED | נקבע ביקור | purple | Viewing date is set |
| VIEWED | ראינו | cyan | We visited the apartment |
| INTERESTED | מעוניינים | green | We want this one, in negotiation |
| REJECTED | לא מתאים | red | We decided to pass |
| RENTED | הושכר | gray | Already rented by someone else |

---

## Data Layer Architecture

### Pattern: Server Components + TanStack Query Hydration

1. **Server Components** prefetch data using the Supabase server client (via `@supabase/ssr`)
2. Data is passed to a **HydrationBoundary** wrapping client components
3. **Client components** use TanStack Query hooks (`useQuery`, `useMutation`) with the Supabase browser client
4. **Supabase Realtime** subscriptions invalidate TanStack Query cache on remote changes

```
┌─────────────────────────────────────────────┐
│  Server Component (page.tsx)                │
│  - createClient() from @supabase/ssr       │
│  - prefetchQuery → supabase.from(...)      │
│  - dehydrate(queryClient)                  │
│  - <HydrationBoundary state={...}>         │
│      <ClientComponent />                   │
│  </HydrationBoundary>                      │
└─────────────────────────────────────────────┘
          ↓ hydrated cache
┌─────────────────────────────────────────────┐
│  Client Component                           │
│  - useQuery({ queryKey, queryFn })         │
│  - useMutation + optimistic updates        │
│  - Supabase Realtime subscription          │
│    → queryClient.invalidateQueries()       │
└─────────────────────────────────────────────┘
```

### Query Keys Convention

```typescript
export const apartmentKeys = {
  all: ['apartments'] as const,
  lists: () => [...apartmentKeys.all, 'list'] as const,
  list: (filters: ApartmentFilters) => [...apartmentKeys.lists(), filters] as const,
  details: () => [...apartmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...apartmentKeys.details(), id] as const,
  statusLogs: (id: string) => [...apartmentKeys.detail(id), 'status-logs'] as const,
} as const;
```

### Custom Hooks

```typescript
// hooks/use-apartments.ts
export function useApartments(filters: ApartmentFilters) {
  return useQuery({
    queryKey: apartmentKeys.list(filters),
    queryFn: () => fetchApartments(supabase, filters),
  });
}

// hooks/use-apartment.ts
export function useApartment(id: string) {
  return useQuery({
    queryKey: apartmentKeys.detail(id),
    queryFn: () => fetchApartment(supabase, id),
  });
}

// hooks/use-create-apartment.ts
export function useCreateApartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApartmentInput) => createApartment(supabase, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() }),
  });
}

// hooks/use-update-status.ts
export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) => supabase.rpc('change_apartment_status', {
      p_apartment_id: id,
      p_new_status: status,
      p_note: note,
    }),
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: apartmentKeys.detail(id) });
      const prev = queryClient.getQueryData(apartmentKeys.detail(id));
      queryClient.setQueryData(apartmentKeys.detail(id), (old) => ({ ...old, status }));
      return { prev };
    },
    onError: (_err, { id }, context) => {
      queryClient.setQueryData(apartmentKeys.detail(id), context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: apartmentKeys.all });
    },
  });
}

// hooks/use-realtime-apartments.ts
export function useRealtimeApartments() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('apartments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'apartments' }, () => {
        queryClient.invalidateQueries({ queryKey: apartmentKeys.all });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);
}
```

---

## Pages & Features

### 1. Dashboard (Home Page) - `/`

A Kanban-style board view showing apartments grouped by status columns.

- Each column represents a status from the pipeline
- Apartment cards show: title, price, rooms, neighborhood, source icon
- Cards are draggable between columns (drag = status change with optimistic update)
- Tap/click a card to open the apartment detail sheet
- A floating "+" FAB button to add a new apartment
- Filter bar at top: filter by source, neighborhood
- Sort within columns by: date added, price, viewing date

**Mobile behavior:** Horizontal scrollable columns, or a tab-based view where each tab is a status

### 2. Apartment Detail - Sheet/Modal

Opens as a bottom sheet (mobile) or side panel (desktop).

**Sections:**

- **Header:** Title, status badge, source badge with link icon (tap to open original listing)
- **Quick Info:** Price, rooms, floor, size, neighborhood, address
- **Contact:** Name, phone (tap to call), WhatsApp link (tap to open chat via `https://wa.me/{phone}`)
- **Status Timeline:** Visual timeline of all status changes with dates, notes, and who changed it
- **Viewing:** Date/time if scheduled, rating stars if viewed
- **Notes:** Free-text area for any notes
- **Actions:** Change status (dropdown), Edit, Delete (with confirmation)

### 3. Add/Edit Apartment - Sheet/Modal

A form to add or edit an apartment.

**Smart features:**
- When pasting a Yad2 URL, auto-detect and set source to YAD2
- When pasting a Facebook URL, auto-detect and set source to FACEBOOK
- Status defaults to NEW for new apartments
- Price field has ₪ prefix
- Phone field has clickable call/WhatsApp actions after saving

**Field order (optimized for quick entry):**
1. Title (required)
2. Source URL (paste link, auto-detect source)
3. Source (auto-set or manual select)
4. Price
5. Rooms
6. Neighborhood
7. Contact name
8. Contact phone
9. Notes

Other fields (address, floor, size) available under "More Details" expandable section.

### 4. List View - `/list`

Alternative to Kanban. A filterable, sortable table/list of all apartments.

- Sortable by: status, price, date added, viewing date, rating
- Filterable by: status (multi-select), source, neighborhood
- Search by title, address, or notes (client-side filter with TanStack Query cached data)
- Each row shows: title, status badge, price, rooms, source icon, last updated
- Tap row to open detail sheet

### 5. Stats View (Optional/Low Priority)

Simple stats:
- Total apartments tracked
- Breakdown by status
- Breakdown by source
- Average price of tracked apartments
- Apartments added this week

---

## Auth Flow

Using Supabase Auth via `@supabase/ssr`:

1. **Login page** (`/login`): Magic Link (email) or Google OAuth
2. **Middleware** (`middleware.ts`): Refreshes auth token via `updateSession()`, redirects unauthenticated users to `/login`
3. **Supabase clients**:
   - `lib/supabase/server.ts` - Server Component / Server Action client (reads cookies via `cookies()`)
   - `lib/supabase/client.ts` - Browser client (for TanStack Query hooks)
4. **Auth callback** (`/auth/callback/route.ts`): Exchanges OAuth code for session
5. **Two users only**: My wife and I each sign up. RLS allows any authenticated user full access (no per-user data isolation needed).

---

## UX Requirements

### Mobile-First
- Primary use is on phone while browsing Yad2/Facebook
- All actions reachable with one hand (bottom-aligned actions)
- Quick-add flow should take < 15 seconds for basic entry
- Bottom sheet pattern for details and forms (not full page navigation)

### RTL Support
- Full RTL layout using `dir="rtl"` on root
- Hebrew labels throughout
- Logical CSS properties (`ms-`, `me-`, `ps-`, `pe-` instead of `ml-`, `mr-`, `pl-`, `pr-`)

### Real-time Collaboration
- Both users see changes instantly via Supabase Realtime
- Status timeline shows who made each change
- Optimistic updates for the active user, Realtime invalidation for the other user

### Quick Actions
- Long-press an apartment card for quick actions: change status, call, open link
- Swipe gestures on list items (swipe right = next status, swipe left = reject)

### Visual Design
- Clean, minimal design
- Status colors are prominent and consistent
- Source icons: Yad2 logo-style icon, Facebook icon, generic link icon
- Dark mode support (follow system preference)

---

## URL Parsing

When a Yad2 or Facebook URL is pasted:

**Yad2 URLs** (pattern: `yad2.co.il/realestate/item/xxxxx`):
- Auto-set source to YAD2
- Store the URL

**Facebook URLs** (pattern: `facebook.com/groups/...` or `fb.com/...`):
- Auto-set source to FACEBOOK
- Store the URL

No scraping. Just source detection and link storage.

---

## PWA (Progressive Web App)

The app is designed to be installed on the phone's home screen and behave like a native app. This is a core feature, not a nice-to-have, since the primary use case is quick-adding apartments from the phone while browsing Yad2/Facebook.

### Approach

Next.js 16.2 has built-in PWA manifest support via `app/manifest.ts`. For the service worker, we use **Serwist** (`@serwist/next`), the modern, actively maintained successor to `next-pwa` that works with Turbopack (Next.js 16's default bundler).

No third-party PWA wrapper needed for the manifest. Serwist only handles the service worker layer.

### Web App Manifest

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DiraTrak - מעקב דירות',
    short_name: 'DiraTrak',
    description: 'מעקב אחרי דירות להשכרה',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    dir: 'rtl',
    lang: 'he',
    categories: ['utilities', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      {
        src: '/screenshots/dashboard-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'לוח מעקב דירות',
      },
    ],
  };
}
```

**Key manifest settings:**
- `display: 'standalone'` removes browser chrome, feels like a native app
- `dir: 'rtl'` + `lang: 'he'` for proper Hebrew display
- `orientation: 'portrait'` since this is a mobile-first tool
- Maskable icon for Android adaptive icons
- Screenshots enable the "richer install UI" on Android

### Service Worker (Serwist)

```typescript
// next.config.ts
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // existing config
};

export default withSerwist(nextConfig);
```

```typescript
// src/sw.ts
import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

**Caching strategy:**
- `/_next/static/*` (JS/CSS chunks): **CacheFirst** (content-hashed, immutable)
- Navigation requests (HTML pages): **NetworkFirst** with fallback to cache
- Supabase API calls: **NetworkOnly** (real-time data, don't cache)
- Static assets (icons, fonts): **CacheFirst**

### Push Notifications (Viewing Reminders)

Notify both users about upcoming apartment viewings. Uses the Web Push API with a Supabase Edge Function as the push server.

#### Flow

```
┌───────────────────────────────────────────────┐
│  Client (Browser)                             │
│  1. Request notification permission           │
│  2. Subscribe to push via PushManager         │
│  3. Send subscription to Supabase             │
│     (stored in push_subscriptions table)      │
└───────────────────────────────────────────────┘
              ↓
┌───────────────────────────────────────────────┐
│  Supabase Edge Function (cron or trigger)     │
│  1. Query apartments with viewing_date        │
│     within next 2 hours                       │
│  2. Fetch push_subscriptions for all users    │
│  3. Send Web Push via web-push library        │
│     Payload: apartment title, time, address   │
└───────────────────────────────────────────────┘
              ↓
┌───────────────────────────────────────────────┐
│  Service Worker (sw.ts)                       │
│  1. Receive push event                        │
│  2. Show notification with apartment info     │
│  3. On click → open app to apartment detail   │
└───────────────────────────────────────────────┘
```

#### Additional Supabase Table

##### `push_subscriptions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default `gen_random_uuid()` | Primary key |
| user_id | uuid | FK to `auth.users` | Subscriber |
| endpoint | text | NOT NULL, UNIQUE | Push endpoint URL |
| p256dh | text | NOT NULL | Public key |
| auth | text | NOT NULL | Auth secret |
| created_at | timestamptz | DEFAULT `now()` | - |

#### Service Worker Push Handler

```typescript
// In src/sw.ts, add:
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'DiraTrak', {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      dir: 'rtl',
      lang: 'he',
      data: { url: data.url ?? '/' },
      actions: [
        { action: 'open', title: 'פתח' },
        { action: 'dismiss', title: 'סגור' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
```

### Install Prompt

A custom "Add to Home Screen" prompt component for users who haven't installed the app yet:

```typescript
// components/install-prompt.tsx
// Listen for 'beforeinstallprompt' event
// Show a Hebrew banner: "התקן את DiraTrak למסך הבית לגישה מהירה"
// Store the event, trigger on button click
// Hide after install or dismiss, persist preference in localStorage
// On iOS (no beforeinstallprompt): show manual instructions with share icon
```

### PWA Assets to Generate

Place in `public/icons/`:
- `icon-192.png` (192x192, standard)
- `icon-512.png` (512x512, standard)
- `icon-maskable-512.png` (512x512, maskable with safe zone padding)
- `badge-72.png` (72x72, notification badge, monochrome)
- `apple-touch-icon.png` (180x180, for iOS)

Place in `public/screenshots/`:
- `dashboard-mobile.png` (390x844, narrow form factor)

### Apple-Specific Meta Tags

```typescript
// In src/app/layout.tsx metadata:
export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DiraTrak',
  },
};
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: RTL, ThemeProvider, QueryProvider, font, apple meta
│   ├── manifest.ts             # PWA Web App Manifest (dynamic, built-in Next.js support)
│   ├── page.tsx                # Dashboard: prefetch apartments, HydrationBoundary → KanbanBoard
│   ├── list/
│   │   └── page.tsx            # List view: prefetch, HydrationBoundary → ApartmentList
│   ├── login/
│   │   └── page.tsx            # Login page (Magic Link / OAuth)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # OAuth callback handler
│   └── error.tsx               # Error boundary
├── components/
│   ├── apartment-card.tsx      # Card for Kanban view
│   ├── apartment-detail.tsx    # Detail bottom sheet
│   ├── apartment-form.tsx      # Add/Edit form
│   ├── kanban-board.tsx        # Kanban board with drag-and-drop
│   ├── apartment-list.tsx      # List/table view
│   ├── status-badge.tsx        # Status badge with color
│   ├── source-badge.tsx        # Source icon badge
│   ├── status-timeline.tsx     # Visual status history
│   ├── filter-bar.tsx          # Filters UI
│   ├── nav-bar.tsx             # Bottom navigation
│   ├── install-prompt.tsx      # PWA install prompt (beforeinstallprompt + iOS fallback)
│   └── providers.tsx           # QueryClientProvider + Supabase Realtime listener
├── hooks/
│   ├── use-apartments.ts       # useQuery for apartment list
│   ├── use-apartment.ts        # useQuery for single apartment
│   ├── use-create-apartment.ts # useMutation for creating
│   ├── use-update-apartment.ts # useMutation for updating
│   ├── use-update-status.ts    # useMutation for status change (calls RPC)
│   ├── use-delete-apartment.ts # useMutation for deleting
│   ├── use-status-logs.ts      # useQuery for status history
│   ├── use-realtime-apartments.ts # Supabase Realtime subscription
│   ├── use-push-notifications.ts  # Push subscription management
│   └── use-filters.ts          # Filter/sort state (URL search params)
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client (createBrowserClient)
│   │   ├── server.ts           # Server Supabase client (createServerClient + cookies)
│   │   └── middleware.ts       # updateSession helper for middleware
│   ├── queries/
│   │   ├── apartments.ts       # Query functions: fetchApartments, fetchApartment, etc.
│   │   └── stats.ts            # Query functions for stats
│   ├── query-keys.ts           # TanStack Query key factory
│   ├── types.ts                # TypeScript types (generated from Supabase or manual)
│   ├── constants.ts            # Status labels/colors, source config
│   └── utils.ts                # URL detection, phone formatting, Hebrew helpers
├── sw.ts                        # Serwist service worker source (push handler, caching)
├── middleware.ts                # Next.js middleware: auth token refresh + redirect
├── public/
│   ├── icons/                   # PWA icons (192, 512, maskable, badge, apple-touch)
│   └── screenshots/             # PWA install screenshots
└── supabase/
    ├── migrations/
    │   └── 001_initial.sql     # Full schema: tables, RLS, functions, triggers
    └── functions/
        └── push-viewing-reminder/ # Edge Function: cron-based push notifications
            └── index.ts
```

---

## Implementation Phases

### Phase 1 - Core (MVP)
- [ ] Project setup: `create-next-app` with Next.js 16, TypeScript strict, Tailwind, Shadcn UI
- [ ] Supabase project setup: tables, RLS policies, functions, triggers
- [ ] Auth flow: login page, middleware, server/client Supabase helpers
- [ ] TanStack Query setup: QueryClientProvider, hydration pattern
- [ ] Custom hooks: useApartments, useCreateApartment, useUpdateStatus
- [ ] Add apartment form with URL auto-detection
- [ ] List view with status badges and filters
- [ ] Apartment detail sheet with status timeline
- [ ] Status change via RPC with optimistic updates
- [ ] Supabase Realtime: auto-invalidate queries on remote changes
- [ ] RTL layout and Hebrew labels
- [ ] Mobile-responsive design (bottom sheets, FAB)
- [ ] **PWA: manifest.ts** (name, icons, standalone display, RTL/Hebrew)
- [ ] **PWA: Serwist service worker** (precaching, runtime caching strategies)
- [ ] **PWA: Generate icon assets** (192, 512, maskable, apple-touch-icon, badge)
- [ ] **PWA: Install prompt component** (beforeinstallprompt + iOS manual instructions)
- [ ] **PWA: Apple meta tags** in layout.tsx (apple-web-app-capable, status-bar-style)

### Phase 2 - Enhanced UX
- [ ] Kanban board view with drag-and-drop (`@dnd-kit/core`)
- [ ] Quick actions (long-press, swipe)
- [ ] Call and WhatsApp tap actions
- [ ] Dark mode (Tailwind `dark:` + system preference)
- [ ] Sort options per view
- [ ] View Transitions (React 19.2) for smooth page switches
- [ ] **PWA: Push notifications** (Web Push API + Supabase Edge Function for viewing reminders)
- [ ] **PWA: push_subscriptions table** + subscription management hook
- [ ] **PWA: Notification click handler** in service worker (open apartment detail)

### Phase 3 - Polish
- [ ] Stats view
- [ ] Export data to CSV
- [ ] Type generation from Supabase: `supabase gen types typescript`
- [ ] **PWA: Offline fallback page** (cached HTML page when network unavailable)
- [ ] **PWA: Background Sync** for mutations made while offline (queue and retry)

---

## CLAUDE.md Instructions

When implementing this project, follow these rules:

1. **One component per file.** Hooks in separate files under `hooks/`. Query functions in `lib/queries/`. Utils in `lib/`.
2. **Hebrew UI.** All user-facing text in Hebrew. Code comments in English.
3. **RTL first.** Use `dir="rtl"` on root. Use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`) instead of physical (`ml-`, `mr-`, `pl-`, `pr-`).
4. **Mobile first.** Design for 375px width first, then scale up.
5. **Shadcn UI components.** Use Sheet for modals/panels, Badge for status, Card for listings.
6. **Type safety.** Generate types from Supabase schema (`supabase gen types typescript`). No `any`. All hook return types must be typed.
7. **TanStack Query patterns:**
   - All client data fetching via `useQuery` / `useMutation` hooks.
   - Server Components prefetch with `queryClient.prefetchQuery()` and pass via `HydrationBoundary`.
   - Use query key factory (`lib/query-keys.ts`) for all keys.
   - Optimistic updates for status changes and edits.
8. **Supabase patterns:**
   - Browser client (`lib/supabase/client.ts`) for hooks. Server client (`lib/supabase/server.ts`) for Server Components/Actions.
   - Status changes go through `supabase.rpc('change_apartment_status')` to ensure atomic log creation.
   - Realtime subscription in a top-level provider, invalidates TanStack Query cache.
9. **Status changes must log.** Every status update creates a `status_logs` record via the DB function. Never update status directly.
10. **URL detection.** When `source_url` is set, auto-detect source from URL pattern in `lib/utils.ts`.
11. **Minimal dependencies.** Don't add packages unless truly needed. Prefer Shadcn UI primitives over third-party UI libs.
12. **DRY.** Reuse components and hooks. Check existing code before creating new abstractions.
13. **No API routes for CRUD.** Use Supabase client directly. Only use Route Handlers for auth callback (`/auth/callback`).
14. **PWA patterns:**
    - Manifest via `app/manifest.ts` (built-in Next.js, no external package).
    - Service worker via Serwist (`@serwist/next`). Source at `src/sw.ts`, output at `public/sw.js`.
    - Never cache Supabase API calls in the service worker (NetworkOnly for `/rest/v1/*`).
    - Push notification handlers go in `src/sw.ts` alongside Serwist setup.
    - Test PWA install on real mobile device, not just desktop DevTools.
