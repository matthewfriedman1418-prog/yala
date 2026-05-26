'use client';

/**
 * /providers — game studio directory.
 *
 * Each tile is a real navigation target: clicking opens /casino with that
 * provider's filter chip pre-selected so the user lands on a curated list of
 * their games. Featured providers (top by catalog size) get a bigger card.
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ALL_GAMES, ALL_PROVIDERS, type Game } from '@/lib/mock-data/games';
import { Search, Layers, ChevronRight, Star, Sparkles } from 'lucide-react';

// Stable hashed color per provider — used so each tile has a recognizable hue
// without us having to hand-pick 12 brand colors.
function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const palette = [
    '#F0B232', '#2DC97A', '#A78BFA', '#60A5FA', '#F472B6',
    '#FB923C', '#34D399', '#FFD166', '#EF4444', '#22D3EE',
    '#84CC16', '#C084FC',
  ];
  return palette[h % palette.length];
}

export default function ProvidersPage() {
  const [query, setQuery] = useState('');

  // Game-count lookup from real catalog (mock data has providers + counts but
  // we also want to compute "top games for this studio" for the tile preview).
  const gamesByProvider = useMemo(() => {
    const m = new Map<string, Game[]>();
    for (const g of ALL_GAMES) {
      if (!m.has(g.provider)) m.set(g.provider, []);
      m.get(g.provider)!.push(g);
    }
    return m;
  }, []);

  const totalGames     = ALL_GAMES.length;
  const totalProviders = ALL_PROVIDERS.length;

  // Sort providers by catalog size descending; top 4 are "featured".
  const ordered = useMemo(
    () => [...ALL_PROVIDERS].sort((a, b) => b.count - a.count),
    [],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return ordered;
    const q = query.toLowerCase();
    return ordered.filter((p) => p.name.toLowerCase().includes(q));
  }, [ordered, query]);

  const featured = ordered.slice(0, 4);

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        className="relative rounded-3xl overflow-hidden p-5 sm:p-8"
        style={{
          background: `
            radial-gradient(ellipse at 0% 0%, rgba(167,139,250,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 100% 100%, rgba(240,178,50,0.14) 0%, transparent 50%),
            linear-gradient(135deg, #0F1A14 0%, #0A1410 100%)
          `,
          border: '1px solid rgba(167,139,250,0.20)',
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4" style={{ color: '#A78BFA' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#A78BFA' }}>
              Providers
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-2" style={{ color: '#F5E8C8' }}>
            Studios behind the lobby
          </h1>
          <p className="text-sm sm:text-base max-w-md mb-4" style={{ color: '#8FA899' }}>
            Curated partners shipping new slots, table games, live, and game shows. Tap a studio to filter the casino down to just their library.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Stat label="Providers"     value={String(totalProviders)} accent="#A78BFA" />
            <Stat label="Games"         value={totalGames.toLocaleString()} accent="#F0B232" />
            <Stat label="In-house"      value={`Yala Studios · 12`}  accent="#2DC97A" />
          </div>
        </div>
      </section>

      {/* ── SEARCH ────────────────────────────────────────── */}
      <section>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4A6A55' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search providers…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{ background: '#0F1A14', border: '1px solid #1A2E22', color: '#F5E8C8' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.45)')}
            onBlur={(e)  => (e.currentTarget.style.borderColor = '#1A2E22')}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
              style={{ color: '#8FA899' }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* ── FEATURED (only when not searching) ─────────────── */}
      {!query && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #F0B232, #2DC97A)' }} />
            <h2 className="font-display text-lg font-black tracking-tight" style={{ color: '#F5E8C8' }}>Featured studios</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {featured.map((p, i) => (
              <FeaturedProviderCard
                key={p.slug}
                provider={p}
                topGames={gamesByProvider.get(p.name) ?? []}
                color={p.name === 'Yala Studios' ? '#2DC97A' : hashColor(p.slug)}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── ALL PROVIDERS ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: '#A78BFA' }} />
            <h2 className="font-display text-lg font-black tracking-tight" style={{ color: '#F5E8C8' }}>
              {query ? 'Results' : 'All studios'}
            </h2>
          </div>
          <p className="text-[11px]" style={{ color: '#4A6A55' }}>
            {filtered.length} of {totalProviders}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: '#F5E8C8' }}>No providers match &quot;{query}&quot;</p>
            <p className="text-[11px]" style={{ color: '#8FA899' }}>Try a different name — we partner with 12 studios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p, i) => (
              <ProviderTile
                key={p.slug}
                provider={p}
                color={p.name === 'Yala Studios' ? '#2DC97A' : hashColor(p.slug)}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Partner CTA ───────────────────────────────────── */}
      <section
        className="rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
        style={{ background: '#0A1410', border: '1px solid #1A2E22' }}
      >
        <div className="flex items-center gap-3 flex-1">
          <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: '#F0B232' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>New providers added regularly</p>
            <p className="text-[11px]" style={{ color: '#8FA899' }}>Studios interested in shipping with us can reach out.</p>
          </div>
        </div>
        <Link
          href="/support"
          className="px-4 py-2.5 rounded-xl text-xs font-bold transition-colors hover:brightness-110 text-center"
          style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.30)' }}
        >
          Provider partnerships →
        </Link>
      </section>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-[11px]" style={{ color: 'rgba(143,168,153,0.5)' }}>
          18+ · No Purchase Necessary · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ background: `${accent}10`, border: `1px solid ${accent}28` }}
    >
      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA899' }}>{label}</span>
      <span className="text-[11px] font-mono font-black" style={{ color: accent }}>{value}</span>
    </div>
  );
}

function FeaturedProviderCard({
  provider, topGames, color, index,
}: {
  provider: { name: string; slug: string; count: number };
  topGames: Game[];
  color: string;
  index: number;
}) {
  const headlineGame = topGames[0];
  const preview = topGames.slice(0, 3);
  const isYala = provider.name === 'Yala Studios';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/casino?provider=${encodeURIComponent(provider.name)}`}
        className="block rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, ${color}24, transparent 65%),
            linear-gradient(180deg, #0F1A14 0%, #0A1410 100%)
          `,
          border: `1px solid ${color}40`,
          boxShadow: `0 4px 20px ${color}1A`,
        }}
      >
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-base"
                style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
              >
                {provider.name.charAt(0)}
              </span>
              {isYala && (
                <span
                  className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ background: `${color}1A`, color, border: `1px solid ${color}33` }}
                >
                  In-house
                </span>
              )}
            </div>
          </div>
          <Star className="w-3.5 h-3.5" style={{ color: `${color}99` }} />
        </div>
        <div className="px-4 pb-2">
          <p className="font-display font-black text-sm leading-tight" style={{ color: '#F5E8C8' }}>{provider.name}</p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: color }}>{provider.count} games</p>
        </div>
        {/* Top games strip */}
        <div className="px-4 pb-3">
          {headlineGame ? (
            <div className="space-y-0.5">
              {preview.map((g) => (
                <p key={g.id} className="text-[10px] truncate" style={{ color: '#8FA899' }}>
                  · {g.name}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[10px]" style={{ color: '#4A6A55' }}>Library inbound</p>
          )}
        </div>
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ background: `${color}0A`, borderTop: `1px solid ${color}22` }}
        >
          <span className="text-[10px] font-bold" style={{ color }}>Browse library</span>
          <ChevronRight className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </Link>
    </motion.div>
  );
}

function ProviderTile({
  provider, color, index,
}: {
  provider: { name: string; slug: string; count: number };
  color: string;
  index: number;
}) {
  const isYala = provider.name === 'Yala Studios';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
    >
      <Link
        href={`/casino?provider=${encodeURIComponent(provider.name)}`}
        className="group block rounded-2xl p-4 text-center transition-all hover:-translate-y-0.5"
        style={{
          background: '#0F1A14',
          border: `1px solid ${color}33`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center font-display font-black text-lg transition-transform group-hover:scale-110"
          style={{ background: `${color}1A`, color, border: `1px solid ${color}40` }}
        >
          {provider.name.charAt(0)}
        </div>
        <p className="font-bold text-xs leading-tight" style={{ color: '#F5E8C8' }}>{provider.name}</p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className="text-[10px] font-mono" style={{ color }}>{provider.count} games</span>
          {isYala && (
            <span
              className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{ background: `${color}1A`, color }}
            >
              In-house
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
