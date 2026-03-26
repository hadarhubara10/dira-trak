import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons/ (PWA icons)
     * - sw.js (service worker)
     * - sw (service worker route)
     * - manifest.webmanifest
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icons/|sw\\.js|sw|manifest\\.webmanifest|~offline).*)",
  ],
};
