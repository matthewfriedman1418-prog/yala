'use client';

/**
 * TRAIL — a Yala original.
 *
 * Mechanic: pick an EDGE tile to start, then extend your path one orthogonally
 * adjacent tile at a time. Safe tile = multiplier ticks up. Hazard = bust.
 * Reach a tile on the OPPOSITE edge from your start for a +50% jackpot bonus.
 *
 * RTP math matches standard Mines (99% RTP): multiplier after k safe picks is
 *   0.99 * C(N, k) / C(N - M, k)
 * with N = 36 (6×6 grid), M = hazard count (3 / 5 / 8).
 * The adjacency constraint adds player skill / strategy without changing the
 * underlying per-pick odds (each next tile is still M-of-(remaining) hazards).
 */

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Shield,
  Info,
  TrendingUp,
  BarChart3,
  Sparkles,
  RotateCcw,
  Trophy,
  Skull,
  Lock,
} from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { GoldCoinIcon, SweepCoinIcon } from '@/components/ui/YalaIcon';
import { YalaAvatar } from '@/components/ui/YalaAvatar';
import { formatGC, getVIPColor } from '@/lib/utils';

// ─── Constants ─────────────────────────────────────────────────────────────
const GRID = 6;
const TOTAL = GRID * GRID;

type Difficulty = 'safe' | 'risky' | 'reckless';
const HAZARDS: Record<Difficulty, number> = { safe: 3, risky: 5, reckless: 8 };
const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; sub: string }> = {
  safe:     { label: 'Safe',     color: '#2DC97A', sub: '3 hazards' },
  risky:    { label: 'Risky',    color: '#F0B232', sub: '5 hazards' },
  reckless: { label: 'Reckless', color: '#EF4444', sub: '8 hazards' },
};

const QUICK_BETS = [1, 5, 10, 25, 100, 500];
const MAX_HISTORY = 12;

// ─── Math ──────────────────────────────────────────────────────────────────
function combo(n: number, k: number): number {
  if (k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}
function multiplier(safePicks: number, hazardCount: number): number {
  if (safePicks === 0) return 1;
  return 0.99 * (combo(TOTAL, safePicks) / combo(TOTAL - hazardCount, safePicks));
}

// ─── Grid helpers ──────────────────────────────────────────────────────────
const rowOf = (i: number) => Math.floor(i / GRID);
const colOf = (i: number) => i % GRID;
const isEdge = (i: number) => {
  const r = rowOf(i), c = colOf(i);
  return r === 0 || r === GRID - 1 || c === 0 || c === GRID - 1;
};
function neighbors(idx: number): number[] {
  const r = rowOf(idx), c = colOf(idx);
  const out: number[] = [];
  if (r > 0)        out.push(idx - GRID);
  if (r < GRID - 1) out.push(idx + GRID);
  if (c > 0)        out.push(idx - 1);
  if (c < GRID - 1) out.push(idx + 1);
  return out;
}
/** True if `idx` is on the OPPOSITE edge from `start`. */
function isOppositeEdge(start: number, idx: number): boolean {
  const sr = rowOf(start), sc = colOf(start);
  const nr = rowOf(idx),   nc = colOf(idx);
  if (sr === 0          && nr === GRID - 1) return true;
  if (sr === GRID - 1   && nr === 0)        return true;
  if (sc === 0          && nc === GRID - 1) return true;
  if (sc === GRID - 1   && nc === 0)        return true;
  return false;
}
/** Generate hazard tile indices, always leaving `safeStart` clear. */
function generateHazards(count: number, safeStart: number): Set<number> {
  const pool = Array.from({ length: TOTAL }, (_, i) => i).filter((i) => i !== safeStart);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return new Set(pool.slice(0, count));
}
function randomSeed(): string {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// ─── Mock recent plays / leaderboard (reused look from /originals/[slug]) ──
const RECENT_PLAYS = [
  { user: 'GoldDuneKing',  avatar: 'GK', tier: 6, bet: 500, mult: 6.2,  payout: 3100, time: '2s',  won: true  },
  { user: 'OasisHunter',   avatar: 'OH', tier: 5, bet: 1000, mult: 0,   payout: 0,    time: '5s',  won: false },
  { user: 'SandstormX',    avatar: 'SX', tier: 4, bet: 250,  mult: 18.5, payout: 4625, time: '8s',  won: true  },
  { user: 'EmeraldDunes',  avatar: 'ED', tier: 5, bet: 750,  mult: 2.1, payout: 1575, time: '12s', won: true  },
  { user: 'NightBazaar7',  avatar: 'NB', tier: 3, bet: 100,  mult: 0,   payout: 0,    time: '15s', won: false },
  { user: 'PyramidAce',    avatar: 'PA', tier: 2, bet: 200,  mult: 4.4, payout: 880,  time: '18s', won: true  },
];
const LEADERBOARD = [
  { rank: 1, user: 'GoldDuneKing',  avatar: 'GK', tier: 6, profit: 482_000 },
  { rank: 2, user: 'OasisHunter',   avatar: 'OH', tier: 5, profit: 334_200 },
  { rank: 3, user: 'SandstormX',    avatar: 'SX', tier: 4, profit: 218_500 },
  { rank: 4, user: 'EmeraldDunes',  avatar: 'ED', tier: 5, profit: 187_300 },
  { rank: 5, user: 'DesertFox88',   avatar: 'DF', tier: 5, profit: 142_800 },
];

type Tab = 'recent' | 'leaderboard' | 'rules' | 'fairness';
type Phase = 'idle' | 'playing' | 'bust' | 'cashed' | 'completed';
type HistoryEntry = { result: 'win' | 'bust'; mult: number; bet: number; ts: number };

// ─── Component ─────────────────────────────────────────────────────────────
export default function TrailPage() {
  const { activeCurrency, goldCoins, sweepCoins, addGC, addSC, addXP } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();

  // Game config
  const [difficulty, setDifficulty] = useState<Difficulty>('risky');
  const [bet, setBet] = useState<number>(1);

  // Game state
  const [phase, setPhase] = useState<Phase>('idle');
  const [hazards, setHazards] = useState<Set<number>>(new Set());
  const [path, setPath] = useState<number[]>([]);
  const [bustTile, setBustTile] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [seed, setSeed] = useState<string>('');
  const [nonce, setNonce] = useState<number>(1);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('recent');

  // Persist history across page reloads (nice-to-have)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('yala-trail-history');
      if (raw) setHistory(JSON.parse(raw));
      const s = localStorage.getItem('yala-trail-seed');
      setSeed(s || randomSeed());
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('yala-trail-history', JSON.stringify(history)); } catch {}
  }, [history]);
  useEffect(() => {
    if (seed) try { localStorage.setItem('yala-trail-seed', seed); } catch {}
  }, [seed]);

  // Derived
  const isGC      = activeCurrency === 'GC';
  const accent    = isGC ? '#F0B232' : '#2DC97A';
  const accentSec = isGC ? '#FFD166' : '#34D399';
  const balance   = isGC ? goldCoins : sweepCoins;
  const hazardCount = HAZARDS[difficulty];
  const currentMult = multiplier(path.length, hazardCount);
  const nextMult    = multiplier(path.length + 1, hazardCount);
  const potential   = bet * currentMult;
  const lastTile    = path[path.length - 1];

  // Adjacency / playability
  const canPlay = useCallback(
    (idx: number) => {
      if (phase !== 'playing') return false;
      if (path.includes(idx)) return false;
      if (path.length === 0) return isEdge(idx);
      return neighbors(lastTile).includes(idx);
    },
    [phase, path, lastTile],
  );

  // ── Actions ──────────────────────────────────────────────────────────────
  const beginRound = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (bet <= 0)    { toast.error('Bet must be greater than 0'); return; }
    if (bet > balance) { toast.error(`Insufficient ${activeCurrency} balance`); return; }
    // Deduct bet
    if (isGC) addGC(-bet); else addSC(-bet);
    setPath([]);
    setHazards(new Set());
    setBustTile(null);
    setShowAll(false);
    setPhase('playing');
  };

  const cashOut = () => {
    if (phase !== 'playing' || path.length === 0) return;
    const winnings = bet * currentMult;
    if (isGC) addGC(winnings); else addSC(winnings);
    addXP(Math.floor(bet * 0.3));
    setHistory((h) => [{ result: 'win' as const, mult: currentMult, bet, ts: Date.now() }, ...h].slice(0, MAX_HISTORY));
    setShowAll(true);
    setPhase('cashed');
    setNonce((n) => n + 1);
    setSeed(randomSeed());
    toast.success(`Cashed out at ${currentMult.toFixed(2)}×`, {
      description: `+${winnings.toFixed(2)} ${activeCurrency}`,
    });
  };

  const handleTileClick = (idx: number) => {
    if (phase !== 'playing') return;
    if (!canPlay(idx)) {
      if (path.length === 0) toast.info('Start on an EDGE tile');
      else                   toast.info('Pick an adjacent tile (no jumping)');
      return;
    }

    // First click — generate hazards (avoiding the start tile)
    if (path.length === 0) {
      const h = generateHazards(hazardCount, idx);
      setHazards(h);
      setPath([idx]);
      return;
    }

    // Subsequent clicks — check for hazard
    if (hazards.has(idx)) {
      setBustTile(idx);
      setShowAll(true);
      setPhase('bust');
      addXP(Math.floor(bet * 0.1)); // small consolation XP
      setHistory((h) => [{ result: 'bust' as const, mult: 0, bet, ts: Date.now() }, ...h].slice(0, MAX_HISTORY));
      setNonce((n) => n + 1);
      setSeed(randomSeed());
      toast.error('Bust!', { description: `You revealed a hazard after ${path.length} safe ${path.length === 1 ? 'tile' : 'tiles'}.` });
      return;
    }

    // Safe!
    const newPath = [...path, idx];
    setPath(newPath);

    // Check for trail-complete (reached opposite edge)
    const startTile = newPath[0];
    if (isOppositeEdge(startTile, idx)) {
      const finalMult = multiplier(newPath.length, hazardCount) * 1.5;
      const winnings  = bet * finalMult;
      if (isGC) addGC(winnings); else addSC(winnings);
      addXP(Math.floor(bet * 1.0));
      setHistory((h) => [{ result: 'win' as const, mult: finalMult, bet, ts: Date.now() }, ...h].slice(0, MAX_HISTORY));
      setShowAll(true);
      setPhase('completed');
      setNonce((n) => n + 1);
      setSeed(randomSeed());
      toast.success('Trail Complete! +50% jackpot bonus', {
        description: `Won ${winnings.toFixed(2)} ${activeCurrency} at ${finalMult.toFixed(2)}×`,
      });
    }
  };

  const reset = () => {
    setPath([]);
    setHazards(new Set());
    setBustTile(null);
    setShowAll(false);
    setPhase('idle');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Back link */}
      <Link
        href="/originals"
        className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
        style={{ color: '#8FA899' }}
      >
        <ChevronLeft className="w-4 h-4" />
        All Originals
      </Link>

      {/* ── Game shell ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* LEFT: header + board + status */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at 50% -10%, ${accent}14, transparent 60%), #0C1812`,
            border: '1px solid #1A2E22',
          }}
        >
          {/* Header strip */}
          <div
            className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4"
            style={{ borderBottom: '1px solid #1A2E22' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}28, ${accent}08)`, border: `1px solid ${accent}40` }}
              >
                <Sparkles className="w-5 h-5" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>
                    Trail
                  </h1>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}40` }}
                  >
                    New · Yala Original
                  </span>
                </div>
                <p className="text-[11px] truncate" style={{ color: '#8FA899' }}>
                  Adjacent-tile path game · 99% RTP · 5000× max win
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <StatChip label="RTP"      value="99%"   />
              <StatChip label="Max Win"  value="5000×" />
            </div>
          </div>

          {/* Game status banner */}
          <div className="px-4 sm:px-6 pt-5">
            <GameStatus
              phase={phase}
              path={path}
              currentMult={currentMult}
              potential={potential}
              activeCurrency={activeCurrency}
              accent={accent}
            />
          </div>

          {/* The board */}
          <div className="px-3 sm:px-6 py-5 flex justify-center">
            <TrailBoard
              phase={phase}
              path={path}
              hazards={hazards}
              showAll={showAll}
              bustTile={bustTile}
              canPlay={canPlay}
              onTileClick={handleTileClick}
              accent={accent}
              accentSec={accentSec}
            />
          </div>

          {/* Hint / next-mult bar */}
          <div className="px-4 sm:px-6 pb-5">
            <NextMultBar
              phase={phase}
              path={path}
              currentMult={currentMult}
              nextMult={nextMult}
              accent={accent}
              hazardCount={hazardCount}
            />
          </div>
        </div>

        {/* RIGHT: control panel */}
        <div
          className="rounded-3xl p-5 space-y-5 self-start"
          style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
        >
          {/* Balance */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA899' }}>
              Balance
            </span>
            <div className="flex items-center gap-1.5">
              {isGC ? <GoldCoinIcon size={14} /> : <SweepCoinIcon size={14} />}
              <span className="font-mono font-black text-sm" style={{ color: accent }}>
                {isGC ? formatGC(goldCoins) : sweepCoins.toFixed(2)}
              </span>
              <span className="text-[10px]" style={{ color: '#8FA899' }}>{activeCurrency}</span>
            </div>
          </div>

          {/* Bet input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8FA899' }}>
              Bet amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={bet}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setBet(Number.isFinite(v) && v > 0 ? Math.min(v, 100_000_000) : 0);
                }}
                disabled={phase === 'playing'}
                min={0}
                step={isGC ? 1 : 0.1}
                className="w-full pl-3 pr-20 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none transition-colors disabled:opacity-60"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #1A2E22',
                  color: '#F5E8C8',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${accent}66`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2E22')}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  disabled={phase === 'playing'}
                  onClick={() => setBet((b) => Math.max(isGC ? 1 : 0.1, +(b / 2).toFixed(2)))}
                  className="px-2 py-1 rounded-lg text-[10px] font-black transition-colors hover:bg-white/10 disabled:opacity-50"
                  style={{ color: '#8FA899', background: 'rgba(255,255,255,0.04)' }}
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={phase === 'playing'}
                  onClick={() => setBet((b) => Math.min(balance, +(b * 2).toFixed(2)) || (isGC ? 1 : 0.1))}
                  className="px-2 py-1 rounded-lg text-[10px] font-black transition-colors hover:bg-white/10 disabled:opacity-50"
                  style={{ color: '#8FA899', background: 'rgba(255,255,255,0.04)' }}
                >
                  2×
                </button>
              </div>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {QUICK_BETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={phase === 'playing'}
                  onClick={() => setBet(v)}
                  className="px-2 py-1 rounded-md text-[10px] font-bold transition-colors disabled:opacity-50"
                  style={{
                    background: bet === v ? `${accent}1A` : 'rgba(255,255,255,0.03)',
                    color:      bet === v ? accent : '#8FA899',
                    border:     `1px solid ${bet === v ? `${accent}44` : '#1A2E22'}`,
                  }}
                >
                  {v < 10 ? v.toFixed(1) : v}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8FA899' }}>
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => {
                const meta = DIFFICULTY_META[d];
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={phase === 'playing'}
                    onClick={() => setDifficulty(d)}
                    className="py-2 px-1 rounded-xl text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: active ? `${meta.color}14` : 'rgba(255,255,255,0.03)',
                      border:     `1px solid ${active ? `${meta.color}55` : '#1A2E22'}`,
                    }}
                  >
                    <p className="text-[11px] font-black" style={{ color: active ? meta.color : '#F5E8C8' }}>
                      {meta.label}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: '#8FA899' }}>{meta.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary action */}
          {phase === 'idle' || phase === 'bust' || phase === 'cashed' || phase === 'completed' ? (
            <button
              type="button"
              onClick={isLoggedIn ? beginRound : () => openAuthModal()}
              className="w-full py-3.5 rounded-xl font-display text-base font-black transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentSec})`,
                color: '#060E0A',
                boxShadow: `0 6px 24px ${accent}40`,
              }}
            >
              {!isLoggedIn ? (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Sign in to play
                </span>
              ) : (
                <>Bet {isGC ? formatGC(bet) : bet.toFixed(2)} {activeCurrency}</>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={cashOut}
              disabled={path.length === 0}
              className="w-full py-3.5 rounded-xl font-display text-base font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: path.length === 0
                  ? 'rgba(255,255,255,0.04)'
                  : `linear-gradient(135deg, ${accent}, ${accentSec})`,
                color: path.length === 0 ? '#8FA899' : '#060E0A',
                boxShadow: path.length === 0 ? 'none' : `0 6px 24px ${accent}40`,
              }}
            >
              {path.length === 0
                ? 'Click an edge tile to begin'
                : <>Cash out {(bet * currentMult).toFixed(2)} {activeCurrency}</>
              }
            </button>
          )}

          {/* Secondary action — quick reset / replay */}
          {(phase === 'bust' || phase === 'cashed' || phase === 'completed') && (
            <button
              type="button"
              onClick={reset}
              className="w-full py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white/5 flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22', color: '#8FA899' }}
            >
              <RotateCcw className="w-3 h-3" />
              New round
            </button>
          )}

          {/* Recent rounds (your local history) */}
          <div className="pt-2" style={{ borderTop: '1px solid #1A2E22' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA899' }}>
                Your last rounds
              </span>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[10px] underline opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: '#8FA899' }}
                >
                  clear
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-[11px]" style={{ color: '#4A6A55' }}>Your wins and busts will show here.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    title={`${h.result === 'win' ? `+${(h.bet * h.mult).toFixed(2)}` : `-${h.bet}`} · ${h.mult.toFixed(2)}×`}
                    className="px-2 py-1 rounded-md text-[10px] font-mono font-bold"
                    style={{
                      background: h.result === 'win' ? 'rgba(45,201,122,0.10)' : 'rgba(239,68,68,0.10)',
                      color:      h.result === 'win' ? '#2DC97A'              : '#EF4444',
                      border:     `1px solid ${h.result === 'win' ? 'rgba(45,201,122,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    }}
                  >
                    {h.result === 'win' ? `${h.mult.toFixed(2)}×` : 'BUST'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lower tabs: Recent, Leaderboard, Rules, Fairness ─────── */}
      <div className="rounded-3xl" style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}>
        <div className="flex border-b" style={{ borderColor: '#1A2E22' }}>
          {([
            { id: 'recent',      label: 'Recent Plays',   icon: TrendingUp },
            { id: 'leaderboard', label: 'Leaderboard',    icon: BarChart3 },
            { id: 'rules',       label: 'Rules',          icon: Info },
            { id: 'fairness',    label: 'Provably Fair',  icon: Shield },
          ] as { id: Tab; label: string; icon: typeof Info }[]).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-colors relative"
                style={{ color: active ? accent : '#8FA899' }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {active && (
                  <motion.div
                    layoutId="trail-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: accent }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="p-5">
          {activeTab === 'recent'      && <RecentPlaysList accent={accent} />}
          {activeTab === 'leaderboard' && <LeaderboardList accent={accent} />}
          {activeTab === 'rules'       && <RulesPanel />}
          {activeTab === 'fairness'    && <FairnessPanel seed={seed} nonce={nonce} />}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}>
      <p className="text-[8px] font-bold uppercase tracking-widest leading-none" style={{ color: '#8FA899' }}>{label}</p>
      <p className="text-[11px] font-mono font-black leading-tight mt-0.5" style={{ color: '#F5E8C8' }}>{value}</p>
    </div>
  );
}

function GameStatus({
  phase, path, currentMult, potential, activeCurrency, accent,
}: {
  phase: Phase; path: number[]; currentMult: number; potential: number;
  activeCurrency: string; accent: string;
}) {
  if (phase === 'idle') {
    return (
      <div className="text-center py-2 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-[11px]" style={{ color: '#8FA899' }}>
          Set your bet on the right, then press <span className="font-bold" style={{ color: '#F5E8C8' }}>Bet</span> to begin.
        </p>
      </div>
    );
  }
  if (phase === 'playing') {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl" style={{ background: `${accent}0F`, border: `1px solid ${accent}33` }}>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[9px] uppercase font-bold tracking-widest leading-none" style={{ color: '#8FA899' }}>Multiplier</p>
            <p className="font-mono font-black text-2xl leading-tight mt-1" style={{ color: accent }}>{currentMult.toFixed(2)}×</p>
          </div>
          <div className="h-9 w-px" style={{ background: '#1A2E22' }} />
          <div>
            <p className="text-[9px] uppercase font-bold tracking-widest leading-none" style={{ color: '#8FA899' }}>Tiles revealed</p>
            <p className="font-mono font-black text-lg leading-tight mt-1" style={{ color: '#F5E8C8' }}>{path.length}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase font-bold tracking-widest leading-none" style={{ color: '#8FA899' }}>Potential</p>
          <p className="font-mono font-black text-lg leading-tight mt-1" style={{ color: '#F5E8C8' }}>
            {potential.toFixed(2)} <span className="text-[10px]" style={{ color: '#8FA899' }}>{activeCurrency}</span>
          </p>
        </div>
      </div>
    );
  }
  if (phase === 'bust') {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)' }}>
        <Skull className="w-4 h-4" style={{ color: '#EF4444' }} />
        <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#EF4444' }}>Bust</p>
        <span className="text-[11px]" style={{ color: '#8FA899' }}>· after {path.length} {path.length === 1 ? 'tile' : 'tiles'}</span>
      </div>
    );
  }
  if (phase === 'cashed') {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: `${accent}14`, border: `1px solid ${accent}44` }}>
        <Trophy className="w-4 h-4" style={{ color: accent }} />
        <p className="text-sm font-black uppercase tracking-widest" style={{ color: accent }}>Cashed out at {currentMult.toFixed(2)}×</p>
      </div>
    );
  }
  // completed
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: `${accent}1A`, border: `1px solid ${accent}66`, boxShadow: `0 0 24px ${accent}33` }}>
      <Sparkles className="w-4 h-4" style={{ color: accent }} />
      <p className="text-sm font-black uppercase tracking-widest" style={{ color: accent }}>
        Trail Complete! +50% bonus · {(currentMult * 1.5).toFixed(2)}×
      </p>
    </div>
  );
}

function NextMultBar({
  phase, path, currentMult, nextMult, accent, hazardCount,
}: {
  phase: Phase; path: number[]; currentMult: number; nextMult: number; accent: string; hazardCount: number;
}) {
  if (phase !== 'playing' || path.length === 0) {
    return (
      <p className="text-center text-[10px]" style={{ color: '#4A6A55' }}>
        {phase === 'playing'
          ? 'Click any EDGE tile to start your trail'
          : `Trail · ${hazardCount} hazards on a 6×6 grid · cash out anytime`}
      </p>
    );
  }
  const delta = nextMult - currentMult;
  return (
    <p className="text-center text-[10px]" style={{ color: '#8FA899' }}>
      Next safe tile → <span className="font-mono font-bold" style={{ color: accent }}>{nextMult.toFixed(2)}×</span>{' '}
      <span style={{ color: '#4A6A55' }}>(+{delta.toFixed(2)}×)</span>
    </p>
  );
}

function TrailBoard({
  phase, path, hazards, showAll, bustTile, canPlay, onTileClick, accent, accentSec,
}: {
  phase: Phase;
  path: number[];
  hazards: Set<number>;
  showAll: boolean;
  bustTile: number | null;
  canPlay: (i: number) => boolean;
  onTileClick: (i: number) => void;
  accent: string;
  accentSec: string;
}) {
  return (
    <div
      className="grid gap-1.5 sm:gap-2 select-none"
      style={{
        gridTemplateColumns: `repeat(${GRID}, 1fr)`,
        width: '100%',
        maxWidth: 460,
        aspectRatio: '1 / 1',
      }}
    >
      {Array.from({ length: TOTAL }).map((_, idx) => {
        const inPath  = path.includes(idx);
        const pathIdx = path.indexOf(idx);
        const isStart = pathIdx === 0;
        const isLast  = pathIdx === path.length - 1 && phase === 'playing';
        const isBust  = idx === bustTile;
        const revealedHazard = (showAll || isBust) && hazards.has(idx);
        const playable = canPlay(idx);

        // Decide background
        let bg = 'rgba(255,255,255,0.025)';
        let border = '1px solid #1A2E22';
        let text: React.ReactNode = null;
        let glow = 'none';

        if (revealedHazard) {
          bg     = 'linear-gradient(135deg, rgba(239,68,68,0.30), rgba(127,29,29,0.50))';
          border = '1px solid rgba(239,68,68,0.55)';
          text   = <Skull className="w-4 h-4" style={{ color: '#EF4444' }} />;
        } else if (inPath) {
          bg     = `linear-gradient(135deg, ${accent}40, ${accentSec}25)`;
          border = `1px solid ${accent}77`;
          glow   = `0 0 14px ${accent}55, inset 0 0 12px ${accent}22`;
          text   = (
            <span className="text-[10px] font-mono font-black" style={{ color: '#0A1410' }}>
              {pathIdx + 1}
            </span>
          );
        } else if (showAll && !hazards.has(idx)) {
          // Reveal remaining safe tiles dimly after round ends
          bg = 'rgba(45,201,122,0.05)';
          border = '1px solid rgba(45,201,122,0.20)';
        } else if (playable) {
          bg     = `${accent}10`;
          border = `1px dashed ${accent}55`;
        }

        return (
          <motion.button
            key={idx}
            type="button"
            disabled={!playable || phase !== 'playing'}
            onClick={() => onTileClick(idx)}
            initial={false}
            animate={
              isBust ? { scale: [1, 1.2, 1] }
              : inPath ? { scale: [0.85, 1] }
              : { scale: 1 }
            }
            transition={{ duration: 0.25 }}
            className="relative rounded-lg flex items-center justify-center transition-shadow"
            style={{
              background: bg,
              border,
              cursor: playable && phase === 'playing' ? 'pointer' : (phase === 'playing' ? 'not-allowed' : 'default'),
              boxShadow: glow,
              outline: isLast ? `2px solid ${accent}` : 'none',
              outlineOffset: 2,
            }}
            aria-label={`Tile row ${rowOf(idx) + 1} column ${colOf(idx) + 1}`}
          >
            {text}
            {isStart && (
              <span
                className="absolute -top-1 -left-1 w-3 h-3 rounded-full"
                style={{ background: accentSec, boxShadow: `0 0 6px ${accentSec}` }}
                title="Start"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function RecentPlaysList({ accent }: { accent: string }) {
  return (
    <div className="space-y-1">
      {RECENT_PLAYS.map((p, i) => {
        const tierColor = getVIPColor(p.tier);
        return (
          <div
            key={i}
            className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.025] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <YalaAvatar initials={p.avatar} tier={p.tier} size={26} hideBadge />
              <div className="min-w-0">
                <p className="text-[12px] font-bold truncate" style={{ color: tierColor }}>{p.user}</p>
                <p className="text-[9px] font-mono" style={{ color: '#4A6A55' }}>{p.time} ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA899' }}>Bet</p>
                <p className="font-mono font-bold text-[11px]" style={{ color: '#F5E8C8' }}>{p.bet}</p>
              </div>
              <div className="text-right w-12">
                <p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA899' }}>×</p>
                <p className="font-mono font-bold text-[11px]" style={{ color: p.won ? accent : '#EF4444' }}>
                  {p.won ? `${p.mult.toFixed(2)}×` : '—'}
                </p>
              </div>
              <div className="text-right w-16">
                <p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA899' }}>Payout</p>
                <p className="font-mono font-black text-[11px]" style={{ color: p.won ? accent : '#EF4444' }}>
                  {p.won ? `+${p.payout}` : '0'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardList({ accent }: { accent: string }) {
  const max = LEADERBOARD[0].profit;
  return (
    <div className="space-y-2">
      {LEADERBOARD.map((p) => {
        const tierColor = getVIPColor(p.tier);
        const pct = (p.profit / max) * 100;
        return (
          <div key={p.rank} className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="font-mono font-black text-sm w-6 text-center" style={{ color: p.rank <= 3 ? accent : '#8FA899' }}>
              {p.rank}
            </span>
            <YalaAvatar initials={p.avatar} tier={p.tier} size={26} hideBadge />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold truncate" style={{ color: tierColor }}>{p.user}</p>
              <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: '#1A2E22' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${tierColor})` }}
                />
              </div>
            </div>
            <span className="font-mono font-black text-[11px]" style={{ color: accent }}>
              +{formatGC(p.profit)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RulesPanel() {
  const rules = [
    'Pick a difficulty (3, 5, or 8 hazards) and a bet, then press Bet.',
    'Click any EDGE tile on the 6×6 grid to start your trail.',
    'Each next tile MUST be orthogonally adjacent (up / down / left / right) to your last tile. No jumping, no diagonals, no backtracking.',
    'Each safe tile lights up and ticks the multiplier higher. The fewer safe tiles remain, the bigger each next bump.',
    'Hit a hazard and you bust — your bet is lost and the grid reveals.',
    'Cash out at any time to lock in your current multiplier (bet × multiplier paid out).',
    'Reach a tile on the OPPOSITE edge from your start tile for a +50% jackpot bonus.',
  ];
  return (
    <ol className="space-y-2.5 list-decimal list-inside">
      {rules.map((r, i) => (
        <li key={i} className="text-[13px] leading-relaxed" style={{ color: '#F5E8C8' }}>
          <span style={{ color: '#8FA899' }}>{r}</span>
        </li>
      ))}
    </ol>
  );
}

function FairnessPanel({ seed, nonce }: { seed: string; nonce: number }) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-relaxed" style={{ color: '#8FA899' }}>
        Trail uses a provably fair seed. Hazard locations are determined before your first reveal from a hash of (server seed + client seed + nonce). The starting tile is always safe.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}>
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8FA899' }}>Active server seed (hashed)</p>
          <p className="font-mono text-[11px] break-all mt-1" style={{ color: '#F5E8C8' }}>{seed || '—'}</p>
        </div>
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}>
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8FA899' }}>Nonce</p>
          <p className="font-mono text-[11px] mt-1" style={{ color: '#F5E8C8' }}>{nonce}</p>
        </div>
      </div>
      <p className="text-[10px]" style={{ color: '#4A6A55' }}>
        After each round the server seed rotates. Full verification tooling will ship with the production build.
      </p>
    </div>
  );
}
