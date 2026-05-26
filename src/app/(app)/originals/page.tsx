'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { YALA_ORIGINALS } from '@/lib/mock-data/games';
import { useWalletStore } from '@/lib/store/wallet';
import { Zap, Shield, TrendingUp, Dices, Coins, Target } from 'lucide-react';

// Game-type-specific icons
function GameTypeIcon({ type, color }: { type: string; color: string }) {
  const cls = 'w-8 h-8';
  const style = { color };
  const t = type.toLowerCase();
  if (t.includes('crash')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 20 L8 8 L14 14 L20 4" /><circle cx="20" cy="4" r="2" fill="currentColor" />
    </svg>
  );
  if (t.includes('plinko')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      <circle cx="6" cy="9" r="1.5" fill="currentColor" /><circle cx="18" cy="9" r="1.5" fill="currentColor" />
      <circle cx="3" cy="15" r="1.5" fill="currentColor" /><circle cx="12" cy="15" r="1.5" fill="currentColor" /><circle cx="21" cy="15" r="1.5" fill="currentColor" />
    </svg>
  );
  if (t.includes('mines')) return <Target className={cls} style={style} />;
  if (t.includes('auction')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <rect x="4" y="14" width="16" height="3" rx="0.5" />
      <line x1="4"  y1="9" x2="20" y2="9" />
      <line x1="8"  y1="9" x2="6"  y2="14" />
      <line x1="16" y1="9" x2="18" y2="14" />
    </svg>
  );
  if (t.includes('trail')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4" cy="20" r="1.5" fill="currentColor" />
      <path d="M4 20 L4 14 L10 14 L10 8 L16 8 L16 4" />
      <circle cx="16" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
  if (t.includes('dice')) return <Dices className={cls} style={style} />;
  if (t.includes('limbo')) return <TrendingUp className={cls} style={style} />;
  if (t.includes('wheel') || t.includes('roulette')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3" x2="12" y2="9" /><line x1="12" y1="15" x2="12" y2="21" />
      <line x1="3" y1="12" x2="9" y2="12" /><line x1="15" y1="12" x2="21" y2="12" />
    </svg>
  );
  if (t.includes('keno')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9.5" y="2" width="5" height="5" rx="1" />
      <rect x="17" y="2" width="5" height="5" rx="1" /><rect x="2" y="9.5" width="5" height="5" rx="1" />
      <rect x="17" y="9.5" width="5" height="5" rx="1" /><rect x="2" y="17" width="5" height="5" rx="1" />
      <rect x="9.5" y="17" width="5" height="5" rx="1" /><rect x="17" y="17" width="5" height="5" rx="1" />
    </svg>
  );
  if (t.includes('blackjack') || t.includes('hi-lo')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="2" width="11" height="15" rx="2" />
      <rect x="10" y="7" width="11" height="15" rx="2" />
      <text x="6" y="13" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">A</text>
    </svg>
  );
  if (t.includes('tower')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="2" width="6" height="4" rx="1" /><rect x="7" y="8" width="10" height="4" rx="1" />
      <rect x="5" y="14" width="14" height="4" rx="1" /><rect x="3" y="20" width="18" height="2" rx="1" />
    </svg>
  );
  if (t.includes('case')) return (
    <svg className={cls} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="8" width="20" height="13" rx="2" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" /><line x1="12" y1="13" x2="12" y2="16" />
    </svg>
  );
  return <Coins className={cls} style={style} />;
}

const GRADIENT_COLORS: Record<string, string[]> = {
  'trail': ['#065f46', '#1c1917'],
  'caravan-cross':  ['#92400e', '#7f1d1d'],
  'mirage-auction': ['#4c1d95', '#92400e'],
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

const ACCENT_COLORS: Record<string, string> = {
  'trail': '#2DC97A',
  'caravan-cross':  '#FB923C',
  'mirage-auction': '#A78BFA',
  'mirage-crash': '#FB923C',
  'oasis-plinko': '#2DC97A',
  'dune-mines': '#F0B232',
  'golden-dice': '#FBBF24',
  'sandstorm-limbo': '#8FA899',
  'emerald-wheel': '#34D399',
  'caravan-keno': '#F97316',
  'night-bazaar-blackjack': '#60A5FA',
  'pharaoh-towers': '#F0B232',
  'oasis-hi-lo': '#2DC97A',
  'desert-roulette': '#EF4444',
  'scorpion-cases': '#A78BFA',
};

export default function OriginalsPage() {
  const { activeCurrency } = useWalletStore();
  const isGC = activeCurrency === 'GC';
  const accent = isGC ? '#F0B232' : '#2DC97A';

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <OriginalsHero accent={accent} />

      {/* ── GAMES GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {YALA_ORIGINALS.map((game, i) => {
          const colors = GRADIENT_COLORS[game.slug] || ['#1c1917', '#0a0a0a'];
          const cardAccent = ACCENT_COLORS[game.slug] || accent;
          return (
            <motion.div
              key={game.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/originals/${game.slug}`} className="group block">
                <div
                  className="relative aspect-[3/4] rounded-xl overflow-hidden game-card-hover"
                  style={{ background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})` }}
                >
                  {/* Subtle grid texture */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,1) 19px,rgba(255,255,255,1) 20px), repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,1) 19px,rgba(255,255,255,1) 20px)',
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: cardAccent, color: '#060E0A' }}
                    >
                      {game.type}
                    </span>
                  </div>

                  {/* RTP badge */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-[#8FA899]">
                      {game.rtp}%
                    </span>
                  </div>

                  {/* Game icon — centered, unique per type */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `${cardAccent}18`,
                        border: `1px solid ${cardAccent}30`,
                        boxShadow: `0 0 24px ${cardAccent}20`,
                      }}
                    >
                      <GameTypeIcon type={game.type} color={cardAccent} />
                    </div>
                  </div>

                  {/* Hover "Play" overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <div
                      className="px-5 py-2 rounded-xl text-sm font-bold transition-transform"
                      style={{ background: cardAccent, color: '#060E0A' }}
                    >
                      Play Now
                    </div>
                  </div>

                  {/* Game info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-bold text-sm text-white leading-tight">{game.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] font-medium" style={{ color: cardAccent }}>Max: {game.maxWin}</p>
                      <div className="flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" style={{ color: '#2DC97A' }} />
                        <span className="text-[9px] font-medium text-[#2DC97A]">Fair</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Legal */}
      <div className="border-t pt-6 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.5)' }}>
          18+ · No Purchase Necessary · Gold Coins have no cash value · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

// The three Originals that are actually playable end-to-end (everything else
// uses the generic slug-page template). We feature these in the hero strip so
// users land on something they can immediately play.
const PLAYABLE_SLUGS = ['trail', 'caravan-cross', 'mirage-auction'];

function OriginalsHero({ accent }: { accent: string }) {
  const playable    = YALA_ORIGINALS.filter((g) => PLAYABLE_SLUGS.includes(g.slug));
  const totalCount  = YALA_ORIGINALS.length;

  return (
    <section
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 0% 0%, rgba(45,201,122,0.16) 0%, transparent 55%),
          radial-gradient(ellipse at 100% 100%, rgba(240,178,50,0.14) 0%, transparent 50%),
          linear-gradient(135deg, #0F1A14 0%, #0A1410 100%)
        `,
        border: '1px solid rgba(45,201,122,0.20)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 p-5 sm:p-8">
        {/* LEFT — pitch + CTA */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{ background: `${accent}14`, border: `1px solid ${accent}33` }}
            >
              <Zap className="w-3 h-3" style={{ color: accent }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: accent }}>
                Yala Originals
              </span>
            </div>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(45,201,122,0.14)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.30)' }}
            >
              {playable.length} playable
            </span>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(143,168,153,0.10)', color: '#8FA899', border: '1px solid #1A2E22' }}
            >
              {totalCount - playable.length} more coming
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-2" style={{ color: '#F5E8C8' }}>
            Built in‑house.
            <br className="hidden sm:block" />
            <span style={{ color: accent }}>Played nowhere else.</span>
          </h1>
          <p className="text-sm sm:text-base max-w-md mb-5" style={{ color: '#8FA899' }}>
            Provably-fair games designed by us. Every result is cryptographically verifiable and every Original supports both Gold Coins and Sweep Coins.
          </p>

          {/* Inline trust badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(45,201,122,0.08)', border: '1px solid rgba(45,201,122,0.25)' }}
            >
              <Shield className="w-3 h-3" style={{ color: '#2DC97A' }} />
              <span className="text-[10px] font-bold" style={{ color: '#2DC97A' }}>Provably fair</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: `${accent}10`, border: `1px solid ${accent}28` }}
            >
              <span className="text-[10px] font-bold" style={{ color: accent }}>99% RTP</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.28)' }}
            >
              <span className="text-[10px] font-bold" style={{ color: '#A78BFA' }}>GC + SC</span>
            </div>
          </div>
        </div>

        {/* RIGHT — playable mini-grid (only on >= sm so mobile stays light) */}
        <div className="hidden sm:grid grid-cols-3 gap-2 items-stretch">
          {playable.map((g, i) => {
            const cardAccent = ACCENT_COLORS[g.slug] || accent;
            return (
              <Link
                key={g.slug}
                href={`/originals/${g.slug}`}
                className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-end p-3 transition-transform hover:-translate-y-0.5"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, ${cardAccent}22, transparent 60%), #0A1410`,
                  border: `1px solid ${cardAccent}44`,
                  minHeight: 140,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="absolute top-2 right-2">
                  <span
                    className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(45,201,122,0.14)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.28)' }}
                  >
                    Play
                  </span>
                </div>
                <div className="mb-3 mt-3">
                  <GameTypeIcon type={g.type} color={cardAccent} />
                </div>
                <p className="font-display font-black text-xs text-center leading-tight" style={{ color: '#F5E8C8' }}>
                  {g.name}
                </p>
                <p className="text-[9px] text-center mt-0.5" style={{ color: '#8FA899' }}>{g.type}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
