import { NextResponse, type NextRequest } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Admin access gate (HTTP Basic Auth) + noindex. (Next 16 `proxy` convention.)
//
// Protects the /admin back office on the public deployment. Credentials come
// from env vars so they are NOT committed to this (public) repo:
//   ADMIN_USER      (default: "yala")
//   ADMIN_PASSWORD  (default: "desert-demo" — CHANGE in Vercel → Settings → Env)
//
// Lightweight demo gate, not production-grade auth. Real auth will be
// session/JWT-based once the backend lands. The player-facing app is untouched —
// the matcher scopes this strictly to /admin.
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_USER = process.env.ADMIN_USER || 'yala';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'desert-demo';

export function proxy(req: NextRequest) {
  const header = req.headers.get('authorization');
  if (header?.startsWith('Basic ')) {
    try {
      const [user, pass] = atob(header.slice(6)).split(':');
      if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
        const res = NextResponse.next();
        res.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return res;
      }
    } catch {
      /* malformed header → fall through to challenge */
    }
  }
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Yala Admin Console", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
