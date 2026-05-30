import { NextResponse, type NextRequest } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Admin gate — TEMPORARILY OPEN (password removed by request).
//
// No auth right now: anyone with the /admin link can view it. Still served with
// noindex so search engines don't crawl it. To re-enable the Basic-Auth gate,
// restore the credential check (see git history) — it read ADMIN_USER /
// ADMIN_PASSWORD from env. The player-facing app is unaffected (matcher = /admin).
// ─────────────────────────────────────────────────────────────────────────────
export function proxy(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
