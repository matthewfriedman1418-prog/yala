'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { YALA_ORIGINALS } from '@/lib/mock-data/games';
import { useWalletStore } from '@/lib/store/wallet';
import { Zap, Shield } from 'lucide-react';

const GRADIENT_COLORS: Record<string, string[]> = {
  'mirage-crash': ['#92400e', '#78350f'],
  'oasis-plinko': ['#065f46', '#134e4a'],
  'dune-mines': ['#78350f', '#1c1917'],
  'golden-dice': ['#a16207', '#92400e'],
  'sandstorm-limbo': ['#1c1917', '#292524'],
  'emerald-wheel': ['#065f46', '#052e16'],
  'caravan-keno': ['#78350f', '#451a03'],
  'night-bazaar-blackjack': ['#1e293b', '#0f172a'],
  'pharaoh-towers': ['#713f12', '#431407'],
  'oasis-hi-lo': ['#134e4a', '#042f2e'],
  'desert-roulette': ['#7f1d1d', '#450a0a'],
  'scorpion-cases': ['#1c1917', '#0a0a0a'],
};

export default function OriginalsPage() {
  const { activeCurrency } = useWalletStore();
  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#D6A84F' : '#10B981';

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${isGC ? 'rgba(214,168,79,0.12)' : 'rgba(16,185,129,0.12)'} 0%, transparent 60%), #0A0A0A` }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4" style={{ color: accent }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>Yala Originals</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">Exclusive</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
            Desert-Crafted Games
          </h1>
          <p className="text-sm max-w-lg mb-4" style={{ color: '#9CA3AF' }}>
            12 in-house titles. Each provably fair. Each one a world of its own.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
              <Shield className="w-3.5 h-3.5" style={{ color: accent }} />
              Provably Fair
            </div>
            <div className="flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
              <span style={{ color: accent }}>◈</span>
              Gold Coins + Sweep Coins
            </div>
          </div>
        </div>
      </div>

      {/* Games grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {YALA_ORIGINALS.map((game, i) => {
          const colors = GRADIENT_COLORS[game.slug] || ['#1c1917', '#0a0a0a'];
          return (
            <motion.div
              key={game.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/originals/${game.slug}`} className="group block">
                <div
                  className="relative aspect-[3/4] rounded-xl overflow-hidden game-card-hover"
                  style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-black" style={{ background: accent }}>
                      {game.type}
                    </span>
                  </div>

                  {/* RTP badge */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-[#9CA3AF]">
                      {game.rtp}% RTP
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="px-4 py-2 rounded-xl text-sm font-semibold text-black" style={{ background: accent }}>
                      View Game
                    </div>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-bold text-sm text-white">{game.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: accent }}>Max Win: {game.maxWin}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Legal */}
      <div className="border-t border-[#1E1E1E] pt-6 text-center">
        <p className="text-xs text-[#9CA3AF]/60">
          18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}
