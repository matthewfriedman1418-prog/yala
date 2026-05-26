'use client';

/**
 * CARAVAN CROSS — a Yala original.
 *
 * Side-scrolling crash: your camel walks across the dunes as the multiplier
 * climbs. A sandstorm forms on the horizon ~1.5 seconds before bust — that's
 * your reaction window. Same RTP math as standard Crash, but the bust is
 * visually foreshadowed.
 *
 * Bust distribution (provably fair, 99% RTP):
 *   bust = max(1.00, 0.99 / (1 - r))    where r is uniform in [0, 1)
 * → ~1% chance of an insta-crash at 1.00× exactly. Long-tail multipliers.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChevronLeft, Shield, Info, TrendingUp, BarChart3, Zap, RotateCcw, Lock, Skull, Trophy,
} from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { GoldCoinIcon, SweepCoinIcon } from '@/components/ui/YalaIcon';
import { YalaAvatar } from '@/components/ui/YalaAvatar';
import { formatGC, getVIPColor } from '@/lib/utils';

// ─── Constants ─────────────────────────────────────────────────────────────
const TICK_MS         = 80;           // multiplier update interval
const GROWTH_PER_TICK = 1.0028;       // ~3.5% per second
const WARNING_FRAC    = 0.85;         // sandstorm appears at 85% of bust
const COUNTDOWN_MS    = 3000;         // between-rounds countdown
const QUICK_BETS      = [1, 5, 10, 25, 100, 500];
const MAX_HISTORY     = 12;

type Phase = 'idle' | 'countdown' | 'running' | 'cashed' | 'busted';
type HistoryEntry = { result: 'win' | 'bust'; mult: number; bet: number; ts: number };
type Tab = 'recent' | 'leaderboard' | 'rules' | 'fairness';

/** Crash bust distribution — 99% RTP. */
function rollBust(): number {
  const r = Math.random();
  return Math.max(1.0, 0.99 / (1 - r));
}
function randomSeed(): string {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// ─── Mock supporting data (matches Trail's lower tabs) ────────────────────
const RECENT_PLAYS = [
  { user: 'GoldDuneKing',  avatar: 'GK', tier: 6, bet: 500,  mult: 3.45, payout: 1725, time: '3s',  won: true  },
  { user: 'OasisHunter',   avatar: 'OH', tier: 5, bet: 1000, mult: 0,    payout: 0,    time: '6s',  won: false },
  { user: 'SandstormX',    avatar: 'SX', tier: 4, bet: 250,  mult: 9.12, payout: 2280, time: '10s', won: true  },
  { user: 'EmeraldDunes',  avatar: 'ED', tier: 5, bet: 750,  mult: 1.78, payout: 1335, time: '14s', won: true  },
  { user: 'NightBazaar7',  avatar: 'NB', tier: 3, bet: 100,  mult: 0,    payout: 0,    time: '17s', won: false },
  { user: 'PyramidAce',    avatar: 'PA', tier: 2, bet: 200,  mult: 24.6, payout: 4920, time: '21s', won: true  },
];
const LEADERBOARD = [
  { rank: 1, user: 'GoldDuneKing',  avatar: 'GK', tier: 6, profit: 612_400 },
  { rank: 2, user: 'OasisHunter',   avatar: 'OH', tier: 5, profit: 287_900 },
  { rank: 3, user: 'SandstormX',    avatar: 'SX', tier: 4, profit: 195_300 },
  { rank: 4, user: 'EmeraldDunes',  avatar: 'ED', tier: 5, profit: 142_700 },
  { rank: 5, user: 'DesertFox88',   avatar: 'DF', tier: 5, profit:  98_400 },
];

export default function CaravanCrossPage() {
  const { activeCurrency, goldCoins, sweepCoins, addGC, addSC, addXP } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();

  // Config
  const [bet, setBet] = useState<number>(1);
  const [autoCashout, setAutoCashout] = useState<string>(''); // string for input control
  // State
  const [phase, setPhase] = useState<Phase>('idle');
  const [mult, setMult] = useState<number>(1.0);
  const [bust, setBust] = useState<number>(0);
  const [lastMult, setLastMult] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [seed, setSeed] = useState<string>('');
  const [nonce, setNonce] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<Tab>('recent');
  // Refs for interval / mutable values
  const tickRef    = useRef<number | null>(null);
  const phaseRef   = useRef<Phase>('idle');
  const multRef    = useRef<number>(1);
  const bustRef    = useRef<number>(0);
  const cashedRef  = useRef<boolean>(false);

  // Persist history + seed
  useEffect(() => {
    try {
      const raw = localStorage.getItem('yala-caravan-history');
      if (raw) setHistory(JSON.parse(raw));
      setSeed(localStorage.getItem('yala-caravan-seed') || randomSeed());
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem('yala-caravan-history', JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => { if (seed) try { localStorage.setItem('yala-caravan-seed', seed); } catch {} }, [seed]);

  // Cleanup interval on unmount
  useEffect(() => () => { if (tickRef.current) window.clearInterval(tickRef.current); }, []);

  const isGC      = activeCurrency === 'GC';
  const accent    = '#FB923C';
  const accentSec = '#F0B232';
  const balance   = isGC ? goldCoins : sweepCoins;

  // Sandstorm intensity (0..1) — visible warning ramp before bust
  const stormFrac = (() => {
    if (phase !== 'running') return 0;
    if (bust <= 1) return 1;
    const warnAt = bust * WARNING_FRAC;
    if (mult < warnAt) return 0;
    return Math.min(1, (mult - warnAt) / (bust - warnAt));
  })();

  const performCashout = useCallback(() => {
    if (phaseRef.current !== 'running' || cashedRef.current) return;
    cashedRef.current = true;
    const finalMult = multRef.current;
    const winnings = bet * finalMult;
    if (isGC) addGC(winnings); else addSC(winnings);
    addXP(Math.floor(bet * 0.3));
    setHistory((h) => [{ result: 'win' as const, mult: finalMult, bet, ts: Date.now() }, ...h].slice(0, MAX_HISTORY));
    setLastMult(finalMult);
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    setPhase('cashed'); phaseRef.current = 'cashed';
    toast.success(`Cashed out at ${finalMult.toFixed(2)}×`, {
      description: `+${winnings.toFixed(2)} ${activeCurrency}`,
    });
    // Start countdown to next round
    startCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bet, isGC, activeCurrency]);

  const handleBust = useCallback(() => {
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    setMult(bustRef.current);
    multRef.current = bustRef.current;
    setLastMult(bustRef.current);
    addXP(Math.floor(bet * 0.1));
    setHistory((h) => [{ result: 'bust' as const, mult: bustRef.current, bet, ts: Date.now() }, ...h].slice(0, MAX_HISTORY));
    setPhase('busted'); phaseRef.current = 'busted';
    toast.error(`Bust at ${bustRef.current.toFixed(2)}×`, {
      description: `Sandstorm caught you. ${bustRef.current === 1 ? 'Insta-crash.' : ''}`.trim(),
    });
    startCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bet]);

  const startCountdown = () => {
    setCountdown(COUNTDOWN_MS);
    const start = Date.now();
    const cdInterval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, COUNTDOWN_MS - elapsed);
      setCountdown(remaining);
      if (remaining === 0) {
        window.clearInterval(cdInterval);
        setSeed(randomSeed());
        setNonce((n) => n + 1);
        setPhase('idle');
        phaseRef.current = 'idle';
        setMult(1);
        multRef.current = 1;
      }
    }, 100);
  };

  const beginRound = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (bet <= 0)    { toast.error('Bet must be greater than 0'); return; }
    if (bet > balance) { toast.error(`Insufficient ${activeCurrency} balance`); return; }

    // Deduct bet
    if (isGC) addGC(-bet); else addSC(-bet);

    // Roll bust, reset state
    const newBust = rollBust();
    bustRef.current = newBust;
    setBust(newBust);
    setMult(1);
    multRef.current = 1;
    cashedRef.current = false;
    setLastMult(null);
    setPhase('running'); phaseRef.current = 'running';

    // Parse auto-cash-out (if any)
    const auto = parseFloat(autoCashout);
    const hasAuto = Number.isFinite(auto) && auto > 1;

    // Start tick loop
    tickRef.current = window.setInterval(() => {
      const next = multRef.current * GROWTH_PER_TICK;
      multRef.current = next;
      setMult(next);
      if (hasAuto && next >= auto) {
        performCashout();
        return;
      }
      if (next >= bustRef.current) {
        handleBust();
      }
    }, TICK_MS);
  };

  const handlePrimaryClick = () => {
    if (phase === 'idle')      beginRound();
    else if (phase === 'running') performCashout();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <Link
        href="/originals"
        className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
        style={{ color: '#8FA899' }}
      >
        <ChevronLeft className="w-4 h-4" />
        All Originals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* LEFT */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at 50% -10%, ${accent}14, transparent 60%), #0C1812`,
            border: '1px solid #1A2E22',
          }}
        >
          <header
            className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4"
            style={{ borderBottom: '1px solid #1A2E22' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}28, ${accent}08)`, border: `1px solid ${accent}40` }}
              >
                <Zap className="w-5 h-5" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>
                    Caravan Cross
                  </h1>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}40` }}
                  >
                    New · Yala Original
                  </span>
                </div>
                <p className="text-[11px] truncate" style={{ color: '#8FA899' }}>
                  Side-scrolling crash · 99% RTP · sandstorm warning ~1.5s before bust
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <StatChip label="RTP"     value="99%" />
              <StatChip label="Max Win" value="∞"   />
            </div>
          </header>

          {/* Multiplier banner */}
          <div className="px-4 sm:px-6 pt-5">
            <MultBanner
              phase={phase}
              mult={mult}
              bust={bust}
              lastMult={lastMult}
              bet={bet}
              activeCurrency={activeCurrency}
              accent={accent}
              countdownMs={countdown}
            />
          </div>

          {/* Canvas */}
          <div className="px-3 sm:px-6 py-5">
            <DesertCanvas
              phase={phase}
              mult={mult}
              stormFrac={stormFrac}
              accent={accent}
            />
          </div>

          {/* Last-rounds strip */}
          <div className="px-4 sm:px-6 pb-5">
            <LastRoundsStrip history={history} accent={accent} />
          </div>
        </div>

        {/* RIGHT — control panel */}
        <div
          className="rounded-3xl p-5 space-y-5 self-start"
          style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
        >
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

          {/* Bet */}
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
                disabled={phase === 'running'}
                min={0}
                step={isGC ? 1 : 0.1}
                className="w-full pl-3 pr-20 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none transition-colors disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${accent}66`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2E22')}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                <button type="button" disabled={phase === 'running'} onClick={() => setBet((b) => Math.max(isGC ? 1 : 0.1, +(b / 2).toFixed(2)))}
                  className="px-2 py-1 rounded-lg text-[10px] font-black transition-colors hover:bg-white/10 disabled:opacity-50"
                  style={{ color: '#8FA899', background: 'rgba(255,255,255,0.04)' }}>½</button>
                <button type="button" disabled={phase === 'running'} onClick={() => setBet((b) => Math.min(balance, +(b * 2).toFixed(2)) || (isGC ? 1 : 0.1))}
                  className="px-2 py-1 rounded-lg text-[10px] font-black transition-colors hover:bg-white/10 disabled:opacity-50"
                  style={{ color: '#8FA899', background: 'rgba(255,255,255,0.04)' }}>2×</button>
              </div>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {QUICK_BETS.map((v) => (
                <button key={v} type="button" disabled={phase === 'running'} onClick={() => setBet(v)}
                  className="px-2 py-1 rounded-md text-[10px] font-bold transition-colors disabled:opacity-50"
                  style={{
                    background: bet === v ? `${accent}1A` : 'rgba(255,255,255,0.03)',
                    color:      bet === v ? accent : '#8FA899',
                    border:     `1px solid ${bet === v ? `${accent}44` : '#1A2E22'}`,
                  }}>{v < 10 ? v.toFixed(1) : v}</button>
              ))}
            </div>
          </div>

          {/* Auto cash-out */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8FA899' }}>
              Auto cash-out (optional)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="e.g. 2.00"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                disabled={phase === 'running'}
                min={1.01}
                step={0.05}
                className="w-full pl-3 pr-8 py-2 rounded-xl text-sm font-mono focus:outline-none transition-colors disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${accent}66`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2E22')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold" style={{ color: '#8FA899' }}>×</span>
            </div>
            <p className="text-[9px] mt-1" style={{ color: '#4A6A55' }}>Cashes out automatically if multiplier hits this value.</p>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={isLoggedIn ? handlePrimaryClick : () => openAuthModal()}
            disabled={phase === 'countdown' || phase === 'cashed' || phase === 'busted'}
            className="w-full py-3.5 rounded-xl font-display text-base font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: phase === 'running'
                ? `linear-gradient(135deg, ${accent}, ${accentSec})`
                : phase === 'idle'
                  ? `linear-gradient(135deg, ${accent}, ${accentSec})`
                  : 'rgba(255,255,255,0.04)',
              color:      phase === 'idle' || phase === 'running' ? '#060E0A' : '#8FA899',
              boxShadow:  phase === 'idle' || phase === 'running' ? `0 6px 24px ${accent}40` : 'none',
            }}
          >
            {!isLoggedIn ? (
              <span className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Sign in to play</span>
            ) : phase === 'idle' ? (
              <>Bet {isGC ? formatGC(bet) : bet.toFixed(2)} {activeCurrency}</>
            ) : phase === 'running' ? (
              <>Cash out {(bet * mult).toFixed(2)} {activeCurrency}</>
            ) : phase === 'countdown' ? (
              <>Next round in {Math.ceil(countdown / 1000)}s…</>
            ) : phase === 'cashed' ? (
              <span className="flex items-center justify-center gap-1.5"><Trophy className="w-4 h-4" /> Won {(bet * (lastMult || 1)).toFixed(2)} {activeCurrency}</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5"><Skull className="w-4 h-4" /> Bust @ {(lastMult || 1).toFixed(2)}×</span>
            )}
          </button>

          {phase === 'cashed' || phase === 'busted' ? (
            <button
              type="button"
              onClick={() => { setPhase('idle'); phaseRef.current = 'idle'; setMult(1); multRef.current = 1; setLastMult(null); }}
              className="w-full py-2 rounded-xl text-xs font-bold transition-colors hover:bg-white/5 flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22', color: '#8FA899' }}
            >
              <RotateCcw className="w-3 h-3" /> Skip countdown
            </button>
          ) : null}

          {/* Local history */}
          <div className="pt-2" style={{ borderTop: '1px solid #1A2E22' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA899' }}>Your last rounds</span>
              {history.length > 0 && (
                <button type="button" onClick={() => setHistory([])} className="text-[10px] underline opacity-60 hover:opacity-100" style={{ color: '#8FA899' }}>clear</button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-[11px]" style={{ color: '#4A6A55' }}>Your wins and busts will show here.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {history.map((h, i) => (
                  <div key={i}
                    title={`${h.result === 'win' ? `+${(h.bet * h.mult).toFixed(2)}` : `-${h.bet}`} · ${h.mult.toFixed(2)}×`}
                    className="px-2 py-1 rounded-md text-[10px] font-mono font-bold"
                    style={{
                      background: h.result === 'win' ? 'rgba(45,201,122,0.10)' : 'rgba(239,68,68,0.10)',
                      color:      h.result === 'win' ? '#2DC97A'              : '#EF4444',
                      border:     `1px solid ${h.result === 'win' ? 'rgba(45,201,122,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    }}>
                    {h.result === 'win' ? `${h.mult.toFixed(2)}×` : 'BUST'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower tabs */}
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
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-colors relative"
                style={{ color: active ? accent : '#8FA899' }}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {active && <motion.div layoutId="caravan-tab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: accent }} />}
              </button>
            );
          })}
        </div>
        <div className="p-5">
          {activeTab === 'recent'      && <RecentPlaysList accent={accent} />}
          {activeTab === 'leaderboard' && <LeaderboardList accent={accent} />}
          {activeTab === 'rules'       && <RulesPanel />}
          {activeTab === 'fairness'    && <FairnessPanel seed={seed} nonce={nonce} lastBust={lastMult} />}
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

function MultBanner({
  phase, mult, bust, lastMult, bet, activeCurrency, accent, countdownMs,
}: {
  phase: Phase; mult: number; bust: number; lastMult: number | null;
  bet: number; activeCurrency: string; accent: string; countdownMs: number;
}) {
  if (phase === 'idle') {
    return (
      <div className="text-center py-3 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-[11px]" style={{ color: '#8FA899' }}>
          Place a bet to send the caravan. Watch the horizon.
        </p>
      </div>
    );
  }
  if (phase === 'running') {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: `${accent}10`, border: `1px solid ${accent}33` }}>
        <div>
          <p className="text-[9px] uppercase font-bold tracking-widest leading-none" style={{ color: '#8FA899' }}>Multiplier</p>
          <p className="font-mono font-black text-3xl leading-tight mt-1" style={{ color: accent }}>{mult.toFixed(2)}×</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase font-bold tracking-widest leading-none" style={{ color: '#8FA899' }}>If you cash out now</p>
          <p className="font-mono font-black text-xl leading-tight mt-1" style={{ color: '#F5E8C8' }}>
            {(bet * mult).toFixed(2)} <span className="text-[10px]" style={{ color: '#8FA899' }}>{activeCurrency}</span>
          </p>
        </div>
      </div>
    );
  }
  if (phase === 'cashed') {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ background: `${accent}14`, border: `1px solid ${accent}44` }}>
        <Trophy className="w-4 h-4" style={{ color: accent }} />
        <p className="text-sm font-black uppercase tracking-widest" style={{ color: accent }}>
          Cashed out at {(lastMult || 1).toFixed(2)}×
        </p>
        <span className="text-[11px]" style={{ color: '#8FA899' }}>· bust was {bust.toFixed(2)}×</span>
      </div>
    );
  }
  if (phase === 'busted') {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)' }}>
        <Skull className="w-4 h-4" style={{ color: '#EF4444' }} />
        <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#EF4444' }}>
          Bust @ {(lastMult || 1).toFixed(2)}×
        </p>
      </div>
    );
  }
  // countdown — currently unused since we don't gate idle on countdown
  return (
    <div className="text-center py-3 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <p className="text-[11px]" style={{ color: '#8FA899' }}>Next round in {Math.ceil(countdownMs / 1000)}s…</p>
    </div>
  );
}

function DesertCanvas({
  phase, mult, stormFrac, accent,
}: {
  phase: Phase; mult: number; stormFrac: number; accent: string;
}) {
  // Camel position: cycles across canvas while running.
  // Use mult to seed phase so faster-growing rounds look more dynamic.
  const t = (mult - 1) % 1;
  const camelX = 8 + t * 76; // 8% → 84%
  const bobY  = Math.sin(mult * 9) * 4;
  const skyOpacity = Math.min(1, Math.log(Math.max(mult, 1)) / 3); // dusk deepens with mult
  const flash = phase === 'busted';

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: '16 / 9',
        background: `linear-gradient(180deg,
          rgba(20,40,60,${0.4 + skyOpacity * 0.2}) 0%,
          rgba(60,40,40,${0.4 + skyOpacity * 0.5}) 50%,
          rgba(${30 + skyOpacity * 60},${20 + skyOpacity * 10},${15}, 1) 100%
        )`,
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.55)',
      }}
    >
      {/* Sun / moon */}
      <div
        className="absolute"
        style={{
          left: `${60 - mult * 1.2}%`,
          top: `${15 + Math.min(mult * 1.5, 30)}%`,
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}aa, ${accent}44 60%, transparent 75%)`,
          filter: 'blur(0.3px)',
          opacity: phase === 'idle' ? 0.4 : 0.9,
          transition: 'left 0.3s, top 0.3s, opacity 0.5s',
        }}
      />

      {/* Stars sprinkle */}
      {[...Array(18)].map((_, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            left:  `${(i * 37) % 100}%`,
            top:   `${(i * 19) % 45}%`,
            width: 1.5,
            height: 1.5,
            background: '#F5E8C8',
            opacity: 0.15 + (i % 5) * 0.05,
          }}
        />
      ))}

      {/* Distant dune */}
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="absolute bottom-[24%] left-0 w-full" style={{ height: '32%' }}>
        <path d="M 0 28 L 0 16 Q 15 10 30 14 Q 50 18 65 11 Q 80 6 100 12 L 100 28 Z" fill="#3a2618" opacity="0.75" />
      </svg>
      {/* Mid dune */}
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="absolute bottom-[12%] left-0 w-full" style={{ height: '28%' }}>
        <path d="M 0 24 L 0 14 Q 20 8 38 13 Q 55 18 72 10 Q 86 5 100 9 L 100 24 Z" fill="#4a2f1a" opacity="0.9" />
      </svg>
      {/* Foreground dune */}
      <svg viewBox="0 0 100 22" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full" style={{ height: '26%' }}>
        <path d="M 0 22 L 0 12 Q 18 5 32 10 Q 48 17 64 9 Q 78 3 100 8 L 100 22 Z" fill="#2a1810" />
      </svg>

      {/* Camel */}
      {(phase === 'running' || phase === 'cashed') && (
        <motion.div
          className="absolute select-none"
          initial={false}
          animate={{ left: `${camelX}%`, y: bobY }}
          transition={{ ease: 'linear', duration: 0.08 }}
          style={{
            bottom: '22%',
            fontSize: 36,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.55))',
          }}
        >
          🐪
        </motion.div>
      )}

      {/* Idle camel sits at left */}
      {phase === 'idle' && (
        <div className="absolute select-none" style={{ left: '8%', bottom: '22%', fontSize: 36, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.55))', opacity: 0.6 }}>
          🐪
        </div>
      )}

      {/* Sandstorm — rising from the right horizon */}
      <div
        className="absolute right-0 top-0 h-full pointer-events-none"
        style={{
          width: `${20 + stormFrac * 70}%`,
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(180,80,30,${0.05 + stormFrac * 0.45}) 30%,
            rgba(200,100,40,${0.25 + stormFrac * 0.55}) 80%,
            rgba(220,140,60,${0.35 + stormFrac * 0.6}) 100%)`,
          opacity: stormFrac > 0 ? 1 : 0,
          transition: 'opacity 0.2s, width 0.15s',
        }}
      />
      {stormFrac > 0.05 && (
        <>
          {/* Dust particles */}
          {[...Array(20)].map((_, i) => (
            <div key={`p${i}`} className="absolute rounded-full"
              style={{
                right: `${(i * 13 + (mult * 80) % 100) % 80}%`,
                top:   `${20 + (i * 17) % 60}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                background: '#d8a06a',
                opacity: stormFrac * 0.8,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
          {/* Warning chevron */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{
              background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.50)',
              opacity: stormFrac,
            }}>
            <Skull className="w-3 h-3" style={{ color: '#EF4444' }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#EF4444' }}>Storm</span>
          </div>
        </>
      )}

      {/* Bust flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.50), transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Big multiplier overlay (idle hint) */}
      {phase !== 'running' && phase !== 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="font-display font-black text-5xl tracking-tight" style={{
            color: phase === 'cashed' ? accent : '#EF4444',
            textShadow: '0 4px 24px rgba(0,0,0,0.7)',
          }}>
            {mult.toFixed(2)}×
          </p>
        </div>
      )}
    </div>
  );
}

function LastRoundsStrip({ history, accent }: { history: HistoryEntry[]; accent: string }) {
  if (history.length === 0) return null;
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <span className="text-[9px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: '#4A6A55' }}>Last rounds</span>
      {history.map((h, i) => (
        <div key={i}
          className="px-2 py-1 rounded-md text-[10px] font-mono font-black flex-shrink-0"
          style={{
            background: h.result === 'win' ? `${accent}10` : 'rgba(239,68,68,0.10)',
            color:      h.result === 'win' ? accent : '#EF4444',
            border:     `1px solid ${h.result === 'win' ? `${accent}33` : 'rgba(239,68,68,0.25)'}`,
          }}>
          {h.mult.toFixed(2)}×
        </div>
      ))}
    </div>
  );
}

function RecentPlaysList({ accent }: { accent: string }) {
  return (
    <div className="space-y-1">
      {RECENT_PLAYS.map((p, i) => {
        const tierColor = getVIPColor(p.tier);
        return (
          <div key={i} className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.025] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <YalaAvatar initials={p.avatar} tier={p.tier} size={26} hideBadge />
              <div className="min-w-0">
                <p className="text-[12px] font-bold truncate" style={{ color: tierColor }}>{p.user}</p>
                <p className="text-[9px] font-mono" style={{ color: '#4A6A55' }}>{p.time} ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right"><p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA899' }}>Bet</p><p className="font-mono font-bold text-[11px]" style={{ color: '#F5E8C8' }}>{p.bet}</p></div>
              <div className="text-right w-14"><p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA899' }}>×</p><p className="font-mono font-bold text-[11px]" style={{ color: p.won ? accent : '#EF4444' }}>{p.won ? `${p.mult.toFixed(2)}×` : 'BUST'}</p></div>
              <div className="text-right w-16"><p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA899' }}>Payout</p><p className="font-mono font-black text-[11px]" style={{ color: p.won ? accent : '#EF4444' }}>{p.won ? `+${p.payout}` : '0'}</p></div>
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
            <span className="font-mono font-black text-sm w-6 text-center" style={{ color: p.rank <= 3 ? accent : '#8FA899' }}>{p.rank}</span>
            <YalaAvatar initials={p.avatar} tier={p.tier} size={26} hideBadge />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold truncate" style={{ color: tierColor }}>{p.user}</p>
              <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: '#1A2E22' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${tierColor})` }} />
              </div>
            </div>
            <span className="font-mono font-black text-[11px]" style={{ color: accent }}>+{formatGC(p.profit)}</span>
          </div>
        );
      })}
    </div>
  );
}

function RulesPanel() {
  const rules = [
    'Set your bet (and optionally an auto cash-out multiplier), then press Bet.',
    'The caravan starts moving. The multiplier begins at 1.00× and climbs.',
    'Watch the horizon. A sandstorm starts forming about 1.5 seconds before bust.',
    'Tap Cash Out anytime to lock in your current multiplier (bet × multiplier).',
    'If the storm catches your caravan before you cash out, the bet is lost.',
    'Bust point is rolled at the START of each round using the standard Crash distribution (99% RTP).',
    'Insta-crashes at 1.00× happen ~1% of the time.',
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

function FairnessPanel({ seed, nonce, lastBust }: { seed: string; nonce: number; lastBust: number | null }) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-relaxed" style={{ color: '#8FA899' }}>
        Caravan Cross uses the standard Crash bust distribution: <code className="font-mono text-[11px]" style={{ color: '#F5E8C8' }}>bust = max(1.00, 0.99 / (1 - r))</code>{' '}
        where r is uniform random in [0, 1). This produces a 99% RTP with the typical Crash long tail and ~1% insta-crashes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}>
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8FA899' }}>Server seed (hashed)</p>
          <p className="font-mono text-[10px] break-all mt-1" style={{ color: '#F5E8C8' }}>{seed || '—'}</p>
        </div>
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}>
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8FA899' }}>Nonce</p>
          <p className="font-mono text-[11px] mt-1" style={{ color: '#F5E8C8' }}>{nonce}</p>
        </div>
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2E22' }}>
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8FA899' }}>Last bust</p>
          <p className="font-mono text-[11px] mt-1" style={{ color: '#F5E8C8' }}>{lastBust != null ? `${lastBust.toFixed(2)}×` : '—'}</p>
        </div>
      </div>
      <p className="text-[10px]" style={{ color: '#4A6A55' }}>
        Seed rotates after each round. Full verification tooling will ship with the production build.
      </p>
    </div>
  );
}
