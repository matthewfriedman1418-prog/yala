/**
 * Shared loading skeleton for every route inside (app).
 * Next.js automatically streams this while the page's server data resolves.
 */
export default function AppLoading() {
  return (
    <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full" style={{ background: '#1A2E22' }} />
        <div className="h-8 w-64 rounded-lg" style={{ background: '#1A2E22' }} />
        <div className="h-3 w-80 rounded-full" style={{ background: '#101C16' }} />
      </div>

      {/* Hero block skeleton */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ background: '#0C1812', border: '1px solid #1A2E22', height: 260 }}
      >
        <div className="absolute inset-0 _shimmer" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-xl relative overflow-hidden"
            style={{ background: '#0C1812', border: '1px solid #1A2E22' }}
          >
            <div className="absolute inset-0 _shimmer" />
          </div>
        ))}
      </div>

      <style>{`
        ._shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(240,178,50,0.04) 40%,
            rgba(45,201,122,0.04) 50%,
            rgba(240,178,50,0.04) 60%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: _sh 1.6s linear infinite;
        }
        @keyframes _sh {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
