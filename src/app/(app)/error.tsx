'use client';
import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where Sentry.captureException(error) lives
    console.error('[app error]', error);
  }, [error]);

  return (
    <div
      className="rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto mt-12"
      style={{ background: '#0A101C', border: '1px solid rgba(239,68,68,0.25)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <h1 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
        Something went wrong
      </h1>
      <p className="text-sm mb-2" style={{ color: '#8FA3B8' }}>
        We hit an unexpected error loading this page. Your balance and account are unaffected.
      </p>
      {error.digest && (
        <p className="text-[10px] font-mono mb-6" style={{ color: '#4A5878' }}>
          ref: {error.digest}
        </p>
      )}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
        >
          <RotateCw className="w-3.5 h-3.5" />
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-white/5"
          style={{ borderColor: '#1A2238', color: '#8FA3B8' }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}
