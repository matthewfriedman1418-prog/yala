import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#040814', color: '#F5E8C8' }}
    >
      <div
        className="rounded-2xl p-8 sm:p-12 text-center max-w-lg w-full"
        style={{ background: '#0A101C', border: '1px solid #1A2238' }}
      >
        {/* YALA pyramid mark */}
        <svg width={56} height={48} viewBox="0 0 40 34" className="mx-auto mb-5" fill="none" aria-hidden="true">
          <defs><clipPath id="pyr-404"><polygon points="20,0 40,34 0,34" /></clipPath></defs>
          <rect x="0" y="0"    width="40" height="8.5"  fill="#F0B232" clipPath="url(#pyr-404)" />
          <rect x="0" y="8.5"  width="40" height="8.5"  fill="#84CC16" clipPath="url(#pyr-404)" />
          <rect x="0" y="17"   width="40" height="8.5"  fill="#2DC97A" clipPath="url(#pyr-404)" />
          <rect x="0" y="25.5" width="40" height="8.5"  fill="#1A5C8A" clipPath="url(#pyr-404)" />
        </svg>

        <p
          className="font-display font-black text-7xl mb-2"
          style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          404
        </p>
        <h1 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
          Lost in the desert
        </h1>
        <p className="text-sm mb-6" style={{ color: '#8FA3B8' }}>
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
          >
            Back to Casino
          </Link>
          <Link
            href="/support"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-white/5"
            style={{ borderColor: '#1A2238', color: '#8FA3B8' }}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
